import React, { Component } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { backup } from '../../utils/backup';
import { errores, mensajes } from '../../config/mensajes';
	
class AdminPanel extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
		this.respaldar = this.respaldar.bind(this);
	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {
		// nada por ahora        
	}

	respaldar() {
		this.loading(true);
		backup().then( data =>{
			NotificationManager.success(mensajes.okBackup);
			// cargo datos
			this.loading(false);
		}).catch( error => {
			NotificationManager.error(errores.errorBackup, 'Error');
		});
	}

	render() {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Card>
							<CardBody>									
								<span className="h6">Administración</span>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

export default AdminPanel;
