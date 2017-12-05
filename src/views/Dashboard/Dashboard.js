import React, { Component } from 'react';
import db from '../../fire';
import { pacientePrepaga, pacientePrivado, cargarPrepagas } from '../../constants';
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
	console.log('value', value);
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


class Dashboard extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			prepagas: [],
			total: 0,
			activos: 0,
			inactivos: 0,
			privados: 0,
			obraSocial: 0
		};

	}

	loading(val){
		this.setState({loading: val});
	}

	componentWillMount(){
		this.loading(true);
		cargarPrepagas().then( () => {
			let data = Object.assign({}, this.state);
			// initialize prepagas counters
			data.prepagas = window.prepagas;
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
							data[pac.prepaga] += 1;
							break;
						case pacientePrivado:
							data.privados += 1;
							break;
					}
				});
				// percentages
				data.porcPrivados = data.total > 0 ? (data.privados / data.total * 100) : 0;
				data.porcObrasocial = data.total > 0 ? (data.obraSocial / data.total * 100) : 0;
				data.porcActivos = data.total > 0 ? (data.activos / data.total * 100) : 0;
				data.porcInactivos = data.total > 0 ? (data.inactivos / data.total * 100) : 0;

				console.log('data', data);

				this.setState(data);
				this.loading(false);
			});
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
										<Col>
											<Widget02 header={`${data.total}`} mainText="Pacientes" icon="icon-people icons" color="primary" variant="1"/>
										</Col>
									</Row>
									<Row>
										<Col sm="3">
											<Callout title="Privados" color="dark" value={data.privados}/>
										</Col>
										<Col sm="3">
											<Callout title="Obra social" color="primary" value={data.obraSocial}/>											
										</Col>
										<Col sm="3">
											<Callout title="Activos" color="success" value={data.activos}/>											
										</Col>
										<Col sm="3">
											<Callout title="Inactivos" color="danger" value={data.inactivos}/>											
										</Col>
									</Row>
									<hr className="mt-0"/>
									<Row>
										<Col>										
											<ul className="horizontal-bars type-2">
												<li>
													<StatItem title="Privados" icon="icon-user" porc={data.porcPrivados} color="dark"/>
												</li>
												<li>
													<StatItem title="Obra social" icon="icon-user-follow" porc={data.porcObrasocial} color="primary"/>
												</li>
												<li className="divider"></li>
												{ data.prepagas.map(item => <li key={item.id}><StatItem title={item.nombre} icon="icon-grid" value={data[item.id]} porc={70} color="info"/></li>)}
												<li className="divider"></li>
												<li>
													<StatItem title="Activos" icon="icon-user-following" porc={data.porcActivos} color="success"/>
												</li>
												<li>
													<StatItem title="Inactivos" icon="icon-user-unfollow" porc={data.porcInactivos} color="danger"/>
												</li>
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

export default Dashboard;
