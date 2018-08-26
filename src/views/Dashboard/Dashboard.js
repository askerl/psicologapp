import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { pacientePrepaga, pacientePrivado, prepagas, overlay } from '../../config/constants';
import db from '../../fire';
import { round, convertHex } from '../../utils/utils';
import Widget02 from '../Widgets/Widget02';
import { Callout, StatItem } from '../Widgets/WidgetsAuxiliares';

	
class Dashboard extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			total: 0,
			activos: 0,
			inactivos: 0,
			privados: 0,
			obraSocial: 0,
			privadosActivos: 0,
			obraSocialActivos: 0
		};

	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount(){
		this.loading(true);
		
		let data = Object.assign({}, this.state);
		// initialize prepagas counters
		data.prepagas = prepagas;
		data.prepagas.forEach( i => {
			data[i.id] = 0;
		});
		// query db
		db.collection("pacientes").get().then((querySnapshot)=> {
			querySnapshot.docs.forEach( doc => {
				data.total += 1;
				let pac = doc.data();
				pac.activo ? data.activos += 1 : data.inactivos += 1;
				switch (pac.tipo) {
					case pacientePrepaga:
						data.obraSocial += 1;
						if (pac.activo) {
							data.obraSocialActivos += 1 ;
							data[pac.prepaga] += 1;
						}
						break;
					case pacientePrivado:
						data.privados += 1;
						if (pac.activo) data.privadosActivos += 1 ;
						break;
				}
			});
			// percentages
			data.porcActivos = data.total > 0 ? round(data.activos / data.total * 100,2) : 0;
			data.porcInactivos = data.total > 0 ? round(data.inactivos / data.total * 100,2) : 0;

			// porcentajes activos
			data.porcPrivados = data.activos > 0 ? round(data.privadosActivos / data.activos * 100,2) : 0;
			data.porcObrasocial = data.activos > 0 ? round(data.obraSocialActivos / data.activos * 100,2) : 0;

			data.prepagas.forEach( i => {
				i.porc = data.obraSocialActivos > 0 ? round(data[i.id] / data.obraSocialActivos * 100,2) : 0;
			});

			this.setState(data);
			this.loading(false);
		});

	}

	render() {
		let data = this.state;
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
											<Link to={'/pacientes'} title="Ver pacientes activos" className="linkPacientes" onClick={() => localStorage.setItem('filtroEstado', 'A')}>
												<Widget02 header={`${data.activos}`} mainText="Activos" icon="icon-people icons" color="success" variant="1"/>
											</Link>
										</Col>
										<Col xs="12" sm="6">
											<Link to={'/pacientes'} title="Ver pacientes inactivos" className="linkPacientes" onClick={() => localStorage.setItem('filtroEstado', 'I')}>
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
