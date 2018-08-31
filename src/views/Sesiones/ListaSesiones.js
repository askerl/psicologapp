import moment from 'moment';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import { Button, Card, CardBody, CardHeader, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { meses, overlay, tableColumnClasses, breakpoints } from '../../config/constants';
import { errores } from '../../config/mensajes';
import db from '../../fire';
import { tablasFormatter } from '../../utils/formatters';
import { getSesionesMes, getSession, removeSession, removeSessionSesionesMes } from '../../utils/utils';
import Spinner from '../../components/Spinner/Spinner';

class ListaSesiones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sesiones: [],
			loading: true,
			showDeleteModal: false,
			selected: [],
			selectedPacientes: [],
			size: ''
		};
		this.nuevaSesion = this.nuevaSesion.bind(this);
		this.cargarSesiones = this.cargarSesiones.bind(this);
		this.borrarSesiones = this.borrarSesiones.bind(this);
		this.deleteSesiones = this.deleteSesiones.bind(this);
		this.loading = this.loading.bind(this);
		this.toggleDelete = this.toggleDelete.bind(this);
		this.onSelectAll = this.onSelectAll.bind(this);
		this.onRowSelect = this.onRowSelect.bind(this);
		this.changePeriodo = this.changePeriodo.bind(this);
		this.initFiltros = this.initFiltros.bind(this);
		this.resize = this.resize.bind(this);
	}
	
	componentDidMount(){
		this.initFiltros();
		this.cargarSesiones();
		window.addEventListener("resize", this.resize);
		this.resize();
	}

	initFiltros(){
		let hoy = moment(new Date());
		let mes = hoy.month()+1;
		let anio = hoy.year();
		this.inputMes.value = mes;
		this.inputAnio.value = anio; 
	}

	cargarSesiones(){
		this.loading(true);
		getSesionesMes(this.inputMes.value, this.inputAnio.value).then( sesiones => {
			this.pacientes = getSession('pacientes');
			this.setState({sesiones});
			this.loading(false);
		});
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
		
		// Get a new write batch
		let batch = db.batch();                
		
		this.state.selected.forEach( sesion => {
			// elimino sesion	
			let refSession = db.collection("sesiones").doc(sesion);
			batch.delete(refSession);
		});

		// resto las sesiones de los pacientes seleccionados
		let sesionesPaciente = _.countBy(this.state.selectedPacientes);
		for (const idPac in sesionesPaciente) {
			const cant = sesionesPaciente[idPac];
			let pacRef = db.collection("pacientes").doc(idPac);
			let sesionesPac = _.find(this.pacientes, {'id': idPac}).sesiones;
			let newCant = sesionesPac - cant >= 0 ? sesionesPac - cant : 0;
			batch.update(pacRef, { sesiones: newCant });
		}

		//Commit the batch
		batch.commit().then(() => {			
			//console.log("Sesiones borradas correctamente");
			NotificationManager.success('Las sesiones han sido borradas');
			// recargo datos y limpio selección
			this.setState({selected: []});
			this.setState({selectedPacientes: []});
			removeSession('pacientes');
			removeSessionSesionesMes(this.inputMes.value, this.inputAnio.value);
			this.toggleDelete();
			this.cargarSesiones(); // cargar sesiones pone loading en false
		})
		.catch((error) => {
			console.error("Error borrando sesiones: ", error);
			NotificationManager.error(errores.errorBorrar, 'Error');
			this.toggleDelete();
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
			this.setState({ selected: this.state.selected.filter(elem => elem !== id) });
			
			let auxArr = [...this.state.selectedPacientes].concat([]);
			let posDelete = _.indexOf(this.state.selectedPacientes, paciente);
			auxArr.splice(posDelete,1);
			this.setState({ selectedPacientes: auxArr});
		}
		return false;
	}

	onSelectAll(isSelected) {
		if (!isSelected) {
			this.setState({ selected: [], selectedPacientes: [] });
		} else {
			let allSes = [], allPac = [];
			this.state.sesiones.forEach( s => {
				allSes.push(s.id);
				allPac.push(s.paciente);
			});
			this.setState({ selected: allSes, selectedPacientes: allPac });
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

	resize(){
		this.setState({size: window.innerWidth});
	}

	render() {

		const selectRow = {
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
			headerAttrs: { width: '100px' },
			formatter: tablasFormatter.fecha
		}, {
			dataField: 'nombreCompleto',
			text: 'Paciente'
		}, {
			dataField: 'tipo',
			text: 'Tipo',
			headerAttrs: { width: '90px' },
			formatter: tablasFormatter.tipoPaciente,
			hidden: this.state.size < breakpoints.sm
		}, {
			dataField: 'prepaga',
			text: 'Prepaga',
			formatter: tablasFormatter.prepaga,
			hidden: this.state.size < breakpoints.lg
		}, {
			dataField: 'credencial',
			text: 'Credencial',
			hidden: this.state.size < breakpoints.lg
		}, {
			dataField: 'facturaPrepaga',
			text: 'Factura',
			headerAttrs: { width: '80px' },
			align: 'center', headerAlign: 'center',
			formatter: tablasFormatter.factura,
			formatExtraData: tablasFormatter.boolFormatter,
			hidden: this.state.size < breakpoints.lg
		}, {
			dataField: 'valor',
			text: 'Valor',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			hidden: this.state.size < breakpoints.sm
		}, {
			dataField: 'copago',
			text: 'Copago',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			hidden: this.state.size < breakpoints.sm
		}];

		return (
			<div className="animated fadeIn listaSesiones">
				<Row>
					<Col>
						<Card className="mainCard">
							<CardHeader>
								<i className="fa fa-comments fa-lg"></i> Sesiones
								</CardHeader>
							<CardBody>
								<Row>
									<Col xs="12" sm="6">
										<div className="d-flex flex-row mb-2 mr-auto">
											<Button color="primary" size="sm" onClick={this.nuevaSesion}><i className="fa fa-plus mr-2"></i>Nueva sesión</Button>
											<Button color="danger" size="sm" onClick={this.borrarSesiones}><i className="fa fa-eraser mr-2"></i>Borrar sesiones</Button>
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
								<LoadingOverlay
									active={this.state.loading}
									animate
									spinner
									color={overlay.color}
									background={overlay.background}>
									<ToolkitProvider
										keyField='id'
										data={this.state.sesiones} 
										columns={columns}
										search={ {searchFormatted: true} }>
									{
										props => (
											<div>
												<SearchBar { ...props.searchProps } 
													placeholder="Buscar..."
													className={`${tablasFormatter.filterClass} mb-2`}/>
												<BootstrapTable	{ ...props.baseProps }
													classes="tablaSesiones table-sm"
													defaultSortDirection="asc"
													noDataIndication='No hay sesiones registradas'
													bootstrap4
													bordered={ false }
													striped
													hover
													selectRow={selectRow}/>
											</div>
										)
									}
									</ToolkitProvider>
								</LoadingOverlay>
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
						<Button color="danger" size="sm" onClick={this.deleteSesiones}>
							{this.state.loading && <Spinner />}Borrar
						</Button>
						<Button color="secondary" size="sm" onClick={this.toggleDelete}>Cancelar</Button>
					</ModalFooter>
				</Modal>
			</div>
		)
	}

}

export default ListaSesiones;