import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Bar } from 'react-chartjs-2';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Form, FormGroup, Input, InputGroup, Label, Progress, Row } from 'reactstrap';
import Spinner from '../../components/Spinner/Spinner';
import { breakpoints, iconoPrepaga, meses, mesesFormat, overlay, configGraficas } from '../../config/constants';
import { errores } from '../../config/mensajes';
import { getFacturacionesPeriodo } from '../../utils/calcularFacturaciones';
import { tablasFormatter } from '../../utils/formatters';
import { getPrepagas, percentage } from '../../utils/utils';
import { StatItem } from '../Widgets/WidgetsAuxiliares';

class Facturaciones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			facturaciones: [],
			graficas: {},
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
		// cargo prepagas
		getPrepagas().then( prepagas => {
			this.prepagas = prepagas;
		});
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
				let facturaciones = result.facturaciones,
					graficas = result.graficas;
				this.setState({showResultados: true, facturaciones, graficas});
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

		const prepagas = this.prepagas;

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
							<li key={item.id}><StatItem title={item.nombre} value={`$ ${item.valor}`} porc={`${item.porc}`} color="info" icon={iconoPrepaga} /></li>
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

		let graficaFacturaciones = this.state.graficas.facturaciones,
			graficaAusencias = this.state.graficas.ausencias;

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
								<i className="fa fa-book fa-lg"></i>Consulta de Facturaciones
								</CardHeader>
							<CardBody>
								<Form className="filtros">
									<Row>
										<Col xs="12" sm="6">
											<FormGroup>
												<Label className="d-block" htmlFor="mesIni">Desde</Label>
												<Input className="mes d-inline" type="select" bsSize="sm" name="mesIni" id="mesIni" innerRef={el => this.mesIni = el}>
													{optionsMes}
												</Input>
												<Input className="anio d-inline ml-2" type="number" bsSize="sm" name="anioIni" id="anioIni" innerRef={el => this.anioIni = el} />
											</FormGroup>
										</Col>
										<Col xs="12" sm="6">
											<FormGroup>
												<Label className="d-block" htmlFor="mesFin">Hasta</Label>											
												<Input className="mes d-inline" type="select" bsSize="sm" name="mesFin" id="mesFin" innerRef={el => this.mesFin = el}>
													{optionsMes}
												</Input>
												<Input className="anio d-inline ml-2" type="number" bsSize="sm" name="anioFin" id="anioFin" innerRef={el => this.anioFin = el} />											
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
				{this.state.showResultados && graficaFacturaciones !== null &&
					<Row>
						<Col>
							<Card className="mainCard">
								<CardBody>
									<Row>
										<Col>
											<CardTitle className="mb-1"><i className="fa fa-bar-chart fa-lg mr-2"></i>Facturaciones</CardTitle>
											<div className="text-muted">{this.state.periodo}</div>
										</Col>
									</Row>
									<div className="chart-wrapper">
										<Bar data={graficaFacturaciones} options={configGraficas.chartFacturaciones}/>
									</div>
								</CardBody>
								<CardFooter className="graficas-footer">
									<div className="small text-muted text-center graficas-footer-section-title">Totales del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Global</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.sumTotal}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Privados</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.sumPrivados}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Prepagas</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.sumPrepagas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Copagos</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.sumCopagos}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="teal" value="100" />
										</Col>
									</Row>

									<div className="small text-muted text-center graficas-footer-section-title mt-3">Promedios del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Global</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.avgTotal}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Privados</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.avgPrivados}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Prepagas</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.avgPrepagas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Copagos</div>
											<strong><i className="fa fa-usd"></i> {graficaFacturaciones.avgCopagos}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="teal" value="100" />
										</Col>
									</Row>
								</CardFooter>
							</Card>
						</Col>
					</Row>
				}
				{this.state.showResultados && graficaAusencias !== null && graficaAusencias.sumAusencias > 0 &&
					<Row>
						<Col>
							<Card className="mainCard">
								<CardBody>
									<Row>
										<Col>
											<CardTitle className="mb-1"><i className="fa fa-bar-chart fa-lg mr-2"></i>Ausencias <small className="text-muted">(no facturadas)</small></CardTitle>
											<div className="text-muted">{this.state.periodo}</div>
											<div className="chart-wrapper">
												<Bar data={graficaAusencias} options={configGraficas.chartAusencias}/>
											</div>
										</Col>
									</Row>
								</CardBody>
								<CardFooter className="graficas-footer">
									<div className="small text-muted text-center graficas-footer-section-title">Totales del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Ausencias</div>
											<strong>{graficaAusencias.sumAusencias}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total Facturadas</div>
											<strong>{graficaAusencias.sumFacturadas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total No Facturadas</div>
											<strong>{graficaAusencias.sumNoFacturadas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Total No Facturado</div>
											<strong><i className="fa fa-usd mr-1"></i>{graficaAusencias.sumTotalNoFacturado}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="danger" value="100" />
										</Col>
									</Row>

									<div className="small text-muted text-center graficas-footer-section-title mt-3">Promedios del período</div>
									<hr className="mt-1 mb-3"/>
									<Row>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Ausencias</div>
											<strong>{graficaAusencias.avgAusencias}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="info" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio Facturadas</div>
											<strong>{graficaAusencias.avgFacturadas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="success" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio No Facturadas</div>
											<strong>{graficaAusencias.avgNoFacturadas}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="warning" value="100" />
										</Col>
										<Col xs="6" sm="3">
											<div className="text-muted">Promedio No Facturado</div>
											<strong><i className="fa fa-usd mr-1"></i>{graficaAusencias.avgMontoNoFacturado}</strong>
											<Progress className="progress-xs mt-2 mb-2" color="danger" value="100" />
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