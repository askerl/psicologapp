import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Link } from 'react-router-dom';
import { Badge, Card, CardBody, Col, Row, UncontrolledAlert } from 'reactstrap';
import { overlay, iconoPrepaga } from '../../config/constants';
import { getEstadisticas, setSession, recordatorioRespaldo } from '../../utils/utils';
import Widget02 from '../Widgets/Widget02';
import { Callout, StatItem } from '../Widgets/WidgetsAuxiliares';
import { getRespaldos } from '../../utils/backup';
	
class Dashboard extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			data: {
				prepagas: []
			},
			recordarRespaldo: false,
			msjRecordarRespaldo: ''
		};

	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount(){
		this.loading(true);

		Promise.all([getEstadisticas(), getRespaldos()]).then(values => { 
			let data = values[0];
			let {recordarRespaldo, msjRecordarRespaldo} = recordatorioRespaldo(values[1]);			

			this.setState({data, recordarRespaldo, msjRecordarRespaldo});
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
								{ this.state.recordarRespaldo &&
								<UncontrolledAlert color="warning">
									{this.state.msjRecordarRespaldo}
								</UncontrolledAlert>
								}
								<CardBody>
									<div className="mb-3"><span className="h6">Pacientes</span><Badge color="primary" className="badge-pill ml-2">{data.total}</Badge></div>
									<Row>
										<Col xs="12" sm="4">
											<Link to={'/pacientes'} title="Ver pacientes activos" className="linkCard successCard" onClick={() => setSession('filtroEstado', 'A')}>
												<Widget02 header={`${data.activos}`} mainText="Activos" icon="icon-user-following icons" color="success" variant="1"/>
											</Link>
										</Col>
										<Col xs="12" sm="4">
											<Link to={'/pacientes'} title="Ver pacientes inactivos" className="linkCard dangerCard" onClick={() => setSession('filtroEstado', 'I')}>
												<Widget02 header={`${data.inactivos}`} mainText="Inactivos" icon="icon-user-unfollow icons" color="danger" variant="1"/>
											</Link>
										</Col>
										<Col xs="12" sm="4">
											<Link to={'/pacientes'} title="Ver pacientes con deuda" className="linkCard warningCard" onClick={() => setSession('filtroEstado', 'D')}>
												<Widget02 header={`${data.deudores}`} mainText={'Deudores' + (data.deudores > 0 ? `: $${data.totalDeuda}` : '')} icon="icon-wallet icons" color="warning" variant="1"/>
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
												{ data.prepagas.map(item => <li key={item.id}><StatItem title={item.nombre} icon={iconoPrepaga} value={data[item.id]} porc={item.porc} color="info"/></li>)}
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
