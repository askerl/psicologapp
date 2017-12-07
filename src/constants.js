import db from './fire';
import moment from 'moment';
moment.locale("es");

export const tipoPaciente = [
    { key: "O", name: "Obra social"},
    { key: "P", name: "Privado"}
];

export const pacientePrepaga = tipoPaciente[0].key; // código para obra social
export const pacientePrivado = tipoPaciente[1].key; // código para paciente privado

let auxfiltroTipoPaciente = {};
auxfiltroTipoPaciente[pacientePrepaga] = tipoPaciente[0].name;
auxfiltroTipoPaciente[pacientePrivado] = tipoPaciente[1].name;
export const filtroTipoPaciente = auxfiltroTipoPaciente;

export const errores = {
    nombreVacio: "Ingrese el nombre",
    apellidoVacio: "Ingrese el apellido",
    tipoPacienteVacio: "Seleccione el tipo",
    valorConsultaVacio: "Ingrese el valor de la consulta",
    prepagaVacia: "Seleccione la prepaga",
    pagoPrepagaVacio: "Seleccione el pago",
    errorGuardar: "Ocurrió un error al guardar los datos",
    errorBorrar: "Ocurrió un error al borrar los datos",
    fechaVacia: "Ingrese la fecha",
    pacientesVacios: "Seleccione algún paciente",
    sesionesVacias: "Seleccione alguna sesión"
}

export const tipoLoader = "ball-scale-ripple-multiple";

export const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const calcPorcentajesSesiones = (sesionesAut, sesiones) => {
    let porcUsadas = sesionesAut > 0 ? sesiones / sesionesAut * 100 : 0;
    let porcRestantes = sesionesAut > 0 ? (sesionesAut - sesiones)/ sesionesAut * 100 : 0 ;
    return {porcUsadas, porcRestantes};
}

export const cargarPrepagas = () => {
    let promise = new Promise( (resolve, reject) => {
        let prepagas = [], filtroPrepagas = {}, prepagasById = {};
        if (window.prepagas && window.filtroPrepagas){
            resolve(console.log('variables from cache', window.prepagas, window.filtroPrepagas));
        } else {
            // query database
            db.collection("prepagas").get().then( querySnapshot => {
                querySnapshot.docs.forEach( doc => {            
                    let prepaga = doc.data();
                    prepaga.id = doc.id;          
                    prepagas.push(prepaga);
                    filtroPrepagas[prepaga.id] = prepaga.nombre;
                    prepagasById[prepaga.id] = prepaga;
                });
                window.prepagas = prepagas;
                window.filtroPrepagas = filtroPrepagas;
                window.prepagasById = prepagasById;
                resolve(console.log('cargo variables en window', window.prepagas, window.filtroPrepagas, window.prepagasById));
            });
        }
    });
    return promise;
}    

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
            window.pacientesMap = pacientes;
            resolve(console.log('cargo map de pacientes en window', window.pacientesMap));
        });
    });
    return promise;
}

// table formatters

export const tipoFormatter = (cell, row) => {
    let badge;
    switch (cell) {
        case pacientePrivado:
            badge = `<span class="badge badge-warning">${filtroTipoPaciente[pacientePrivado]}</span>`;
            break;
        case pacientePrepaga:
            badge = `<span class="badge badge-primary">${filtroTipoPaciente[pacientePrepaga]}</span>`;
            break;
    }
    return badge;
}

export const priceFormatter = (cell, row) => {
    let val = cell ? `<i class="fa fa-usd"></i> ${cell}` : '';
    return val;
}

export const prepagaFormatter = (cell, row) => {
    return window.filtroPrepagas[cell];
}

export const dateFormatter = (cell, row) => {
    let fecha = moment(cell).format('L');
    return fecha;
}
