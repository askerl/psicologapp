import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Progress, Badge } from 'reactstrap';
import { filtroTipoPaciente, pacientePrepaga, pacientePrivado, prepagasById } from '../config/constants';
import { formatMonth, getColorPorcentaje, getPacientes } from './utils';

export const tablasFormatter = {
    filterClass: 'form-control-sm',
    actionsPaciente(cell, row, rowIndex, formatExtraData) {
        return (
            // <Link to={`/pacientes/${cell}`} title="Editar paciente"><i className="fa fa-edit fa-lg"></i></Link>
            <i className="fa fa-edit fa-lg" title="Editar Paciente" onClick={() => formatExtraData(cell)}></i>
        );
    },
    actionsHistoriaClinica(cell, row, rowIndex, formatExtraData) {
        return (
            <i className="fa fa-edit fa-lg" title="Editar Evolución" onClick={() => formatExtraData(row)}></i>
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
    edad(cell,row) {
        return cell > 0 ? cell : '';
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
    tipoPaciente(cell, row) {
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
    prepaga(cell, row) {
        return cell ? prepagasById[cell].nombre : '';
    },
    fecha(cell, row) {
        return moment.unix(cell).format('DD/MM/YYYY');
    },
    precio(cell, row) {
        if (cell > 0) {
            return (
                <span><i className="fa fa-usd"></i> {cell}</span>
            );
        } else {
            return '';
        }
    },
    factura(cell, row, rowIndex, formatExtraData) {
        return formatExtraData[cell];
    },
    boolFormatter: {
        true: 'Sí',
        false: 'No' 
    },
    mes(cell, row, rowIndex, formatExtraData) {
        return _.capitalize(formatMonth(cell, formatExtraData));
    }

}
