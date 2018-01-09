import db from './fire';
import moment from 'moment';
import _ from 'lodash';
import { auth } from 'firebase/app';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
moment.locale("es");

var currentUser = null;

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
export const mesesShort = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
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
            resolve(setPacientesWindow(pacientes));
        });
    });
    return promise;
}

function setPacientesWindow(pacientes) {
    window.pacientesMap = pacientes;
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
            let facturaciones = armarFacturaciones(querySnapshot.docs, mesIni, anioIni, mesFin, anioFin);
            let grafica = facturaciones.length > 1 ? armarGrafica(facturaciones) : {grafica: null};
			resolve({facturaciones, grafica});
		});
    });
    return promise;
}

function getEmpyFac(mes, anio) {
    let emptyFac = {
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
        emptyFac.prepagas[key] = 0;
    }
    return emptyFac;
}

function armarFacturaciones(data, mesIni, anioIni, mesFin, anioFin) {
    let sesiones = [];
    data.forEach( doc => {
        let sesion = doc.data();
        sesion.id = doc.id;
        sesiones.push(sesion);
    });

    let facturaciones = [], mes, anio;
    if (sesiones.length > 0) {

        // inicializo recorrida
        mes = sesiones[0].mes, anio = sesiones[0].anio;

        let fac = getEmpyFac(mes, anio);

        sesiones.forEach( sesion => {

            // chequeo si la sesion es del mismo mes y anio
            if ( sesion.mes !== mes || sesion.anio !== anio ) {
                // agrego facturacion actual
                fac.total = round(fac.totalPrepaga + fac.totalPrivado + fac.totalCopago,2);
                facturaciones.push(fac);
                // reinicio facturacion
                fac = getEmpyFac(sesion.mes, sesion.anio);
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

    // generar facturaciones vacías del período
    mes = mesIni;
    anio = anioIni;
    let desde = new Date(anio, mes-1, 1);
    let hasta = new Date(anioFin, mesFin-1, 1);

    while (desde <= hasta) {
        if (_.find(facturaciones, {mes: mes, anio: anio}) == undefined){
            // creo la facturacion vacia para ese mes
            facturaciones.push(getEmpyFac(mes,anio));
        }
        mes += 1;
        if ( mes > 12) {
            mes = 1;
            anio += 1;
        }
        desde = new Date(anio, mes-1, 1);
    }

    return _.orderBy(facturaciones, ['anio', 'mes'], ['asc', 'asc']);

}

function armarGrafica(facturaciones) {


    let data = {
        totales:    _.map(facturaciones, 'total'),
        privados:   _.map(facturaciones, 'totalPrivado'),
        prepagas:   _.map(facturaciones, 'totalPrepaga'),
        copagos:    _.map(facturaciones, 'totalCopago')
    };
    let minimo = 1000;//_.min(data.totales);
    data.minimo = [];
    for (let i = 0; i <= data.totales.length; i++) {
        data.minimo.push(minimo);
    }

    let grafica = {
        labels: facturaciones.map(item => mesesShort[item.mes-1]),
        datasets: [
            // {
            //     label: 'Total',
            //     backgroundColor: brandSuccess, // convertHex(brandSuccess, 10),
            //     borderColor: brandSuccess,
            //     pointHoverBackgroundColor: '#fff',
            //     borderWidth: 2,
            //     data: data.totales
            // },
            {
                label: 'Privados',
                backgroundColor: convertHex(brandWarning, 90),
                borderColor: brandWarning,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.privados
            },
            {
                label: 'Prepagas',
                backgroundColor: convertHex(brandInfo, 90),
                borderColor: brandInfo,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.prepagas
            },
            {
                label: 'Copagos',
                backgroundColor: convertHex(brandTeal, 90),
                borderColor: brandTeal,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.copagos
            }//,
            // {
            //     label: 'Facturación baja',
            //     backgroundColor: 'transparent',
            //     borderColor: brandDanger,
            //     pointHoverBackgroundColor: '#fff',
            //     borderWidth: 1,
            //     borderDash: [8, 5],
            //     data: data.minimo,
            //     type: 'line'
            // }
        ],
        sumTotal: round(_.sum(data.totales),2),
        sumPrivados: round(_.sum(data.privados),2),
        sumPrepagas: round(_.sum(data.prepagas),2),
        sumCopagos: round(_.sum(data.copagos),2)
    }

    let facChartOpts = {
        maintainAspectRatio: false,
        legend: {
            display: true
        },
        scales: {
            xAxes: [{
                gridLines: {
                    drawOnChartArea: false,
                },
                stacked: true
            }],
            yAxes: [{
                // ticks: {
                //     beginAtZero: true,
                //     maxTicksLimit: 10,
                //     stepSize: 5000,
                //     // max: maxGraf
                // },
                stacked: true
            }]
        },
        elements: {
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3,
            }
        }
    }

    return {grafica, optsGrafica: facChartOpts};
}

// table formatters

export const dateFormatter = (cell, row) => {
    return moment(cell).format('DD/MM/YYYY');
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

// valores para grafica de facturaciones

const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';
const brandPurple = '#6f42c1';
const brandTeal = '#20c997';

// convert Hex to RGBA
function convertHex(hex, opacity) {
	hex = hex.replace('#', '');
	var r = parseInt(hex.substring(0, 2), 16);
	var g = parseInt(hex.substring(2, 4), 16);
	var b = parseInt(hex.substring(4, 6), 16);
  
	var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
	return result;
}


const mailHabilitados = [
    "alfredo.skerl@gmail.com",
    "estacco@gmail.com"
]

export const isHabilitado = (email) =>{
    return _.indexOf(mailHabilitados, email) !== -1;
}
