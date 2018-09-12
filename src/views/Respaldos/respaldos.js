import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { backupData, getRespaldos } from '../../utils/backup';
import { errores, mensajes } from '../../config/mensajes';
import Spinner from '../../components/Spinner/Spinner';
import { overlay, breakpoints } from '../../config/constants';
import { tablasFormatter } from '../../utils/formatters';
import LoadingOverlay from 'react-loading-overlay';
import BootstrapTable from 'react-bootstrap-table-next';
import { downloadFile, removeSession } from '../../utils/utils';
	
class Respaldos extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
            loading: false,
            respaldando: false,
            respaldos: [],
            size: ''
        };
        this.cargarRespaldos = this.cargarRespaldos.bind(this);
        this.respaldar = this.respaldar.bind(this);
        this.resize = this.resize.bind(this);
        this.descargarRespaldo = this.descargarRespaldo.bind(this);
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
		backupData().then( data =>{
            NotificationManager.success(mensajes.okBackup);
            this.setState({respaldando: false});
            // limpio sesión para que recarge los respaldos de la DB
            removeSession('respaldos');
            // cargo datos de respaldos
            this.cargarRespaldos();
		}).catch( error => {
			NotificationManager.error(errores.errorBackup, 'Error');
		});
    }

    descargarRespaldo(fileName) {
        this.loading(true);
        downloadFile(fileName).then( () => {
            // descarga exitosa
            this.loading(false);
        }).catch( error => {
			NotificationManager.error(errores.errorDescarga, 'Error');
		});
    }
    
	render() {

        const columns = [{
			dataField: 'id',
			text: '',
            headerAttrs: { width: '36px' },
            formatter: tablasFormatter.actionsRespaldo,
            formatExtraData: this.descargarRespaldo
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
			dataField: 'size',
            text: 'Tamaño',
            formatter: tablasFormatter.fileSize,
            align: 'right', headerAlign: 'right',
            hidden: this.state.size < breakpoints.sm
        }];

		return (
			<div>
                <Card>
                    <CardHeader>
                        <i className="fa fa-database fa-lg"></i> Respaldos
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs="12" sm="6">
                                <div className="d-flex flex-row mb-2 mr-auto">										
                                    <Button color="success" size="sm" title="Respaldar datos" onClick={this.respaldar}>
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
                    </CardBody>
                </Card>
			</div>
		);
	}
}

export default Respaldos;
