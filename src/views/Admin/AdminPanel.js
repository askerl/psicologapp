import React, { Component } from 'react';
import { Col, Row, Button } from 'reactstrap';
import Respaldos from '../Respaldos/respaldos';
import { pacientePrepaga, prepagasById } from '../../config/constants';
import db from '../../fire';

	
class AdminPanel extends Component {
  
	constructor(props) {
		super(props);
		this.actualizarValor = this.actualizarValor.bind(this);
	}

	componentDidMount() {
		// nada por ahora

	}

	actualizarValor() {
		// funcion auxiliar para actualizar modelo de datos de pagosPrepaga
		// a valorConsulta

		db.collection("pacientes").where("tipo","==",pacientePrepaga).get().then( querySnapshot => {
			console.log('Pacientes Prepaga:', querySnapshot.docs.length);
			// Get a new write batch
			let batch = db.batch();

			querySnapshot.docs.forEach( doc => {
				let pacRef = doc.ref;
				let paciente = doc.data();
				console.log('Paciente', paciente.nombre, paciente.apellido);
				console.log('Prepaga', paciente.prepaga);
				console.log('Pago', paciente.pago);
				console.log('Valor', prepagasById[paciente.prepaga].pagos[paciente.pago]);
				let newValorConsulta = prepagasById[paciente.prepaga].pagos[paciente.pago];
				// actualizo campo valorConsulta 
				batch.update(pacRef,{valorConsulta: newValorConsulta});
			});
			
			//Commit the batch
			batch.commit().then( () => {
				console.log('Datos actualizados');
			}).catch( error => {
				console.log('Error', error);
			});

		});



	}

	render() {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Respaldos/>
						<Button color="success" size="sm" title="Actualizar Valor Consulta" onClick={this.actualizarValor}>
							Actualizar Valor Consulta
						</Button>                                    
					</Col>
				</Row>
			</div>
		);
	}
}

export default AdminPanel;
