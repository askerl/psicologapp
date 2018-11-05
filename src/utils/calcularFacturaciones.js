// calculo de facturaciones
import _ from 'lodash';
import { brandColors, mesesFormat, pacientePrivado } from '../config/constants';
import db from '../fire';
import { convertHex, formatMonth, getSession, round } from '../utils/utils';

// genero un mes de facturación vació
function getEmpyFac(mes, anio) {
    let emptyFac = {
        id: `${anio}-${mes}`,
        mes,
        anio,
        total: 0,
        totalPrepaga: 0,
        totalPrivado: 0,
        totalCopago: 0,
        prepagas: {},
        ausencias: 0,
        ausenciasFacturadas: 0,
        ausenciasNoFacturadas: 0,
        totalAusenciasFac: 0,
        totalAusenciasNoFac: 0
    };
    // key para prepagas
    let prepagas = getSession('prepagas');
    prepagas.forEach( prepaga => {
        emptyFac.prepagas[prepaga.id] = 0;
    });
    return emptyFac;
}

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
            let graficas = {
                facturaciones: null,
                ausencias: null
            }
            // si el período seleccionado es mayor a 1 mes -> muestro gráficas
            // if (facturaciones.length > 1) {
                graficas.facturaciones = graficaFacturaciones(facturaciones);
                graficas.ausencias = graficaAusencias(facturaciones);
            // }
            
			resolve({facturaciones, graficas});
		});
    });
    return promise;
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

            // valor $ de la sesión
            let valor = parseFloat(sesion.valor);

            // facturo una sesión si NO es ausencia, o si es ausencia y se factura
            let facturarSesion = true;
            if (sesion.ausencia) {
                fac.ausencias += 1;
                if (sesion.facturaAusencia) {
                    fac.ausenciasFacturadas += 1;
                    fac.totalAusenciasFac += valor;
                } else {
                    fac.ausenciasNoFacturadas += 1;
                    fac.totalAusenciasNoFac += valor;
                    facturarSesion = false;
                }
            }

            if (facturarSesion) {
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
            }

            // redondeo totales
            fac.totalPrivado = round(fac.totalPrivado,2);
            fac.totalCopago = round(fac.totalCopago,2);
            fac.totalPrepaga = round(fac.totalPrepaga,2);
            for (const key in fac.prepagas) {
                fac.prepagas[key] = round(fac.prepagas[key],2);
            }

        });

        // sumo totales
        fac.total = round(fac.totalPrepaga + fac.totalPrivado + fac.totalCopago,2);
        
        // agrego última facturación
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

function graficaFacturaciones(facturaciones) {
    
    let data = {
        totales:    _.map(facturaciones, 'total'),
        privados:   _.map(facturaciones, 'totalPrivado'),
        prepagas:   _.map(facturaciones, 'totalPrepaga'),
        copagos:    _.map(facturaciones, 'totalCopago')
    };

    let grafica = {
        labels: facturaciones.map(item => formatMonth(item.mes,mesesFormat.short)),
        datasets: [{
                label: 'Total',
                backgroundColor: convertHex(brandColors.brandSuccess, 90),
                borderColor: brandColors.brandSuccess,
                pointHoverBackgroundColor: '#fff',
                borderWidth: 0,
                data: data.totales,
                type: 'line',
                cubicInterpolationMode: 'monotone'
            },
            {
                label: 'Privados',
                backgroundColor: convertHex(brandColors.brandWarning, 70),
                borderColor: brandColors.brandWarning,
                data: data.privados
            },
            {
                label: 'Prepagas',
                backgroundColor: convertHex(brandColors.brandInfo, 70),
                borderColor: brandColors.brandInfo,
                data: data.prepagas
            },
            {
                label: 'Copagos',
                backgroundColor: convertHex(brandColors.brandTeal, 75),
                borderColor: brandColors.brandTeal,
                data: data.copagos
            }
        ],
        sumTotal: round(_.sum(data.totales),2),
        sumPrivados: round(_.sum(data.privados),2),
        sumPrepagas: round(_.sum(data.prepagas),2),
        sumCopagos: round(_.sum(data.copagos),2)
    }

    // seteo promedios
    grafica.avgTotal = round(grafica.sumTotal / facturaciones.length,2);
    grafica.avgPrivados = round(grafica.sumPrivados / facturaciones.length,2);
    grafica.avgPrepagas = round(grafica.sumPrepagas / facturaciones.length,2);
    grafica.avgCopagos = round(grafica.sumCopagos / facturaciones.length,2);

    return grafica;
}

function graficaAusencias(facturaciones) {
    
    let data = {
        ausencias:    _.map(facturaciones, 'ausencias'),
        facturadas:   _.map(facturaciones, 'ausenciasFacturadas'),
        noFacturadas:   _.map(facturaciones, 'ausenciasNoFacturadas'),
        montoFacturadas: _.map(facturaciones, 'totalAusenciasFac'),
        montoNoFacturadas: _.map(facturaciones, 'totalAusenciasNoFac'),
    };

    // inicializo grafica con totales
    let grafica = {
        sumAusencias: round(_.sum(data.ausencias),2),
        sumFacturadas: round(_.sum(data.facturadas),2),
        sumNoFacturadas: round(_.sum(data.noFacturadas),2),
        sumTotalFacturado: round(_.sum(data.montoFacturadas),2),
        sumTotalNoFacturado: round(_.sum(data.montoNoFacturadas),2)
    };
    // seteo promedios
    grafica.avgAusencias = round(grafica.sumAusencias / facturaciones.length,2);
    grafica.avgFacturadas = round(grafica.sumFacturadas / facturaciones.length,2);
    grafica.avgNoFacturadas = round(grafica.sumNoFacturadas / facturaciones.length,2);
    grafica.avgMontoFacturado = round(grafica.sumTotalFacturado / facturaciones.length,2);
    grafica.avgMontoNoFacturado = round(grafica.sumTotalNoFacturado / facturaciones.length,2);

    grafica.labels = facturaciones.map(item => formatMonth(item.mes,mesesFormat.short)); 
    grafica.datasets = [
        {
            label: '$ No Facturado',
            backgroundColor: convertHex(brandColors.brandDanger, 60),
            borderColor: brandColors.brandDanger,
            data: data.montoNoFacturadas
        }
    ];

    return grafica;
}


