import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { backupData, getRespaldos, deleteBackup, restoreBackup } from '../../../utils/backup';
import { errores, mensajes } from '../../../config/mensajes';
import Spinner from '../../../components/Spinner/Spinner';
import { overlay, breakpoints } from '../../../config/constants';
import { tablasFormatter } from '../../../utils/formatters';
import LoadingOverlay from 'react-loading-overlay';
import BootstrapTable from 'react-bootstrap-table-next';
import { downloadFile, removeSession, clearSession } from '../../../utils/utils';
	
class Respaldos extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
            loading: false,
            respaldando: false,
            respaldos: [],
            size: '',
            showDeleteModal: false,
            showRestoreModal: false,
            idBackup: '',
            selectedFileName: ''
        };
        this.cargarRespaldos = this.cargarRespaldos.bind(this);
        this.respaldar = this.respaldar.bind(this);
        this.resize = this.resize.bind(this);
        this.descargarRespaldo = this.descargarRespaldo.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
        this.toggleRestore = this.toggleRestore.bind(this);
        this.borrarRespaldo = this.borrarRespaldo.bind(this);
        this.restaurarRespaldo = this.restaurarRespaldo.bind(this);
	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {
        // resize listener
        window.addEventListener("resize", this.resize);
        this.resize();
        // cargo datos de respaldos
        this.cargarRespaldos();
    }

    componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

    resize(){
		this.setState({size: window.innerWidth});
	}
    
    cargarRespaldos() {
        this.loading(true);
        getRespaldos().then( respaldos => {
			this.setState({respaldos});
			this.loading(false);
		});
    }

	respaldar() {
		this.setState({respaldando: true});
		backupData().then( () => {
            NotificationManager.success(mensajes.okBackup);
            this.setState({ respaldando: false });
            // limpio sesión para que recarge los respaldos de la DB
            removeSession('respaldos');
            // cargo datos de respaldos
            this.cargarRespaldos();
        }).catch( error => {
            console.log('Error al respaldar los datos', error);
			NotificationManager.error(errores.errorBackup, 'Error');
		});
    }

    descargarRespaldo(fileName) {
        this.loading(true);
        downloadFile(fileName).then( () => {
            // descarga exitosa
            this.loading(false);
        }).catch( error => {
            console.log('Error al descargar el respaldo', error);
			NotificationManager.error(errores.errorDescarga, 'Error');
		});
    }

    toggleDelete(idBackup, fileName) {
        this.setState({
            showDeleteModal: !this.state.showDeleteModal,
            idBackup : idBackup || '',
            selectedFileName: fileName || ''
        });
    }

    toggleRestore(idBackup, fileName) {
        this.setState({
            showRestoreModal: !this.state.showRestoreModal,
            idBackup : idBackup || '',
            selectedFileName: fileName || ''
        });
    }

    borrarRespaldo() {
        this.loading(true);
        let idBackup = this.state.idBackup,
            fileName = this.state.selectedFileName;
        deleteBackup(idBackup, fileName).then( (error) => {
            if (error) {
                // no se pudo eliminar el archivo
                console.log('No se pudo borrar el archivo', error);
                NotificationManager.warning(mensajes.warningArchivo);    
            } else {
                // eliminación exitosa
                NotificationManager.success(mensajes.okDelete);
            }
            this.toggleDelete();
            // limpio sesión para que recarge los respaldos de la DB
            removeSession('respaldos');
            this.cargarRespaldos();
        }).catch( error => {
            console.log('Error al eliminar el respaldo', error);
			NotificationManager.error(errores.errorBorrar, 'Error');
		});
    }

    restaurarRespaldo() {
        console.log('Restaurando...');
        this.loading(true);
        let fileName = this.state.selectedFileName;

        restoreBackup(fileName).then( hayError => {
            if (hayError) {
                NotificationManager.warning(mensajes.warningRestore);
            } else {
                NotificationManager.success(mensajes.okRestore);
            }
            this.setState({
                showRestoreModal: false,
                idBackup : '',
                selectedFileName: ''
            });
            // limpio sesión para que recarge todos los datos de la DB
            clearSession();
            this.cargarRespaldos();

        }).catch( error => {
            console.log('Error al realizar el respaldo', error);
            NotificationManager.error(errores.errorRestore, 'Error');
        });

    }

    finRespaldo() {

    }
    
	render() {

        const columns = [{
			dataField: 'id',
			text: '',
            headerAttrs: { width: '88px' },
            formatter: tablasFormatter.actionsRespaldo,
            formatExtraData: {
                descargar: this.descargarRespaldo,
                eliminar: this.toggleDelete,
                restaurar: this.toggleRestore
            }
		}, {
			dataField: 'fecha.seconds',
			text: 'Fecha',
            formatter: tablasFormatter.fechaHora,
            sort: true
        }, {
            dataField: 'pacientes',
            text: 'Pacientes',
            align: 'right', headerAlign: 'right',
            hidden: this.state.size < breakpoints.sm
        }, {
			dataField: 'sesiones',
            text: 'Sesiones',
            align: 'right', headerAlign: 'right',
            hidden: this.state.size < breakpoints.sm
        }, {
			dataField: 'prepagas',
            text: 'Prepagas',
            align: 'right', headerAlign: 'right',
            hidden: this.state.size < breakpoints.sm
        }, {
			dataField: 'size',
            text: 'Tamaño',
            formatter: tablasFormatter.fileSize,
            align: 'right', headerAlign: 'right',
            hidden: this.state.size < breakpoints.sm
        }];

		return (
			<div className="animated fadeIn listaRespaldos">
                <Card className="mainCard">
                    <CardHeader>
                        <i className="fa fa-database fa-lg"></i> Respaldos
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs="12" sm="6">
                                <div className="d-flex flex-row mb-2 mr-auto">										
                                    <Button color="success" size="sm" title="Respaldar datos" onClick={this.respaldar} disabled={this.state.loading}>
                                        {this.state.respaldando ? <Spinner/> : <i className="fa fa-cloud-upload mr-2"></i>}Respaldar datos
                                    </Button>                                    
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <LoadingOverlay
                                    active={this.state.loading}
                                    animate
                                    spinner
                                    color={overlay.color}
                                    background={overlay.background}>
                                    <BootstrapTable
                                        keyField='id'
                                        data={this.state.respaldos}
                                        columns={columns}
                                        classes="tablaRespaldos"
                                        noDataIndication='No hay respaldos generados'
                                        bootstrap4
                                        bordered={false}
                                        striped
                                        hover 
                                    />
                                </LoadingOverlay>
                            </Col>
                        </Row>
                        <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDelete} className={'modal-md modal-danger'}>
                            <ModalHeader toggle={this.toggleDelete}>Eliminar Respaldo</ModalHeader>
                            <ModalBody>
                                Confirme la eliminación del respaldo seleccionado. Esta acción no podrá deshacerse.
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" size="sm" onClick={this.borrarRespaldo}>
                                    {this.state.loading && <Spinner/>}Eliminar
						        </Button>
                                <Button color="secondary" size="sm" onClick={this.toggleDelete}>Cancelar</Button>
                            </ModalFooter>
                        </Modal>
                        <Modal isOpen={this.state.showRestoreModal} toggle={this.toggleRestore} className={'modal-lg modal-purple'}>
                            <ModalHeader toggle={this.toggleRestore}>Restaurar Respaldo</ModalHeader>
                            <ModalBody>
                                Al restaurar el respaldo se agregarán todos los datos del respaldo seleccionado que no se encuentren en los datos actuales (pacientes, sesiones y prepagas que hayan sido eliminados).<br/>
                                Cualquier dato modificado o ingresado con fecha posterior al respaldo se mantendrá inalterado.<br/>
                                Esta acción no podrá deshacerse.
                            </ModalBody>
                            <ModalFooter>
                                <Button color="purple" size="sm" onClick={this.restaurarRespaldo}>
                                    {this.state.loading && <Spinner/>}{this.state.loading ? 'Restaurando' : 'Restaurar'}
						        </Button>
                                <span className="text-muted mr-auto">{this.state.selectedFileName}</span>
                                <Button color="secondary" size="sm" onClick={this.toggleRestore} disabled={this.state.loading}>Cancelar</Button>
                            </ModalFooter>
                        </Modal>
                    </CardBody>
                </Card>
			</div>
		);
	}
}

export default Respaldos;
