import moment from 'moment';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import Select from 'react-select';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Row } from 'reactstrap';
import Spinner from '../../components/Spinner/Spinner';
import { overlay, pacientePrepaga } from '../../config/constants';
import { errores } from '../../config/mensajes';
import db from '../../fire';
import { createFechaSesion, getPacientes, getPrepagas, removeSession, removeSessionSesionesMes } from '../../utils/utils';
import { tablasFormatter } from '../../utils/formatters';

class Sesion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            id: props.match.params.id,
            nuevo: props.match.params.id === 'new',
            isAusencia: props.match.params.type === 'ausencia',
            selectedOption: [],
            nuevo: true,
            pacientes: [],
            prepagas: [],
            errorFecha: false,
            errorPacientes: false
        }; // <- set up react state
        this.handleChange = this.handleChange.bind(this);
        this.goBack = this.goBack.bind(this);
        this.validate = this.validate.bind(this);
        this.saveSesion = this.saveSesion.bind(this);
        this.loading = this.loading.bind(this);
        this.changeFecha = this.changeFecha.bind(this);
        this.facturarAusencia = this.facturarAusencia.bind(this);
    }

    componentDidMount(){
        this.inputFecha.value = moment().format('YYYY-MM-DD');

        this.loading(true);
        
        Promise.all([getPrepagas(), getPacientes()]).then(values => { 
            let prepagas = values[0],
                pacientes = values[1];

            pacientes.forEach(p =>{
                p.facturaAusencia = true; // por defecto se facturan las ausencias
            });

            this.setState({pacientes, prepagas});
			this.loading(false);
		});

    }

    loading(val){
        this.setState({loading: val});
    }

    saveSesion(e){
        e.preventDefault(); // <- prevent form submit from reloading the page

        this.loading(true);

        if(this.validate()){

            let selPacientes = this.state.selectedOption;

            let fecha = createFechaSesion(this.inputFecha.value);

            if (this.state.nuevo) {
                // Get a new write batch
                let batch = db.batch();                
                let warning = false;
                let sesionesFecha = {};

                db.collection("sesiones").where("fecha", "==", fecha.fechaTS)
                .get()
                .then((result) => {
                    result.forEach((doc) =>{
                        sesionesFecha[doc.data().paciente] = true;
                    });

                    selPacientes.forEach( pac => {
                        let newSession = db.collection("sesiones").doc();
                        if (sesionesFecha[pac.value]){
                            warning = true;
                        } else {
                            // creo sesion
                            batch.set(newSession, this.createSesion(pac, fecha));
                            // actualizo sesiones del paciente
                            let pacRef = db.collection("pacientes").doc(pac.value);
                            batch.update(pacRef, {sesiones: pac.sesiones+1 });
                        }
                    });

                    //Commit the batch
                    batch.commit().then(() => {
                        this.loading(false);
                        console.log("Sesiones generadas correctamente");
                        NotificationManager.success('Los datos han sido guardados');
                        if (warning) {
                            NotificationManager.warning('Algunas sesiones ya estaban cargadas');
                        }
                        removeSession('pacientes');
                        removeSessionSesionesMes(fecha.mes, fecha.anio);
                        this.goBack();
                    })
                    .catch((error) => {
                        console.error("Error generando sesiones: ", error);
                        NotificationManager.error(errores.errorGuardar, 'Error');
                        this.loading(false);
                    });

                })
                .catch((error) => {
                    console.log("Error obteniendo sesiones en fecha: ", error);
                    NotificationManager.error("Error al obtener las sesiones de la fecha", 'Error');
                    this.loading(false);
                });

            }
       
        } else {
            this.loading(false);
        }
    
    }

    createSesion(p,fecha){
       
        let sesion = {
            dia: fecha.dia,
            mes: fecha.mes,
            anio: fecha.anio,
            fecha: fecha.fechaTS,
            paciente: p.value,
            tipo: p.tipo,
            evolucion: '',
            valor: p.valorConsulta,
            ausencia: this.state.isAusencia,
            facturaAusencia: p.facturaAusencia
        }

        if (p.tipo == pacientePrepaga){
            sesion.prepaga = p.prepaga;
            sesion.facturaPrepaga = p.facturaPrepaga;
            sesion.copago = p.copago;

            if (sesion.ausencia) {
                let prepaga = _.find(this.state.prepagas, {'id': p.prepaga});
                sesion.valor = sesion.facturaAusencia ? prepaga.pagoAusencia : sesion.valor;
            }
            
            if (!sesion.facturaPrepaga) {
                sesion.valor = 0;
            }

        }

        return sesion;

    }

    goBack(){
        this.props.history.push('/sesiones');
    }

    changeFecha(){
        this.setState({errorFecha: false });
        this.validate("fecha");
    }

    handleChange(selectedOption) {
        console.log('Pacientes seleccionados:', selectedOption);
        this.setState({ selectedOption, errorPacientes: false } );
    }

    validate(field){
        
        let isFormValid = true;

        if ((!field || field === "fecha") && !this.inputFecha.value){
            this.setState({errorFecha: true});
            isFormValid = false;
        }

        if ((!field || field === "pacientes") && this.state.selectedOption.length == 0){
            this.setState({errorPacientes: true});
            isFormValid = false;
        }

        return isFormValid;

    }

    facturarAusencia(id) {
        console.log('facturar ausencia', id);
        let paciente = _.find(this.state.selectedOption, {'id': id});
        console.log('paciente', paciente);
        paciente.facturaAusencia = !paciente.facturaAusencia;
        this.setState({selectedOption: this.state.selectedOption});
    }

    render() {

        const titleIcon = this.state.isAusencia ? 'fa-calendar-times-o' : 'fa-comments-o';
        const titleText = this.state.isAusencia ? 'Ausencias' : 'Sesiones';
        const showResumen = this.state.isAusencia && this.state.selectedOption.length > 0;

        const columns = [{
			dataField: 'facturaAusencia',
            text: 'Paciente', 
            formatter: tablasFormatter.nombrePacienteFacturaAusencia
        }, {
			dataField: 'tipo',
            text: 'Tipo',
            formatter: tablasFormatter.tipoPaciente
        }, {
			dataField: 'id',
            text: 'Facturar ausencia',
            align: 'center', headerAlign: 'center',
            formatter: tablasFormatter.facturarAusencia,
            formatExtraData: this.facturarAusencia
        }];

        return (
            <div className="animated fadeIn sesion"> 
                <LoadingOverlay
                    active={this.state.loading}
                    animate
                    spinner
                    color={overlay.color}
                    background={overlay.background}>      
                    <Row>
                        <Col>
                            <Card className="mainCard">
                                <CardHeader>                                   
                                    <i className={`fa ${titleIcon} fa-lg mr-2`}></i><strong>{titleText}</strong>
                                    {/* { this.state.nuevo &&
                                        <a><Badge color="success" className="badge-pill ml-2">Nuevas</Badge></a>
                                    } */}
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>                                                                                    
                                            <Col xs="12" sm="6">
                                                <FormGroup className="errorAddon">
                                                    <Label htmlFor="fchNac" className="required">Fecha</Label>
                                                    <InputGroup className="input-group-fecha">
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-calendar"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="date" id="fecha" name="Fecha" innerRef={el => this.inputFecha = el} onChange={this.changeFecha} />                                                        
                                                    </InputGroup>                                                    
                                                    {this.state.errorFecha &&
                                                        <div className="invalid-feedback">{errores.fechaVacia}</div>
                                                    }
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <FormGroup className="errorAddon">
                                                    <Label htmlFor="pacientes" className="required">Pacientes</Label>
                                                    <Select
                                                        multi={true}
                                                        placeholder="Seleccione pacientes..."
                                                        name="pacientes"
                                                        value={this.state.selectedOption}
                                                        onChange={this.handleChange}
                                                        options={this.state.pacientes}                                                    
                                                    />
                                                    <FormText>{`Seleccionados: ${this.state.selectedOption.length}`}</FormText> 
                                                    {this.state.errorPacientes &&
                                                        <div className="invalid-feedback">{errores.pacientesVacios}</div>
                                                    }
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        {showResumen &&
                                        <Row>
                                            <Col>
                                                <BootstrapTable
                                                    keyField='id'
                                                    data={this.state.selectedOption}
                                                    columns={columns} 
                                                    classes="tablaAusencias"
                                                    noDataIndication='No hay pacientes seleccionados'
                                                    bordered={false}
                                                    bootstrap4
                                                    striped
                                                    hover />
                                            </Col>
                                        </Row>
                                        }
                                    </Form>
                                </CardBody>
                                <CardFooter className="botonesFooter">
                                    <Button type="submit" color="primary" onClick={ e => this.saveSesion(e)}>
                                        {this.state.loading && <Spinner/>}Guardar
                                    </Button>
                                    <Button type="reset" color="secondary" onClick={this.goBack} disabled={this.state.loading}>Cancelar</Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </LoadingOverlay>
            </div>
        );
    }
}

export default Sesion;