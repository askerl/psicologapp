import _ from 'lodash';
import moment from 'moment';
import { pacientePrivado, pacientePrepaga, prepagas, estadosPaciente } from '../config/constants';
import { mailHabilitados } from '../config/firebaseConfig';
import db from '../fire';

// ---------------------- SESSION HANDLER --------------------------------

export const getSession = (key) => {
    if (key === 'pacientes' || key === 'sesiones') {
        return JSON.parse(localStorage.getItem(key));
    }
    return localStorage.getItem(key);
}

export const setSession = (key, value) => {
    if (key === 'pacientes' || key === 'sesiones') {
        value = JSON.stringify(value);
    }
    return localStorage.setItem(key, value);
}

export const removeSession = (key) => {
    return localStorage.removeItem(key);
}

// clears session in storage
export const clearSession = () => {
    removeSession('pacientes');
    removeSession('sesiones');
    removeSession('filtroEstado');
}

export const removeSessionSesionesMes = (mes, anio) => {
    let sesionesStorage = getSession('sesiones') || {};
    const key = `${mes}-${anio}`;
    delete sesionesStorage[key];
    setSession('sesiones', sesionesStorage);
}

// ---------------------- COMMON FUNCTIONS --------------------------------

export const arrayRemoveDuplicates = (arr) => {
    let unique_array = Array.from(new Set(arr))
    return unique_array
}

export const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export const percentage = (value, total) => {
    return total > 0 ? round(value / total * 100, 2) : 0;
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

// ---------------------- DASHBOARD --------------------------------

export const getEstadisticas = () => {
    let promise = new Promise( (resolve, reject) => {
        
        let data = {
            total: 0,
            activos: 0,
            inactivos: 0,
            privados: 0,
            obraSocial: 0,
            privadosActivos: 0,
            obraSocialActivos: 0
        }
        // initialize prepagas counters
        data.prepagas = prepagas;
        data.prepagas.forEach( i => {
            data[i.id] = 0;
        });

        // con GET Pacientes
        getPacientes().then( pacientes => {
            pacientes.forEach( pac => {
                data.total += 1;
                pac.activo ? data.activos += 1 : data.inactivos += 1;
                switch (pac.tipo) {
                    case pacientePrepaga:
                        data.obraSocial += 1;
                        if (pac.activo) {
                            data.obraSocialActivos += 1 ;
                            data[pac.prepaga] += 1;
                        }
                        break;
                    case pacientePrivado:
                        data.privados += 1;
                        if (pac.activo) data.privadosActivos += 1 ;
                        break;
                }
            });
            // percentages
            data.porcActivos = percentage(data.activos, data.total);
            data.porcInactivos = percentage(data.inactivos, data.total);
    
            // porcentajes activos
            data.porcPrivados = percentage(data.privadosActivos, data.activos);
            data.porcObrasocial = percentage(data.obraSocialActivos, data.activos);
    
            data.prepagas.forEach( i => {
                i.porc = percentage(data[i.id], data.obraSocialActivos);
            });
    
            resolve(data);
        });

    });
    return promise;

}

// ---------------------- PACIENTES --------------------------------

export const getPaciente = (id) => {
    let promise = new Promise( (resolve, reject) => {
        getPacientes().then( pacientes => {
            let paciente = _.find(pacientes, {'id': id});           
            resolve(paciente);
        });
    });
    return promise;
}

export const getSesionesPaciente = (id) => {
    let promise = new Promise( (resolve, reject) => {
        db.collection("sesiones").where("paciente","==",id).orderBy("fecha","asc").get().then( querySnapshot => {
            let sesiones = [], nro = 1;
            querySnapshot.docs.forEach( doc => {
                let sesion = doc.data();
                sesion.id = doc.id;
                sesion.nro = nro++;
                sesion.evolucion = sesion.evolucion || '';
                sesiones.push(sesion);
            });
            resolve(sesiones);
        });
    });
    return promise;
}

export const getPacientes = () => {
    let promise = new Promise( (resolve, reject) => {

        // chequeo si ya tengo pacientes cargados en sesion (cache)
        let pacientes = getSession('pacientes');

        if (pacientes) {
            console.log('Pacientes cache', pacientes);
            resolve(pacientes);
        } else {
            console.log('Pacientes DB', pacientes);
            db.collection("pacientes").orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
                let result = loadPacientes(querySnapshot);
                // almaceno pacientes en sesion para cache
                setSession('pacientes',result);
                resolve(result);
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
        // datos para options en select
        paciente.value = paciente.id;
        paciente.label = paciente.nombreCompleto;		
        // agrego paciente a la colección final
        pacientes.push(paciente);
    });
    // devuelvo resultado
    return pacientes;	
}

export const borrarPaciente = (id) => {
    let promise = new Promise( (resolve, reject) => {
        // Get a new write batch
		let batch = db.batch();                
        
        // borro paciente
        let refPaciente = db.collection("pacientes").doc(id);
        batch.delete(refPaciente);

        // borro sesiones del paciente
        db.collection("sesiones").where("paciente","==",id).get().then( querySnapshot => {
            querySnapshot.docs.forEach( doc => {
                // elimino sesiones del paciente
                batch.delete(doc.ref);
            });
            //Commit the batch
            batch.commit().then( () => {
                resolve()
            }).catch( error => {
                reject(error);
            });
        });
        
    });
    return promise;
}

export const filterPacientesEstado = (pacientes, estado) => {
    if (!estado || estado === estadosPaciente[0].value) {
        // no aplicó filtro, devuelvo todos
        return pacientes;
    } else { //si filtro por algun estado
        let activo = estado === 'A';
        return _.filter(pacientes, {'activo': activo});
    }
}

export const calcPorcentajesSesiones = (sesionesAut, sesiones) => {
    let porcUsadas = sesionesAut > 0 ? sesiones / sesionesAut * 100 : 0;
    let porcRestantes = sesionesAut > 0 ? (sesionesAut - sesiones)/ sesionesAut * 100 : 0 ;
    return {porcUsadas, porcRestantes};
}

// ---------------------- SESIONES --------------------------------

export const getSesionesMes = (mes, anio) => {
    let promise = new Promise( (resolve, reject) => {

        let sesionesStorage = getSession('sesiones') || {};
        const key = `${mes}-${anio}`;
        let sesionesMes = _.get(sesionesStorage, key);
        if (sesionesMes) {
            console.log('Sesiones ' + key + ' cache', sesionesMes);
            resolve(sesionesMes);
        } else {
            console.log('Sesiones ' + key + ' DB', sesionesStorage);
            getPacientes().then( pacientes => {
                db.collection("sesiones")
                .where("mes","==",parseInt(mes))
                .where("anio","==",parseInt(anio))		
                .orderBy("dia","desc")
                .get().then( querySnapshot => {
                    let sesiones = [];
                    querySnapshot.docs.forEach( doc => {            
                        let sesion = doc.data();
                        sesion.id = doc.id;
                        sesion.fecha = sesion.fecha.seconds;
                        let paciente = _.find(pacientes, {'id': sesion.paciente});
                        sesion.nombreCompleto = paciente.nombreCompleto;
                        sesion.credencial = paciente.credencial;
                        sesiones.push(sesion);
                    });
                    sesionesStorage[key] = sesiones;
                    setSession('sesiones',sesionesStorage);
                    resolve(sesiones);
                });
            });
        }
    });
    return promise;
}

export const updateEvolucionSesion = (idSesion, newValue) => {
    let promise = new Promise( (resolve, reject) => {
        db.collection("sesiones").doc(idSesion).update({evolucion: newValue}).then(() => {
            resolve(); 
        }).catch( error => {
            reject(error);
        });
    });
    return promise;
}

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
