import React, {Component, cloneElement} from 'react';
import {Link} from 'react-router-dom';
import {
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardFooter,
	CardBody,
	Form, FormGroup, Label, Input,
	Modal, ModalHeader, ModalBody, ModalFooter,
	Progress
} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn, SearchField} from 'react-bootstrap-table';
import Loader from 'react-loaders';
import db from '../../fire';
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga, calcPorcentajesSesiones, cargarPrepagas, tipoFormatter, priceFormatter, prepagaFormatter, pacientesMap, dateFormatter, errores, tipoLoader, meses, enumFormatter, boolFormatter, arrayRemoveDuplicates, getFacturacion, prepagas } from '../../constants';
import { NotificationManager } from 'react-notifications';

import moment from 'moment';
moment.locale("es");

class Facturaciones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			facturaciones: [],
			pacientesMap: {},
			loading: true,
			filtroMes: '',
			filtroAnio: ''
		};
		this.loading = this.loading.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
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
		this.inputMes.value = mes;
		this.inputAnio.value = anio; 
		this.setState({
			filtroMes: mes,
			filtroAnio: anio
		});
	}

	loading(val){
        this.setState({loading: val});
	}
	
	render() {

		const options = {
			noDataText: 'Debe seleccionar el período a consultar',
		}
		
		return (
			<div className="animated fadeIn">
				<Loader type={tipoLoader} active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn listaSesiones"}>                
					<Row>
						<Col>
							<Card>
								<CardHeader>
									<i className="fa fa-book fa-lg"></i> Facturaciones
								</CardHeader>
								<CardBody>
									<Row>
										<Col xs="12" sm="6">
											<div className="d-flex flex-row mb-2 mr-auto">
												<Button color="primary" size="sm" onClick={this.nuevaSesion}><i className="fa fa-plus"></i> Nueva sesión</Button>
												<Button color="danger" size="sm" onClick={this.borrarSesiones}><i className="fa fa-eraser"></i> Borrar sesiones</Button>												
											</div>
										</Col>
										<Col xs="12" sm="6">
											<div className="filtros-sesiones d-flex flex-row mb-2 justify-content-sm-end">
												<Input type="select" bsSize="sm" name="mes" id="mes" innerRef={el => this.inputMes = el} onChange={this.changePeriodo}>
													{ meses.map( (value, index) => <option key={index} value={index+1}>{value}</option>)}						
												</Input>
												<Input className="ml-2" type="number" bsSize="sm" name="anio" id="anio" innerRef={el => this.inputAnio = el} onChange={this.changePeriodo} />
											</div>										
										</Col>
									</Row>
									<hr/>
									<BootstrapTable ref="table" version='4'
										data={this.state.facturaciones}
										bordered={false}
										striped hover condensed
										options={options}
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
								</CardBody>
							</Card>
						</Col>
					</Row>				
				</div>
			</div>
		)
	}

}

export default Facturaciones;