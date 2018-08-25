// calculo de facturaciones
import db from '../fire';
import { prepagasById, pacientePrivado, brandColors, mesesFormat } from '../config/constants';
import { round, convertHex, formatMonth } from '../utils/utils';
import _ from 'lodash';

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
        labels: facturaciones.map(item => formatMonth(item.mes,mesesFormat.short)),
        datasets: [
            {
                label: 'Privados',
                backgroundColor: convertHex(brandColors.brandWarning, 90),
                borderColor: brandColors.brandWarning,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.privados
            },
            {
                label: 'Prepagas',
                backgroundColor: convertHex(brandColors.brandInfo, 90),
                borderColor: brandColors.brandInfo,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.prepagas
            },
            {
                label: 'Copagos',
                backgroundColor: convertHex(brandColors.brandTeal, 90),
                borderColor: brandColors.brandTeal,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.copagos
            }
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
