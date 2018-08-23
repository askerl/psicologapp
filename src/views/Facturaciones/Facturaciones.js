import React, {Component} from 'react';
import {
	Row,
	Col,
	Button,
	Card, CardTitle,
	CardHeader,
	CardFooter,
	CardBody,
	Form, FormGroup, Label, Input, InputGroup,
	Progress
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { priceFormatter, meses, prepagas, tableColumnClasses, mesesFormat } from '../../config/constants';
import { round } from '../../utils/utils';
import { getFacturacionesPeriodo } from '../../utils/calcularFacturaciones';
import { errores } from '../../config/mensajes';
import { tablasFormatter } from '../../utils/formatters'
import { NotificationManager } from 'react-notifications';
import { StatItem } from '../Widgets/WidgetsAuxiliares';
import { Bar } from 'react-chartjs-2';

import moment from 'moment';
moment.locale("es");

class Facturaciones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			facturaciones: [],
			grafica: {},
			optsGrafica: {},
			pacientesMap: {},
			showResultados: false,
			loading: false,
			periodo: ''
		};
		this.loading = this.loading.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
		this.getFacturacion = this.getFacturacion.bind(this);
		this.validarPeriodo = this.validarPeriodo.bind(this);
	}
	
	componentDidMount(){
		this.initFiltros();
	}

	initFiltros(){
		let hoy = moment(new Date());
		let mes = hoy.month()+1;
		let anio = hoy.year();
		this.mesIni.value = mes;
		this.anioIni.value = anio;
		this.mesFin.value = mes; 
		this.anioFin.value = anio;
	}

	loading(val){
        this.setState({loading: val});
	}

	getFacturacion(){

		this.loading(true);

		// oculto resultados anteriores
		if (this.state.showResultados){
			this.setState({showResultados: false});	
		}

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
	
	expandComponent(row) {
		return (
			<ExpandRowComp rowData={row}/>
		);
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
			//headerAttrs: { width: '130px' },
			sort: true,
		},{
			dataField: 'mes',
			text: 'Mes',
			align: 'center', headerAlign: 'center',
			//headerAttrs: { width: '130px' },
			formatter: tablasFormatter.mes,
			formatExtraData: mesesFormat.long,
			sort: true,
		},{
			dataField: 'totalPrivado',
			text: 'Privados',
			align: 'right', headerAlign: 'right',
			//headerAttrs: { width: '130px' },
			formatter: tablasFormatter.precio,
			sort: true,
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
		},{
			dataField: 'totalPrepaga',
			text: 'Prepagas',
			align: 'right', headerAlign: 'right',
			//headerAttrs: { width: '130px' },
			formatter: tablasFormatter.precio,
			sort: true,
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
		},{
			dataField: 'totalCopago',
			text: 'Copagos',
			align: 'right', headerAlign: 'right',
			//headerAttrs: { width: '130px' },
			formatter: tablasFormatter.precio,
			sort: true,
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
		},{
			dataField: 'total',
			text: 'Total',
			align: 'right', headerAlign: 'right',
			//headerAttrs: { width: '130px' },
			formatter: tablasFormatter.precio,
			sort: true
		}];

		return (
			<div className="animated fadeIn facturaciones">				
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
													<Button color="primary" size="sm" onClick={this.getFacturacion}><i className="fa fa-search"></i> Consultar</Button>
													{ this.state.loading &&
													<div className="spinner-container">
														<i className={"fa fa-spinner fa-lg " + (this.state.loading ? 'fa-spin' : '')}></i>
													</div>}								
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
										bordered={ false }
										bootstrap4
										hover
									/>
									// <BootstrapTable ref="table" version='4'
									// 	data={this.state.facturaciones}
									// 	bordered={false}
									// 	hover //striped
									// 	options={options}
									// 	expandableRow={this.isExpandableRow}
									// 	expandComponent={this.expandComponent}
									// 	expandColumnOptions={{ expandColumnVisible: true }}
									// >
									// 	<TableHeaderColumn
									// 		hidden
									// 		dataField='id' isKey
									// 		dataAlign='center'
									// 	>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='anio'
									// 		dataSort>
									// 		<span className="thTitle">Año</span>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='mes'
									// 		dataSort>
									// 		<span className="thTitle">Mes</span>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='totalPrivado'
									// 		dataFormat={priceFormatter}
									// 		dataSort
									// 	>
									// 		<span className="thTitle">Privados</span>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='totalPrepaga'
									// 		dataFormat={priceFormatter}
									// 		dataSort
									// 	>
									// 		<span className="thTitle">Prepagas</span>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='totalCopago'
									// 		dataFormat={priceFormatter}
									// 		dataSort
									// 	>
									// 		<span className="thTitle">Copagos</span>
									// 	</TableHeaderColumn>
									// 	<TableHeaderColumn
									// 		dataField='total'
									// 		dataFormat={priceFormatter}
									// 		dataSort
									// 	>
									// 		<span className="thTitle">Total</span>
									// 	</TableHeaderColumn>
									// </BootstrapTable>
								}
							</CardBody>
						</Card>
					</Col>
				</Row>
				{this.state.showResultados && this.state.grafica !== null &&
					<Row>
						<Col>
							<Card>
								<CardBody>
									<Row>
										<Col>
											<CardTitle className="mb-0">Gráfica</CardTitle>
											<div className="small text-muted">{this.state.periodo}</div>
										</Col>
									</Row>
									<div className="chart-wrapper">
										<Bar data={this.state.grafica} options={this.state.optsGrafica} height={300} />
									</div>
								</CardBody>
								<CardFooter>
									<ul>
										<li>
											<div className="text-muted">Total</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumTotal}</strong>
											<Progress className="progress-xs mt-2" color="success" value="100" />
										</li>
										<li>
											<div className="text-muted">Privados</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumPrivados}</strong>
											<Progress className="progress-xs mt-2" color="warning" value="100" />
										</li>
										<li>
											<div className="text-muted">Prepagas</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumPrepagas}</strong>
											<Progress className="progress-xs mt-2" color="info" value="100" />
										</li>
										<li>
											<div className="text-muted">Copagos</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumCopagos}</strong>
											<Progress className="progress-xs mt-2" color="teal" value="100" />
										</li>										
									</ul>
								</CardFooter>
							</Card>
						</Col>
					</Row>
				}
			</div>
		)
	}

}

const ExpandRowComp = ({rowData}) => {

	let li = prepagas.map(item => {
		let valor = rowData.prepagas[item.id];
		let porc = round(valor / rowData.totalPrepaga * 100, 2);
		return(
			<li key={item.id}><StatItem title={item.nombre} value={`$ ${valor}`} porc={`${porc}`} color="info" /></li>
		)
	});
	return (
		<div>
			<ul className="horizontal-bars type-2">
			{li}
			</ul>
		</div>
	);
}

export default Facturaciones;