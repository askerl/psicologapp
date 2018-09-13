import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import { Badge, Button, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import ExportCSV from '../../components/ExportCSV/exportCSV';
import Spinner from '../../components/Spinner/Spinner';
import { breakpoints, overlay } from '../../config/constants';
import { errores } from '../../config/mensajes';
import { tablasFormatter } from '../../utils/formatters';
import { getPaciente, getSesionesPaciente, updateEvolucionSesion } from '../../utils/utils';

class HistoriaClinica extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: this.props.id,
            loading: true,
            paciente: {},
            sesiones: [],
            size: '',
            showEditModal: false,
            idEditSesion: '',
            evolucion: ''
        };
        this.loading = this.loading.bind(this);
        this.resize = this.resize.bind(this);
        this.cargarHC = this.cargarHC.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateEvolucion = this.updateEvolucion.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize);
        this.resize();
        this.loading(true);
        this.cargarHC();
    }

    componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

    loading(loading) {
        this.setState({loading});
    }

    cargarHC() {
        let id = this.state.id;
        getPaciente(id).then( paciente => {
            this.setState({paciente});
        }).then(getSesionesPaciente(id).then( sesiones => {
            // console.log('sesiones del paciente', sesionesPaciente);
            this.setState({sesiones});
            this.loading(false);
        })).catch(error => { 
            console.log('Error al cargar los datos del paciente', error);
            NotificationManager.error(errores.errorCargarDatosPaciente, 'Error');
            this.loading(false);
            this.props.goBack();
        });
    }

    resize(){
		this.setState({size: window.innerWidth});
    }
    
    toggleEdit(id) {
        let oldValue = _.get(_.find(this.state.sesiones, {'id': id}),'evolucion','');
        this.setState({
            showEditModal: !this.state.showEditModal, 
            idEditSesion: id || '',
            evolucion: oldValue
        });
    }

    updateEvolucion() {
        let idSesion = this.state.idEditSesion,
            oldValue = _.trim(this.state.evolucion),
            newValue = _.trim(this.inputEvolucion.value);

        // veo si cambió el valor, sino no hago nada
        if ( idSesion && (newValue !== oldValue) ) {            
            this.loading(true);
            updateEvolucionSesion(idSesion, newValue).then(() => {
                NotificationManager.success('Los datos han sido guardados');
                this.toggleEdit();
                this.cargarHC();
            }).catch( error => {
                console.log('Error actualizando evolución de sesión', error);
                NotificationManager.error(errores.errorGuardar, 'Error');
                this.toggleEdit();
                this.loading(false);
            });
        } else {
            NotificationManager.warning(errores.datosSinModificar, 'Advertencia');
        }
    }

    render() {
        let paciente = this.state.paciente;
        
        const { SearchBar } = Search;

        const csvFileName = `${_.trim(paciente.apellido)}-${_.trim(paciente.nombre)}.csv`;

        const columns = [{
			dataField: 'id',
			text: '',
            headerAttrs: { width: '36px' },
            formatter: tablasFormatter.actionsHistoriaClinica,
            formatExtraData: this.toggleEdit,
            csvExport: false
        }, {
			dataField: 'nro',
			text: 'Nro.',
            headerAttrs: { width: '60px' },
            align: 'right', headerAlign: 'right',
            sort: true,
            hidden: this.state.size < breakpoints.sm
		}, {
			dataField: 'fecha.seconds',
			text: 'Fecha',
			headerAttrs: { width: '100px' },
            formatter: tablasFormatter.fecha,
            csvFormatter: tablasFormatter.fecha,
            sort: true
		}, {
			dataField: 'evolucion',
            text: 'Evolución'
        }];

        const defaultSorted = [{
            dataField: 'nro',
            order: 'desc'
          }];

        const totalSesiones = this.state.sesiones.length;
        
        return (
            <div className="animated fadeIn historiaClinica">
                    <Row>
                        <Col>
                            <div className="d-flex align-items-center mb-3">
                                <h5 className="mr-2 mb-0">{paciente.nombreCompleto}</h5>
                                {tablasFormatter.tipoPaciente(paciente.tipo)}
                                <Badge color="purple" className="badge-pill ml-2">{totalSesiones}</Badge>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ToolkitProvider
                                keyField='id'
                                data={this.state.sesiones}
                                columns={columns}
                                search={{searchFormatted: true}}
                                exportCSV={{fileName: csvFileName}}>
                                {
                                    props => (
                                        <div>
                                            <div className="hcToolbar d-flex">
                                                <SearchBar {...props.searchProps}
                                                    placeholder="Buscar..."
                                                    className={`${tablasFormatter.filterClass} mb-2 mr-2`} />
                                                <ExportCSV { ...props.csvProps } />
                                            </div>
                                            <LoadingOverlay
                                            active={this.state.loading}
                                            animate
                                            spinner
                                            color={overlay.color}
                                            background={overlay.background}>
                                            <BootstrapTable	{...props.baseProps}
                                                classes="tablaHC"
                                                defaultSortDirection="asc"
                                                defaultSorted={ defaultSorted }
                                                noDataIndication='No hay sesiones registradas'
                                                bootstrap4
                                                bordered={false}
                                                striped
                                                hover 
                                                />
                                            </LoadingOverlay>
                                        </div>
                                    )
                                }
                            </ToolkitProvider>
                        </Col>
                    </Row>
                    <Modal isOpen={this.state.showEditModal} toggle={this.toggleEdit} className={'modal-lg modal-teal'}>
                        <ModalHeader toggle={this.toggleEdit}>{this.state.evolucion ? 'Editar' : 'Agregar'} Evolución</ModalHeader>
                        <ModalBody>
                            <Input type="textarea" id="evolucion" defaultValue={this.state.evolucion} innerRef={el => this.inputEvolucion = el} rows="5" />  
					</ModalBody>
                        <ModalFooter>
                            <Button color="success" size="sm" onClick={this.updateEvolucion}>
                                {this.state.loading && <Spinner />}Guardar
						</Button>
                            <Button color="secondary" size="sm" onClick={this.toggleEdit}>Cancelar</Button>
                        </ModalFooter>
                    </Modal>
            </div>
        );
    }
}

export default HistoriaClinica;
