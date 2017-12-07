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
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Loader from 'react-loaders';
import db from '../../fire';
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga, calcPorcentajesSesiones, cargarPrepagas, tipoFormatter, priceFormatter, prepagaFormatter, pacientesMap, dateFormatter, errores, tipoLoader, meses, enumFormatter, boolFormatter } from '../../constants';
import { NotificationManager } from 'react-notifications';

import moment from 'moment';
moment.locale("es");

class ListaSesiones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sesiones: [],
			filtroPrepagas: {},
			pacientesMap: {},
			loading: true,
			showDeleteModal: false,
			selected: [],
			filtroMes: '',
			filtroAnio: ''
		};
		this.nuevaSesion = this.nuevaSesion.bind(this);
		this.cargarSesiones = this.cargarSesiones.bind(this);
		this.borrarSesiones = this.borrarSesiones.bind(this);
		this.deleteSesiones = this.deleteSesiones.bind(this);
		this.loading = this.loading.bind(this);
		this.loadSesiones = this.loadSesiones.bind(this);
		this.toggleDelete = this.toggleDelete.bind(this);
		this.onSelectAll = this.onSelectAll.bind(this);
		this.onRowSelect = this.onRowSelect.bind(this);
		this.changePeriodo = this.changePeriodo.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
	}

	componentDidMount(){
		this.loading(true);
		cargarPrepagas().then( () => {
			this.initFiltros();
			this.setState({filtroPrepagas: window.filtroPrepagas});
			pacientesMap().then( () => {
				this.setState({pacientesMap: window.pacientesMap});
				this.cargarSesiones();
			});			
		});
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

	cargarSesiones(){
		db.collection("sesiones")
		.where("mes","==",parseInt(this.state.filtroMes))
		.where("anio","==",parseInt(this.state.filtroAnio))		
		.orderBy("dia","desc")
		.get().then( querySnapshot => {			
			this.loadSesiones(querySnapshot);
			this.loading(false);
		});
	}

	loadSesiones(querySnapshot){
		let sesiones = [];
		querySnapshot.docs.forEach( doc => {            
			let sesion = doc.data();
			sesion.id = doc.id;
			sesion.nombreCompleto = this.state.pacientesMap[sesion.paciente].nombreCompleto;
			sesiones.push(sesion);
		});
		this.setState({sesiones});
		console.log('sesiones', this.state.sesiones);
	}

	loading(val){
        this.setState({loading: val});
	}
	
	nuevaSesion(){
		this.props.history.push('/sesiones/new');
	}

	borrarSesiones(){
		if (this.state.selected.length == 0){
			NotificationManager.warning(errores.sesionesVacias);
		} else {
			this.toggleDelete();
		}
	}

	deleteSesiones(){

		this.loading(true);
		this.toggleDelete();

		// Get a new write batch
		let batch = db.batch();                
		
		this.state.selected.forEach( sesion => {
			let refSession = db.collection("sesiones").doc(sesion);
			batch.delete(refSession);
		});

		//Commit the batch
		batch.commit().then(() => {			
			console.log("Sesiones borradas correctamente");
			NotificationManager.success('Las sesiones han sido borradas');
			// recargo datos y limpio selección
			this.setState({selected: []});
			this.cargarSesiones();
		})
		.catch((error) => {
			console.error("Error borrando sesiones: ", error);
			NotificationManager.error(errores.errorBorrar, 'Error');
			this.loading(false);
		});
	}

	toggleDelete(){
		this.setState({showDeleteModal: !this.state.showDeleteModal});
	}

	onRowSelect({ id }, isSelected) {
		if (isSelected) {
			this.setState({selected: [...this.state.selected, id]});
		} else {
			this.setState({ selected: this.state.selected.filter(it => it !== id) });
		}
		return false;
	}

	onSelectAll(isSelected) {
		if (!isSelected) {
			this.setState({ selected: [] });
		} else {
			this.setState({ selected: this.state.sesiones.map( s => s.id)});
		}
		return false;
	}

	changePeriodo(){
		this.setState({
			filtroMes: this.inputMes.value,
			filtroAnio: this.inputAnio.value,
			loading: true
		}, () => {
			this.cargarSesiones();
		});
	}
	
	render() {

		const options = {
			noDataText: 'No hay sesiones registradas',
		}

		const selectRowProp = {
			mode: 'checkbox',
			clickToSelect: true,
			bgColor: '#ddf7ff',
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
			selected: this.state.selected
		  };

		return (
			<div className="animated fadeIn">
				<Loader type={tipoLoader} active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn listaSesiones"}>                
					<Row>
						<Col>
							<Card>
								<CardHeader>
									<i className="fa fa-comments fa-lg"></i> Sesiones
								</CardHeader>
								<CardBody>
									<div className="d-flex flex-row mb-2 mr-auto">
										<Button color="primary" size="sm" onClick={this.nuevaSesion}><i className="fa fa-plus"></i> Nueva sesión</Button>
										<Button color="danger" size="sm" onClick={this.borrarSesiones}><i className="fa fa-eraser"></i> Borrar sesiones</Button>
										
										<Button color="dark" size="sm" onClick={()=>{
										
											let batch = db.batch();
											this.loading(true);

											let mes = 12;
											let paciente = '1itK8nRb4nPcQYujIut6'; // alfredo
											for (let dia = 1; dia <= 23; dia++) {
												for (let index = 0; index < 1; index++) {
													let newSession = db.collection("sesiones").doc();
													batch.set(newSession, {
														fecha: moment(`${dia}/${mes}/${anio}`, 'D-M-YYYY').format('L'),
														paciente,
														anio: 2017,
														mes,
														dia,
														tipo: 'P',
														valor: 100										
													});
												}												
											}
											mes = 11;
											paciente = 'wIdMqPhOydB7qzRF4CoM'; // ely
											for (let dia = 5; dia <= 10; dia++) {
												for (let index = 0; index < 1; index++) {
													let newSession = db.collection("sesiones").doc();
													batch.set(newSession, {	
														fecha: moment(`${dia}/${mes}/${anio}`, 'D-M-YYYY').format('L'),
														paciente,
														anio: 2017,
														mes,
														dia,
														tipo: 'P',
														valor: 100										
													});
												}												
											}
											
											//Commit the batch
											batch.commit().then(() => {
												this.loading(false);
												console.log("Sesiones generadas correctamente");
												NotificationManager.success('Los datos han sido guardados');
												this.cargarSesiones();											
											})
											.catch((error) => {
												console.error("Error generando sesiones: ", error);
												NotificationManager.error(errores.errorGuardar, 'Error');
												this.loading(false);
											});

										}}><i className="fa fa-eraser"></i> Cargar sesiones de prueba</Button>
									</div>
									<hr/>
									<div className="filtros-sesiones mt-2 mb-2">
										<Form inline>
											<FormGroup>
												<Label className="mr-1" htmlFor="mes">Mes</Label>
												<Input type="select" bsSize="sm" name="mes" id="mes" innerRef={el => this.inputMes = el} onChange={this.changePeriodo}>
													{ meses.map( (value, index) => <option key={index} value={index+1}>{value}</option>)}						
												</Input>
											</FormGroup>
											<FormGroup>
												<Label className="ml-2" htmlFor="anio">Año</Label>
												<Input className="ml-2" type="number" bsSize="sm" name="anio" id="anio" innerRef={el => this.inputAnio = el} onChange={this.changePeriodo} />
											</FormGroup>											
										</Form>
									</div>
									<BootstrapTable ref="table" version='4'
										data={this.state.sesiones}
										bordered={false}
										striped hover condensed
										options={options}
										selectRow={selectRowProp}
										>
										<TableHeaderColumn 
											hidden
											dataField='id' isKey
											dataAlign='center'
											>											
										</TableHeaderColumn>										
										<TableHeaderColumn
											dataField='fecha'
											width="90"
											>
											<span className="thTitle">Fecha</span>
										</TableHeaderColumn>										
										<TableHeaderColumn
											dataField='nombreCompleto'
											dataSort
											width="250">
											<span className="thTitle">Paciente</span>
										</TableHeaderColumn>										
										<TableHeaderColumn 
											dataField='tipo'
											dataFormat={ tipoFormatter }
											>
											<span className="thTitle">Tipo</span>
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='prepaga'
											dataFormat={ prepagaFormatter } 											
											dataSort
											>
											<span className="thTitle">Prepaga</span>
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='facturaPrepaga'
											dataFormat={enumFormatter} formatExtraData={boolFormatter}
											dataAlign="center"
											>
											<span className="thTitle">Factura</span>
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='valor'
											dataAlign='right'
											dataFormat={ priceFormatter }
											>
											<span className="thTitle">Valor</span>
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='copago'
											dataAlign='right'
											dataFormat={ priceFormatter }
											>
											<span className="thTitle">Copago</span>
										</TableHeaderColumn>										
									</BootstrapTable>
								</CardBody>
							</Card>
						</Col>
					</Row>
					<Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDelete} className={'modal-md modal-danger'}>
					<ModalHeader toggle={this.toggleDelete}>Borrar sesiones</ModalHeader>
					<ModalBody>
						Confirme la eliminación de las sesiones seleccionadas ({this.state.selected.length}). Esta acción no podrá deshacerse.
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" size="sm" onClick={this.toggleDelete}>Cancelar</Button>{' '}
						<Button color="danger" size="sm" onClick={this.deleteSesiones}>Borrar</Button>
					</ModalFooter>
					</Modal>
				</div>
			</div>
		)
	}

}

export default ListaSesiones;