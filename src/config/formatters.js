import React from 'react';
import {Progress} from 'reactstrap';
import {Link} from 'react-router-dom';
import {filtroTipoPaciente, pacientePrivado, pacientePrepaga, prepagasById} from '../config/constants';
// PACIENTES

export const tablasFormatter = {
    filterClass: 'form-control-sm',
    actionsPaciente(cell, row) {
        return (
            <Link to={`/pacientes/${cell}`} title="Editar paciente"><i className="fa fa-edit fa-lg"></i></Link>
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
        let color;
        if (row.porcRestantes > 80) {
            color = "success";
        } else if (row.porcRestantes > 10) {
            color = "warning";
        } else {
            color = "danger";
        }
        let prog = cell == '' ? '': 
            <div className="d-flex flex-column">
                <div className="d-flex">
                    <strong>{cell}</strong>
                </div>				
                <Progress className="progress-xs" color={color} value={row.porcRestantes}/>
            </div>;
        return prog;
    },
    tipoPaciente(cell, row) {
        if (cell === pacientePrivado) {
            return (
                <span className="badge badge-warning">{filtroTipoPaciente[pacientePrivado]}</span>
            );
        }
        if (cell === pacientePrepaga) {
            return (
                <span className="badge badge-primary">{filtroTipoPaciente[pacientePrepaga]}</span>
            );
        }
    },
    prepaga(cell, row) {
        return cell ? prepagasById[cell].nombre : '';
    }
}
