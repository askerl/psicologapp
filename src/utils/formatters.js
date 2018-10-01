import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Progress, Badge } from 'reactstrap';
import { filtroTipoPaciente, pacientePrepaga, pacientePrivado, prepagasById, fechaFormat } from '../config/constants';
import { formatMonth, getColorPorcentaje, getPacientes, round } from './utils';

export const tablasFormatter = {
    filterClass: 'form-control-sm',
    actionsPaciente(cell, row, rowIndex, formatExtraData) {
        return (
            <i className="fa fa-edit fa-lg" title="Editar Paciente" onClick={() => formatExtraData(cell)}></i>
        );
    },
    actionsHistoriaClinica(cell, row, rowIndex, formatExtraData) {
        return (
            <i className="fa fa-edit fa-lg" title="Editar Evolución" onClick={() => formatExtraData(cell)}></i>
        );
    },
    actionsRespaldo(cell, row, rowIndex, formatExtraData) {
        return (
            <div>
                <i className="fa fa-cloud-download fa-lg mr-1" title="Descargar respaldo" onClick={() => formatExtraData.descargar(row.nombre)}></i>
                <i className="fa fa-times-circle fa-lg mr-1" title="Eliminar respaldo" onClick={() => formatExtraData.eliminar(cell, row.nombre)}></i>
                <i className="fa fa-cloud-upload fa-lg" title="Restaurar respaldo" onClick={() => formatExtraData.restaurar(cell, row.nombre)}></i>
            </div>
        );
    },
    nombrePaciente(cell, row){
        if (row.activo) {
            return (
                <span><strong>{cell}</strong></span>
            );
        } else {
            return (
                <span className="text-danger"><strong>{cell}</strong></span>
            );
        }
    },
    sesionesRestantes(cell, row) {
        if (!cell) {
            return '';
        }
        let color = getColorPorcentaje(row.porcRestantes);
        if (cell <= 0) {
            return (
                <div className="d-flex flex-column">
                    <Progress color={color} value={100}><strong>{cell}</strong></Progress>
                </div>
            )
        } else {
            return (
                <div className="d-flex flex-column">
                    <Progress color={color} value={row.porcRestantes}><strong>{cell}</strong></Progress>
                </div>
            )
        }
    },
    tipoPaciente(cell) {
        if (cell === pacientePrivado) {
            return (
                <Badge color="warning" className="badge-pill">{filtroTipoPaciente[pacientePrivado]}</Badge>
            );
        }
        if (cell === pacientePrepaga) {
            return (
                <Badge color="primary" className="badge-pill">{filtroTipoPaciente[pacientePrepaga]}</Badge>
            );
        }
    },
    prepaga(cell) {
        return cell ? prepagasById[cell].nombre : '';
    },
    fecha(cell) {
        return moment.unix(cell).format(fechaFormat.fecha);
    },
    fechaHora(cell) {
        return moment.unix(cell).format(fechaFormat.fechaHora);
    },
    precio(cell) {
        if (cell > 0) {
            return (
                <span><i className="fa fa-usd"></i> {cell}</span>
            );
        } else {
            return '';
        }
    },
    factura(cell, row, rowIndex, formatExtraData) {
        return cell ? formatExtraData[cell] : '';
    },
    boolFormatter: {
        true: 'Sí',
        false: 'No' 
    },
    mes(cell, row, rowIndex, formatExtraData) {
        return _.capitalize(formatMonth(cell, formatExtraData));
    },
    fileSize(cell) {
        let k = 1024;
        // Bytes
        if (cell < k) {
            return cell + ' B';
        }
        // KBytes
        if (cell < k*k) {
            return round(cell/k,2) + ' KB';
        }
        // MBytes
        if (cell < k*k*k) {
            return round(cell/(k*k),2) + ' MB';
        }
        return cell;
    }
};

export const csvFormatter = {
    tipoPaciente(cell) {
        return filtroTipoPaciente[cell];
    },
    credencial(cell) {
        return cell || '';
    },
    sesiones(cell) {
        return cell || '';
    },
    valorConsulta(cell) {   
        return cell > 0 ? parseFloat(cell) : '';
    },
    copago(cell) {
        return cell > 0 ? cell : '';
    },
};
