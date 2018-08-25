import _ from 'lodash';
import moment from 'moment';
import { pacientePrepaga } from '../config/constants';
import { mailHabilitados } from '../config/firebaseConfig';
import db from '../fire';

// ---------------------- COMMON FUNCTIONS --------------------------------

export const arrayRemoveDuplicates = (arr) => {
    let unique_array = Array.from(new Set(arr))
    return unique_array
}

export const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// convert Hex to RGBA
export const convertHex = (hex, opacity) => {
	hex = hex.replace('#', '');
	var r = parseInt(hex.substring(0, 2), 16);
	var g = parseInt(hex.substring(2, 4), 16);
	var b = parseInt(hex.substring(4, 6), 16);
  
	var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
	return result;
}

export const formatMonth = (month, format) => {
    return moment(`${month}`, 'M').format(format);
}

// ---------------------- LOGIN --------------------------------

export const isHabilitado = (email) =>{
    return _.indexOf(mailHabilitados, email) !== -1;
}

// ---------------------- PACIENTES --------------------------------

export const pacientesMap = () => {
    let promise = new Promise( (resolve, reject) => {
        let pacientes = [];
        // query database
        db.collection("pacientes").get().then( querySnapshot => {
            querySnapshot.docs.forEach( doc => {            
                let paciente = doc.data();
                paciente.id = doc.id;
                paciente.nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;          
                pacientes[paciente.id] = paciente;                
            });
            resolve(setPacientesWindow(pacientes));
        });
    });
    return promise;
}

export const getPacientes = (estado) => {
    let promise = new Promise( (resolve, reject) => {
        
        if (estado === 'T') { // filtro por TODOS
            db.collection("pacientes").orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
                resolve(loadPacientes(querySnapshot));
            });	
        } else { // filtro por algún estado ACTIVO/INACTIVO
            let activo = estado === 'A';
            db.collection("pacientes").where('activo','==',activo).orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
                resolve(loadPacientes(querySnapshot));
            });	
        }

    });
    return promise;
}

function loadPacientes(querySnapshot) {
    let pacientes = [];
    querySnapshot.docs.forEach( doc => {            
        let paciente = doc.data();
        paciente.id = doc.id;
        if (paciente.tipo === pacientePrepaga) {
            paciente.sesionesRestantes = paciente.sesionesAut ? (paciente.sesionesAut - paciente.sesiones) : '';
            let porcs = calcPorcentajesSesiones(paciente.sesionesAut, paciente.sesiones);
            paciente.porcRestantes = porcs.porcRestantes;
        }
        paciente.nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;
        let fchNacMoment = moment(paciente.fchNac, 'DD/MM/YYYY');
        paciente.edad = fchNacMoment.isValid() ? moment().diff(fchNacMoment, 'years') : 0;
        pacientes.push(paciente);
    });
    //console.log('pacientes', pacientes);	
    return pacientes;	
}

function setPacientesWindow(pacientes) {
    window.pacientesMap = pacientes;
}

export const calcPorcentajesSesiones = (sesionesAut, sesiones) => {
    let porcUsadas = sesionesAut > 0 ? sesiones / sesionesAut * 100 : 0;
    let porcRestantes = sesionesAut > 0 ? (sesionesAut - sesiones)/ sesionesAut * 100 : 0 ;
    return {porcUsadas, porcRestantes};
}

// ---------------------- SESIONES --------------------------------

export const createFechaSesion = (value) =>{
    let fecha = moment(value);
    let dia = fecha.date(), mes = fecha.month()+1, anio = fecha.year(); 
    return {
        fechaTS: new Date(anio, mes-1, dia),
        dia,
        mes,
        anio
    }
}

export const getColorPorcentaje = (p) => {
    let color;
    if (p > 50) {
        color = "success";
    } else if (p > 10) {
        color = "warning";
    } else {
        color = "danger";
    }
    return color;
}
