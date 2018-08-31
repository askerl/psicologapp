import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { overlay, prepagas } from '../../config/constants';
import { getEstadisticas, setSession } from '../../utils/utils';
import Widget02 from '../Widgets/Widget02';
import { Callout, StatItem } from '../Widgets/WidgetsAuxiliares';
	
class Dashboard extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			data: {}
		};

	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount(){
		this.loading(true);
		getEstadisticas().then( data => {
			this.setState({data});
			this.loading(false);
		});
	}

	render() {
		let data = this.state.data;
		return (
			<div className="animated fadeIn dashboard">
				<LoadingOverlay
					active={this.state.loading}
					animate
					spinner
					color={overlay.color}
					background={overlay.backgroundWhite}>
					<Row>
						<Col>
							<Card className="mainCard">
								<CardBody>
									<div className="mb-3"><span className="h6">Pacientes</span></div>
									<Row>
										<Col xs="12" sm="6">
											<Link to={'/pacientes'} title="Ver pacientes activos" className="linkButton" onClick={() => setSession('filtroEstado', 'A')}>
												<Widget02 header={`${data.activos}`} mainText="Activos" icon="icon-people icons" color="success" variant="1"/>
											</Link>
										</Col>
										<Col xs="12" sm="6">
											<Link to={'/pacientes'} title="Ver pacientes inactivos" className="linkButton" onClick={() => setSession('filtroEstado', 'I')}>
												<Widget02 header={`${data.inactivos}`} mainText="Inactivos" icon="icon-user-unfollow icons" color="danger" variant="1"/>
											</Link>
										</Col>
									</Row>
									<div><span className="h6">Estadísticas de activos</span></div>
									<Row className="d-none d-sm-flex">
										<Col xs="6" sm="6">
											<Callout title="Privados" color="warning" value={data.privadosActivos}/>
										</Col>
										<Col xs="6" sm="6">
											<Callout title="Obra social" color="primary" value={data.obraSocialActivos}/>											
										</Col>										
									</Row>
									<hr className="mt-0"/>
									<Row>
										<Col>											
											<ul className="horizontal-bars type-2">																								
												<li>
													<StatItem title="Privados" icon="icon-user" value={data.privadosActivos} porc={data.porcPrivados} color="warning"/>
												</li>
												<li>
													<StatItem title="Obra social" icon="icon-user-follow" value={data.obraSocialActivos} porc={data.porcObrasocial} color="primary"/>
												</li>
												<li className="divider"></li>
												{ prepagas.map(item => <li key={item.id}><StatItem title={item.nombre} icon={item.icono} value={data[item.id]} porc={item.porc} color="info"/></li>)}
											</ul>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</LoadingOverlay>
			</div>
		);
	}
}

export default Dashboard;
