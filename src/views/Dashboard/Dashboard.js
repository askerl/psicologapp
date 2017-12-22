import React, { Component } from 'react';
import db from '../../fire';
import { pacientePrepaga, pacientePrivado, prepagas } from '../../constants';
import Loader from 'react-loaders';

import {
	Row,
	Col,
	Progress,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	CardTitle
	} from 'reactstrap';
	
import Widget02 from '../Widgets/Widget02';
	
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
			data.porcActivos = data.total > 0 ? (data.activos / data.total * 100) : 0;
			data.porcInactivos = data.total > 0 ? (data.inactivos / data.total * 100) : 0;

			// porcentajes activos
			data.porcPrivados = data.activos > 0 ? (data.privadosActivos / data.activos * 100) : 0;
			data.porcObrasocial = data.activos > 0 ? (data.obraSocialActivos / data.activos * 100) : 0;

			data.prepagas.forEach( i => {
				i.porc = data.obraSocialActivos > 0 ? (data[i.id] / data.obraSocialActivos * 100) : 0;
			});

			this.setState(data);
			this.loading(false);
		});


	}

	render() {
		let data = this.state;
		return (
			<div className="animated fadeIn">
				<Loader type="ball-scale-ripple-multiple" active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn dashboard"}>           
					
					<Row>
						<Col>
							<Card>
								<CardBody>
									<Row>
										<Col xs="12" sm="6">
											<Widget02 header={`${data.activos}`} mainText="Pacientes" icon="icon-people icons" color="success" variant="1"/>
										</Col>
										<Col xs="12" sm="6">
											<Widget02 header={`${data.inactivos}`} mainText="Inactivos" icon="icon-user-unfollow icons" color="danger" variant="1"/>
										</Col>
									</Row>
									<span className="h6">Estadísticas</span>
									<Row className="d-none d-sm-flex">
										<Col xs="4" sm="4">
											<Callout title="Activos" color="success" value={data.activos}/>											
										</Col>
										<Col xs="4" sm="4">
											<Callout title="Privados" color="warning" value={data.privadosActivos}/>
										</Col>
										<Col xs="4" sm="4">
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
												{ prepagas.map(item => <li key={item.id}><StatItem title={item.nombre} icon="icon-plus" value={data[item.id]} porc={item.porc} color="info"/></li>)}
											</ul>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>

				</div>
			</div>
		);
	}
}

// componentes auxiliares
const Callout = ({title, color, value}) => {
	return (
		<div className={`callout callout-${color}`}>
			<small className="text-muted">{title}</small>
			<br />
			<strong className="h4">{value}</strong>
		</div>
	);
}

const StatItem = ({title, porc, value, icon, color}) => {
	let legend = value !== undefined ? <span className="value">{value} <span className="text-muted small">{`(${porc}%)`}</span></span> : <span className="value">{`${porc}%`}</span>;
	return(
		<div>
			<i className={icon}></i>
			<span className="title">{title}</span>
			{legend}
			<div className="bars">
				<Progress className="progress-xs" color={color} value={porc} />
			</div>
		</div>
	);
}

export default Dashboard;
