import React, {Component, cloneElement} from 'react';
import {Link} from 'react-router-dom';
import {
	Row,
	Col,
	Button,
	Card, CardTitle,
	CardHeader,
	CardFooter,
	CardBody,
	Form, FormGroup, Label, Input, InputGroup,
	Modal, ModalHeader, ModalBody, ModalFooter,
	Progress
} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn, SearchField} from 'react-bootstrap-table';
import Loader from 'react-loaders';
import db from '../../fire';
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga, calcPorcentajesSesiones, cargarPrepagas, tipoFormatter, priceFormatter, prepagaFormatter, pacientesMap, dateFormatter, errores, tipoLoader, meses, enumFormatter, boolFormatter, arrayRemoveDuplicates, getFacturacion, prepagas, getFacturacionesPeriodo, prepagasById, round, facChartOpts } from '../../constants';
import { NotificationManager } from 'react-notifications';
import { StatItem } from '../Widgets/WidgetsAuxiliares';
import {Line} from 'react-chartjs-2';

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
			loading: true,
			periodo: ''
		};
		this.loading = this.loading.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
		this.getFacturacion = this.getFacturacion.bind(this);
		this.validarPeriodo = this.validarPeriodo.bind(this);
	}
	
	componentDidMount(){
		this.loading(true);
		this.initFiltros();
		this.loading(false);
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
				console.log('Resultado', result);			
				this.setState({showResultados: true, facturaciones: result.facturaciones, grafica: result.grafica.grafica, optsGrafica: result.grafica.optsGrafica});
			});

		}
		
	}

	validarPeriodo(mesIni, anioIni, mesFin, anioFin) {
		console.log('Periodo', mesIni, anioIni, mesFin, anioFin);
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
		
		return (
			<div className="animated fadeIn">
				<Loader type={tipoLoader} active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn facturaciones"}>                
					<Row>
						<Col>
							<Card>
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
												<Button className="mb-3" color="primary" size="sm" onClick={this.getFacturacion}><i className="fa fa-search"></i> Consultar</Button>
											</Col>
										</Row>
									</Form>
									{ this.state.showResultados &&
										<BootstrapTable ref="table" version='4'
											data={this.state.facturaciones}
											bordered={false}
											hover //striped
											options={options}
											expandableRow={this.isExpandableRow}
											expandComponent={ this.expandComponent }
											expandColumnOptions={ { expandColumnVisible: true } }
											>
											<TableHeaderColumn 
												hidden
												dataField='id' isKey
												dataAlign='center'
												>											
											</TableHeaderColumn>										
											<TableHeaderColumn
												dataField='anio'
												dataSort>
												<span className="thTitle">Año</span>
											</TableHeaderColumn>										
											<TableHeaderColumn
												dataField='mes'
												dataSort>
												<span className="thTitle">Mes</span>
											</TableHeaderColumn>										
											<TableHeaderColumn 
												dataField='totalPrivado'
												dataFormat={ priceFormatter }
												dataSort
												>
												<span className="thTitle">Privados</span>
											</TableHeaderColumn>
											<TableHeaderColumn 
												dataField='totalCopago'
												dataFormat={ priceFormatter }
												dataSort
												>
												<span className="thTitle">Copagos</span>
											</TableHeaderColumn>
											<TableHeaderColumn 
												dataField='totalPrepaga'
												dataFormat={ priceFormatter }
												dataSort
												>
												<span className="thTitle">Prepagas</span>
											</TableHeaderColumn>								
											<TableHeaderColumn 
												dataField='total'
												dataFormat={ priceFormatter }
												dataSort
												>
												<span className="thTitle">Total</span>
											</TableHeaderColumn>
										</BootstrapTable>
									}
								</CardBody>
							</Card>
						</Col>
					</Row>			
					{ this.state.showResultados &&			
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
										<Line data={this.state.grafica} options={this.state.optsGrafica} height={300} />
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
											<div className="text-muted">Copagos</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumCopagos}</strong>
											<Progress className="progress-xs mt-2" color="info" value="100" />
										</li>
										<li>
											<div className="text-muted">Prepagas</div>
											<strong><i className="fa fa-usd"></i> {this.state.grafica.sumPrepagas}</strong>
											<Progress className="progress-xs mt-2" color="primary" value="100" />
										</li>																				
									</ul>
								</CardFooter>
							</Card>
						</Col>
					</Row>
					}

				</div>
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