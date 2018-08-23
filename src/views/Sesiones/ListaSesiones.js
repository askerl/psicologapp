import React, {Component} from 'react';
import {
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardBody,
	Input,
	Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import Loader from 'react-loaders';
import db from '../../fire';
import { pacientesMap, tipoLoader, meses, arrayRemoveDuplicates } from '../../config/constants';
import {errores} from '../../config/mensajes';
import { NotificationManager } from 'react-notifications';
import {tablasFormatter} from '../../config/formatters';

import moment from 'moment';
moment.locale("es");

class ListaSesiones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sesiones: [],
			pacientesMap: {},
			loading: true,
			showDeleteModal: false,
			selected: [],
			selectedPacientes: []
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
		this.initFiltros();
		pacientesMap().then( () => {
			this.setState({pacientesMap: window.pacientesMap});
			this.cargarSesiones();
		});			
	}

	initFiltros(){
		let hoy = moment(new Date());
		let mes = hoy.month()+1;
		let anio = hoy.year();
		this.inputMes.value = mes;
		this.inputAnio.value = anio; 
	}

	cargarSesiones(){
		db.collection("sesiones")
		.where("mes","==",parseInt(this.inputMes.value))
		.where("anio","==",parseInt(this.inputAnio.value))		
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
			sesion.fecha = sesion.fecha.seconds;
			sesion.nombreCompleto = this.state.pacientesMap[sesion.paciente].nombreCompleto;
			sesion.credencial = this.state.pacientesMap[sesion.paciente].credencial;
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
			// elimino sesion
			batch.delete(refSession);
		});

		// resto 1 a los pocientes seleccionados
		let selectedPacientes = arrayRemoveDuplicates(this.state.selectedPacientes);
		selectedPacientes.forEach( pac => {			
			// busco al paciente en la lista de sesiones y
			// resto 1 sesion utilizada al paciente
			let pacRef = db.collection("pacientes").doc(pac);
			let sesionesPac = this.state.pacientesMap[pac].sesiones;
			if (sesionesPac > 0){
				batch.update(pacRef, { sesiones: sesionesPac -1 })
			}
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

	onRowSelect({ id, paciente }, isSelected) {
		if (isSelected) {
			this.setState({selected: [...this.state.selected, id]});
			this.setState({selectedPacientes: [...this.state.selectedPacientes, paciente]});
		} else {
			this.setState({ selected: this.state.selected.filter(it => it !== id) });
			this.setState({ selectedPacientes: this.state.selectedPacientes.filter(it => it !== paciente) });
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
			loading: true
		}, () => {
			this.cargarSesiones();
		});
	}

	render() {

		const options = {
			noDataText: 'No hay sesiones registradas',
			searchField: createCustomSearchField,
			searchPosition: 'left'
		}

		const selectRowProp = {
			mode: 'checkbox',
			clickToSelect: true,
			bgColor: '#ddf7ff',
			onSelect: this.onRowSelect,
			onSelectAll: this.onSelectAll,
			selected: this.state.selected
		};

		const { SearchBar } = Search;
		const columns = [{
			dataField: 'id',
			text: 'Session ID',
			hidden: true
		}, {
			dataField: 'fecha',
			text: 'Fecha',
			formatter: tablasFormatter.fecha
		}, {
			dataField: 'nombreCompleto',
			text: 'Paciente'
		}, {
			dataField: 'tipo',
			text: 'Tipo',
			formatter: tablasFormatter.tipoPaciente
		}, {
			dataField: 'prepaga',
			text: 'Prepaga',
			formatter: tablasFormatter.prepaga
		}, {
			dataField: 'credencial',
			text: 'Credencial',
		}, {
			dataField: 'facturaPrepaga',
			text: 'Factura',
			align: 'center', headerAlign: 'center',
			formatter: tablasFormatter.factura,
			formatExtraData: tablasFormatter.boolFormatter
		}, {
			dataField: 'valor',
			text: 'Valor',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio
		}, {
			dataField: 'copago',
			text: 'Copago',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio
		}];

		return (
			<div className="animated fadeIn listaSesiones">
				<Row>
					<Col>
						<Card>
							<CardHeader>
								<i className="fa fa-comments fa-lg"></i> Sesiones
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
										<div className="filtros d-flex flex-row mb-2 justify-content-sm-end">
											<Input className="mes" type="select" bsSize="sm" name="mes" id="mes" innerRef={el => this.inputMes = el} onChange={this.changePeriodo}>
												{meses.map((value, index) => <option key={index} value={index + 1}>{value}</option>)}
											</Input>
											<Input className="anio ml-2" type="number" bsSize="sm" name="anio" id="anio" innerRef={el => this.inputAnio = el} onChange={this.changePeriodo} />
										</div>
									</Col>
								</Row>
								<hr className="mb-2"/>
								<Loader type={tipoLoader} active={this.state.loading} />
								{!this.state.loading &&
									<ToolkitProvider
										keyField='id'
										data={this.state.sesiones} 
										columns={columns}
										search={ {searchFormatted: true} }
									>
									{
										props => (
											<div>
												<SearchBar { ...props.searchProps } 
													placeholder="Buscar..."
													className={`${tablasFormatter.filterClass} mb-2`}
												/>
												<BootstrapTable	{ ...props.baseProps }
													classes="tablaSesiones table-sm"
													defaultSortDirection="asc"
													noDataIndication='No hay sesiones registradas'
													bootstrap4
													bordered={ false }
													striped
													hover
												/>
											</div>
										)
									}
									</ToolkitProvider>
								}
								{/* {!this.state.loading &&
									<BootstrapTable ref="table" version='4'
										data={this.state.sesiones}
										bordered={false}
										striped hover condensed
										options={options}
										selectRow={selectRowProp}
										search
									>
									</BootstrapTable>
								} */}
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
						<Button color="danger" size="sm" onClick={this.deleteSesiones}>Borrar</Button>
						<Button color="secondary" size="sm" onClick={this.toggleDelete}>Cancelar</Button>{' '}
					</ModalFooter>
				</Modal>
			</div>
		)
	}

}

export default ListaSesiones;