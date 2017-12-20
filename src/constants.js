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
    sesionesVacias: "Seleccione alguna sesión"
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
    return {
        fechaString: fecha.format('DD/MM/YYYY'),
        dia: fecha.date(),
        mes: fecha.month()+1,
        anio: fecha.year()
    }
}

// calculo de facturaciones
export const getFacturacion = (mes, anio) => {
    let promise = new Promise( (resolve, reject) => {
        // query database
        db.collection("sesiones")
		.where("mes","==",parseInt(mes))
		.where("anio","==",parseInt(anio))		
		.orderBy("dia","desc")
		.get().then( querySnapshot => {
			resolve(calcularFacturacion(querySnapshot.docs, mes, anio))
		});
    });
    return promise;
}

function calcularFacturacion(data, mes, anio) {
    let fac = {
        anio,
        mes,
        total: 0,
        totalPrepaga: 0,
        totalPrivado: 0,
        totalCopago: 0,
        // por prepaga
        prepagas: {}
    };
    data.forEach( doc => {            
        let sesion = doc.data();
        let valor = parseFloat(sesion.valor);
        console.log('sesion', sesion);
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

    });

    fac.total = fac.totalPrepaga + fac.totalPrivado + fac.totalCopago;

    return fac;
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
