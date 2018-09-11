import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { backup } from '../../utils/backup';
import { errores, mensajes } from '../../config/mensajes';
import Spinner from '../../components/Spinner/Spinner';
	
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
							<CardHeader>
								<i className="icon-settings"></i> Administración
							</CardHeader>
							<CardBody>
								<Button color="primary" size="sm" onClick={this.respaldar}>
									{this.state.loading ? <Spinner/> : <i className="fa fa-cloud-upload mr-2"></i>}Respaldar
								</Button>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

export default AdminPanel;
