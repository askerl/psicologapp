import moment from 'moment';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Bar } from 'react-chartjs-2';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, FormGroup, Input, InputGroup, Label, Progress, Row } from 'reactstrap';
import { breakpoints, meses, mesesFormat, overlay, prepagas } from '../../config/constants';
import { errores } from '../../config/mensajes';
import { getFacturacionesPeriodo } from '../../utils/calcularFacturaciones';
import { tablasFormatter } from '../../utils/formatters';
import { percentage } from '../../utils/utils';
import { StatItem } from '../Widgets/WidgetsAuxiliares';
import _ from 'lodash';
import Spinner from '../../components/Spinner/Spinner';

class Facturaciones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			facturaciones: [],
			grafica: {},
			optsGrafica: {},
			showResultados: false,
			loading: false,
			periodo: '',
			size: ''
		};
		this.loading = this.loading.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
		this.getFacturacion = this.getFacturacion.bind(this);
		this.validarPeriodo = this.validarPeriodo.bind(this);
		this.resize = this.resize.bind(this);
	}
	
	componentDidMount(){
		this.initFiltros();
		window.addEventListener("resize", this.resize);
		this.resize();
	}
	
	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

	initFiltros(){
		let desde = moment().subtract(1,'months'),
			mesDes = desde.month()+1,
			anioDes = desde.year(),
			hasta = moment(),
			mesHas = hasta.month()+1,
			anioHas = hasta.year();

		this.mesIni.value = mesDes;
		this.anioIni.value = anioDes;
		this.mesFin.value = mesHas; 
		this.anioFin.value = anioHas;
	}

	loading(val){
        this.setState({loading: val});
	}

	getFacturacion(){

		this.loading(true);

		let mesIni = parseInt(this.mesIni.value),
		anioIni = parseInt(this.anioIni.value),
		mesFin = parseInt(this.mesFin.value),
		anioFin = parseInt(this.anioFin.value);
		
		// valido periodo
		if (this.validarPeriodo(mesIni, anioIni, mesFin, anioFin)) {
	
			getFacturacionesPeriodo(mesIni, anioIni, mesFin, anioFin).then( result => {			
				this.setState({showResultados: true, facturaciones: result.facturaciones, grafica: result.grafica.grafica, optsGrafica: result.grafica.optsGrafica});
				this.loading(false);
			});

		} else {
			this.loading(false);
		}
		
	}

	validarPeriodo(mesIni, anioIni, mesFin, anioFin) {
		if (!anioIni || !anioFin || (anioIni > anioFin) || (anioIni == anioFin && mesIni > mesFin) ){
			//periodo invalido
			NotificationManager.error(errores.periodoInvalido, 'Error');
			return false;
		}
		// armo string de período para gráfica
		let periodo = `${meses[this.mesIni.value-1]} ${this.anioIni.value} - ${meses[this.mesFin.value-1]} ${this.anioFin.value}`;
		this.setState({periodo});
		return true;
	}

	isExpandableRow(row) {
		if (row.totalPrepaga > 0) {
			return true;		
		} else {
			return false;
		}
	}

	resize(){
		this.setState({size: window.innerWidth});
	}

	render() {

		const options = {
			noDataText: 'No hay datos para el período seleccionado',
		}

		const optionsMes = meses.map( (value, index) => <option key={index} value={index+1}>{value}</option>);
		
		const columns = [{
			dataField: 'id',
			text: 'ID',
			hidden: true
		},{
			dataField: 'anio',
			text: 'Año',
			align: 'center', headerAlign: 'center',
			sort: true,
		},{
			dataField: 'mes',
			text: 'Mes',
			align: 'center', headerAlign: 'center',
			formatter: tablasFormatter.mes,
			formatExtraData: mesesFormat.long,
			sort: true,
		},{
			dataField: 'totalPrivado',
			text: 'Privados',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			sort: true,
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'totalPrepaga',
			text: 'Prepagas',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			sort: true,
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'totalCopago',
			text: 'Copagos',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			sort: true,
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'total',
			text: 'Total',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			sort: true,
		}];

		const expandRow = {
			renderer: rowData => {
				console.log(rowData);
				let liPrivados, liPrepagas, liCopagos;
				if (rowData.totalPrivado > 0) {
					liPrivados =
					<li>
						<StatItem title="Privados" icon="fa fa-user-o" value={`$ ${rowData.totalPrivado}`} porc={percentage(rowData.totalPrivado,rowData.total)} color="warning"/>
					</li>;
				}
				if (rowData.totalPrepaga > 0) {
					let auxPrepagas = Object.assign({}, prepagas);
					_.forEach(auxPrepagas, item => {
						item.valor 	= rowData.prepagas[item.id];
						item.porc	= percentage(item.valor, rowData.total);
					});
					liPrepagas = _.chain(auxPrepagas).sortBy('valor').reverse().map(item => {
						return(
							<li key={item.id}><StatItem title={item.nombre} value={`$ ${item.valor}`} porc={`${item.porc}`} color="info" icon={item.icono} /></li>
						)
					}).value();
				}
				if (rowData.totalCopago > 0) {
					liCopagos =
					<li>
						<StatItem title="Copagos" icon="fa fa-money" value={`$ ${rowData.totalCopago}`} porc={percentage(rowData.totalCopago,rowData.total)} color="teal"/>
					</li>;
				}
				return(
					<div>
						<ul className="horizontal-bars type-2">
							{liPrivados}
							{liPrepagas}
							{liCopagos}
						</ul>
					</div>
				);
			},
			showExpandColumn: true,
			expandHeaderColumnRenderer: ({ isAnyExpands }) => {
				return <span title={isAnyExpands ? 'Contraer todo' : 'Expandir todo'}><i className={"fa " + (isAnyExpands ? 'fa-minus' : 'fa-plus')}/></span>;
			},
			expandColumnRenderer: ({ expanded }) => {
				return <span title={expanded ? 'Contraer fila' : 'Expandir fila'}><i className={"fa " + (expanded ? 'fa-minus' : 'fa-plus')}/></span>;
			}
		}

		return (
			<div className="animated fadeIn facturaciones">
				<LoadingOverlay
					active={this.state.loading}
					animate
					spinner
					color={overlay.color}
					background={overlay.background}>
				<Row>
					<Col>
						<Card className="mainCard">
							<CardHeader>
								<i className="fa fa-book fa-lg"></i> Facturaciones
								</CardHeader>
							<CardBody>
								<Form className="filtros">
									<Row>
										<Col xs="12" sm="6">
											<FormGroup>
												<Label htmlFor="mesIni">Desde</Label>
												<InputGroup>
													<Input className="mes" type="select" bsSize="sm" name="mesIni" id="mesIni" innerRef={el => this.mesIni = el}>
														{optionsMes}
													</Input>
													<Input className="anio ml-2" type="number" bsSize="sm" name="anioIni" id="anioIni" innerRef={el => this.anioIni = el} />
												</InputGroup>
											</FormGroup>
										</Col>
										<Col xs="12" sm="6">
											<FormGroup>
												<Label htmlFor="mesFin">Hasta</Label>
												<InputGroup>
													<Input className="mes" type="select" bsSize="sm" name="mesFin" id="mesFin" innerRef={el => this.mesFin = el}>
														{optionsMes}
													</Input>
													<Input className="anio ml-2" type="number" bsSize="sm" name="anioFin" id="anioFin" innerRef={el => this.anioFin = el} />
												</InputGroup>
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col>
											<FormGroup>
												<InputGroup>
													<Button color="primary" size="sm" onClick={this.getFacturacion}>
													{this.state.loading ? <Spinner/> : <i className="fa fa-search mr-2"></i>}Consultar
													</Button>							
												</InputGroup>
											</FormGroup>
										</Col>
									</Row>
								</Form>
								{this.state.showResultados &&
									<BootstrapTable keyField='id' classes="tablaFacturaciones"
										data={this.state.facturaciones} 
										columns={columns} 
										defaultSortDirection="asc"
										noDataIndication={options.noDataText}
										expandRow={expandRow}
										bordered={ false }
										bootstrap4
										hover
									/>
								}
							</CardBody>
						</Card>
					</Col>
				</Row>
				{this.state.showResultados && this.state.grafica !== null &&
					<Row>
						<Col>
							<Card className="mainCard">
								<CardBody>
									<Row>
										<Col>
											<CardTitle className="mb-0">Gráfica</CardTitle>
											<div className="text-muted">{this.state.periodo}</div>
										</Col>
									</Row>
									<div className="chart-wrapper">
										<Bar data={this.state.grafica} options={this.state.optsGrafica} height={300} />
									</div>
								</CardBody>
								<CardFooter className="graficas-footer">
									<div className="small text-muted text-center graficas-footer-section-title">Totales del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Global</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumTotal}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Privados</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumPrivados}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Prepagas</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumPrepagas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Copagos</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumCopagos}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="teal" value="100" />
										</Col>
									</Row>

									<div className="small text-muted text-center graficas-footer-section-title mt-3">Promedios del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Global</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.avgTotal}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Privados</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.avgPrivados}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Prepagas</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.avgPrepagas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Copagos</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.avgCopagos}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="teal" value="100" />
										</Col>
									</Row>


								</CardFooter>
							</Card>
						</Col>
					</Row>
				}
				</LoadingOverlay>
			</div>
		)
	}
}

export default Facturaciones;