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
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga, calcPorcentajesSesiones, cargarPrepagas, tipoFormatter, priceFormatter, prepagaFormatter, pacientesMap, dateFormatter, errores, tipoLoader, meses } from '../../constants';
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
			loading: false,
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
		this.changeFiltros = this.changeFiltros.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
	}

	componentWillMount(){
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
		.orderBy("anio","desc").orderBy("mes","desc").orderBy("dia","desc")
		.get().then( querySnapshot => {			
			this.loadSesiones(querySnapshot);
			this.loading(false);
		});
	}

	loadSesiones(querySnapshot){
		console.log('querySnapshot', querySnapshot, querySnapshot.size);
		let sesiones = [];
		// let queryFilter = querySnapshot.docs.filter(e =>{
		// 	return ( e.data().mes == this.state.filtroMes && e.data().anio == this.state.filtroAnio);
		// });
		// queryFilter.forEach( doc => {            
		// 	let sesion = doc.data();
		// 	sesion.id = doc.id;
		// 	sesion.nombreCompleto = this.state.pacientesMap[sesion.paciente].nombreCompleto;
		// 	sesiones.push(sesion);
		// });
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

	changeFiltros(){
		this.setState({
			filtroMes: this.inputMes.value,
			filtroAnio: this.inputAnio.value
		}, () => {
			console.log('Recargando sesiones...');
			this.cargarSesiones();
		});
		
	}
	
	render() {

		const options = {
			noDataText: 'No hay sesiones registradas',
			onFilterChange: this.onFilterChange
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
									<i className="fa fa-comments"></i> Sesiones
								</CardHeader>
								<CardBody>
									<div className="d-flex flex-row mb-2 mr-auto">
										<Button color="primary" size="sm" onClick={this.nuevaSesion}><i className="fa fa-plus"></i> Nueva sesión</Button>
										<Button color="danger" size="sm" onClick={this.borrarSesiones}><i className="fa fa-eraser"></i> Borrar sesiones</Button>
										<Button color="dark" size="lg" onClick={()=>{
										
										let batch = db.batch();

										this.loading(true);
										for (let index = 0; index < 100; index++) {
											let newSession = db.collection("sesiones").doc();
											batch.set(newSession, {												
												fecha: '2017-12-12',
												paciente: 'CdnL0BZCCknL4Vkq4Bd0',
												anio: 2017,
												mes: 12,
												dia: 12,
												tipo: 'P',
												valor: 100													
											});
										}
										for (let index = 0; index < 100; index++) {
											let newSession = db.collection("sesiones").doc();
											batch.set(newSession, {
												fecha: '2017-11-11',
												paciente: 'CdnL0BZCCknL4Vkq4Bd0',
												anio: 2017,
												mes: 11,
												dia: 11,
												tipo: 'P',
												valor: 100													
											});											
										}
										for (let index = 0; index < 100; index++) {
											let newSession = db.collection("sesiones").doc();
											batch.set(newSession, {
												fecha: '2017-10-10',
												paciente: 'CdnL0BZCCknL4Vkq4Bd0',
												anio: 2017,
												mes: 10,
												dia: 10,
												tipo: 'P',
												valor: 100														
											});
										}
										for (let index = 0; index < 100; index++) {
											let newSession = db.collection("sesiones").doc();
											batch.set(newSession, {
												fecha: '2017-09-09',
												paciente: 'CdnL0BZCCknL4Vkq4Bd0',
												anio: 2017,
												mes: 9,
												dia: 9,
												tipo: 'P',
												valor: 100													
											});

										}
										for (let index = 0; index < 100; index++) {
											let newSession = db.collection("sesiones").doc();
											batch.set(newSession, {
												fecha: '2017-08-08',
												paciente: 'CdnL0BZCCknL4Vkq4Bd0',
												anio: 2017,
												mes: 8,
												dia: 8,
												tipo: 'P',
												valor: 100													
											});
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

										}}><i className="fa fa-eraser"></i> Cargar 500 sesiones</Button>
									</div>
									<hr/>
									<div className="filtros-sesiones mt-2 mb-2">
										<Form inline>
											<FormGroup>
												<Label className="mr-1" htmlFor="mes">Mes</Label>
												<Input type="select" bsSize="sm" name="mes" id="mes" innerRef={el => this.inputMes = el} onChange={this.changeFiltros}>
													{ meses.map( (value, index) => <option key={index} value={index+1}>{value}</option>)}						
												</Input>
											</FormGroup>
											<FormGroup>
												<Label className="mr-1" htmlFor="anio">Año</Label>
												<Input type="number" bsSize="sm" name="anio" id="anio" innerRef={el => this.inputAnio = el} onChange={this.changeFiltros} />
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
											dataFormat={ dateFormatter }
											dataSort>
											<span className="thTitle">Fecha</span>
										</TableHeaderColumn>										
										<TableHeaderColumn
											dataField='nombreCompleto'
											dataSort>
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
											dataField='valor'
											dataAlign='right'
											dataFormat={ priceFormatter }
											>
											<span className="thTitle">Valor</span>
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