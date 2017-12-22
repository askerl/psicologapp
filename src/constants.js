import db from './fire';
import moment from 'moment';
import Facturaciones from './views/Facturaciones/Facturaciones';
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


export const prepagasById = {
    "galeno": {
        nombre: "Galeno",
        pagos: [15, 175, 452.36]
    },
    "ososs": {
        nombre: "OSOSS",
        pagos: [230]
    },
    "ospacp": {
        nombre: "O.S.P.A.C.P",
        pagos: [230]
    }
}
// armo arrays auxiliares para filtrar y cargar combos
let auxfiltroPrepagas = {}, auxprepagas = [];
for (const prop in prepagasById) {
    let prepaga = prepagasById[prop];
    prepaga.id = prop; 
    auxfiltroPrepagas[prop] = prepaga.nombre;
    auxprepagas.push(prepaga);
}
export const filtroPrepagas = auxfiltroPrepagas;
export const prepagas = auxprepagas;


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
    sesionesVacias: "Seleccione alguna sesión",
    periodoInvalido: "Debe seleccionar un período válido"
}

export const tipoLoader = "ball-scale-ripple-multiple";

export const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const arrayRemoveDuplicates = (arr) => {
    let unique_array = Array.from(new Set(arr))
    return unique_array
}

export const calcPorcentajesSesiones = (sesionesAut, sesiones) => {
    let porcUsadas = sesionesAut > 0 ? sesiones / sesionesAut * 100 : 0;
    let porcRestantes = sesionesAut > 0 ? (sesionesAut - sesiones)/ sesionesAut * 100 : 0 ;
    return {porcUsadas, porcRestantes};
}

// export const cargarPrepagas = () => {
//     let promise = new Promise( (resolve, reject) => {
//         let prepagas = [], filtroPrepagas = {}, prepagasById = {};
//         if (window.prepagas && window.filtroPrepagas){
//             resolve(console.log('variables from cache', window.prepagas, window.filtroPrepagas));
//         } else {
//             // query database
//             db.collection("prepagas").get().then( querySnapshot => {
//                 querySnapshot.docs.forEach( doc => {            
//                     let prepaga = doc.data();
//                     prepaga.id = doc.id;          
//                     prepagas.push(prepaga);
//                     filtroPrepagas[prepaga.id] = prepaga.nombre;
//                     prepagasById[prepaga.id] = prepaga;
//                 });
//                 window.prepagas = prepagas;
//                 window.filtroPrepagas = filtroPrepagas;
//                 window.prepagasById = prepagasById;
//                 resolve(console.log('cargo variables en window', window.prepagas, window.filtroPrepagas, window.prepagasById));
//             });
//         }
//     });
//     return promise;
// }    

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

// calculo de facturaciones

export const getFacturacionesPeriodo = (mesIni, anioIni, mesFin, anioFin) => {

    // armo fechas del período
    let desde = new Date(anioIni, mesIni-1, 1); // 1/mesIni/anioIni
	let hasta = new Date(anioFin, mesFin, 1); // 1/mesFin+1/anioFin

    let promise = new Promise( (resolve, reject) => {
        // query database
        db.collection("sesiones")
		.where("fecha",">=",desde).where("fecha","<",hasta)
		.orderBy("fecha","asc")
		.get().then( querySnapshot => {
			resolve(armarFacturaciones(querySnapshot.docs))
		});
    });
    return promise;
}

function armarFacturaciones(data) {
    let sesiones = [];
    data.forEach( doc => {
        let sesion = doc.data();
        sesion.id = doc.id;
        sesiones.push(sesion);
    });
    // console.log('Sesiones del período', sesiones);

    let facturaciones = [];
    if (sesiones.length > 0) {

        // inicializo recorrida
        let mes = sesiones[0].mes, anio = sesiones[0].anio;

        let fac = {
            id: `${anio}-${mes}`,
            mes,
            anio,
            total: 0,
            totalPrepaga: 0,
            totalPrivado: 0,
            totalCopago: 0,
            prepagas: {}
        };
        // key para prepagas
        for (const key in prepagasById) {            
            fac.prepagas[key] = 0;
        }

        sesiones.forEach( sesion => {

            // chequeo si la sesion es del mismo mes y anio
            if ( sesion.mes !== mes || sesion.anio !== anio ) {
                // agrego facturacion actual
                fac.total = round(fac.totalPrepaga + fac.totalPrivado + fac.totalCopago,2);
                facturaciones.push(fac);
                // reinicio facturacion
                fac = {
                    id: `${sesion.anio}-${sesion.mes}`,
                    mes: sesion.mes,
                    anio: sesion.anio,
                    total: 0,
                    totalPrepaga: 0,
                    totalPrivado: 0,
                    totalCopago: 0,
                    prepagas: {}
                };
                for (const key in prepagasById) {            
                    fac.prepagas[key] = 0;
                }
                mes = sesion.mes;
                anio = sesion.anio;                
            }

            let valor = parseFloat(sesion.valor);            
            if (sesion.tipo === pacientePrivado) {
                fac.totalPrivado += valor;
            } else {
                // sesion prepaga
                fac.totalCopago += parseFloat(sesion.copago);
                if (sesion.facturaPrepaga === true){
                    fac.totalPrepaga += valor;
                    fac.prepagas[sesion.prepaga] = fac.prepagas[sesion.prepaga] ? fac.prepagas[sesion.prepaga] += valor : valor;
                }
            }

            // redondeo totales
            fac.totalPrivado = round(fac.totalPrivado,2);
            fac.totalCopago = round(fac.totalCopago,2);
            fac.totalPrepaga = round(fac.totalPrepaga,2);
            for (const key in fac.prepagas) {
                fac.prepagas[key] = round(fac.prepagas[key],2);
            }

        });

        // agrego última facturación
        fac.total = round(fac.totalPrepaga + fac.totalPrivado + fac.totalCopago,2);
        facturaciones.push(fac);

    }
    console.log('Facturaciones', facturaciones);
    return facturaciones;

}

// table formatters

export const dateFormatter = (cell, row) => {
    return moment(cell).format('L');
}

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
    let val = cell > 0 ? `<i class="fa fa-usd"></i> ${cell}` : '';
    return val;
}

export const prepagaFormatter = (cell, row) => {
    return cell ? prepagasById[cell].nombre : '';
}

export const enumFormatter = (cell, row, enumObject) =>{
    return enumObject[cell];
}

export const boolFormatter = {
    true: 'Sí',
    false: 'No' 
}

// utiles
export const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}