import moment from 'moment';
import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import Select from 'react-select';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Row } from 'reactstrap';
import { overlay, pacientePrivado, prepagasById, pacientePrepaga } from '../../config/constants';
import { errores } from '../../config/mensajes';
import db from '../../fire';
import { createFechaSesion, getPacientes, removeSession, removeSessionSesionesMes } from '../../utils/utils';
import Spinner from '../../components/Spinner/Spinner';

class Sesion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            id: '',
            selectedOption: [],
            nuevo: true,
            pacientes: [],
            errorFecha: false,
            errorPacientes: false
        }; // <- set up react state
        this.handleChange = this.handleChange.bind(this);
        this.goBack = this.goBack.bind(this);
        this.validate = this.validate.bind(this);
        this.saveSesion = this.saveSesion.bind(this);
        this.loading = this.loading.bind(this);
        this.changeFecha = this.changeFecha.bind(this);
    }

    componentDidMount(){
        // id del paciente
        let id = this.props.match.params.id;
        let nuevo = id === 'new';
        this.setState({id, nuevo});
        this.inputFecha.value = moment().format('YYYY-MM-DD');

        this.loading(true);
        getPacientes().then( pacientes => {
            this.setState({pacientes});
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
            valor: p.valorConsulta
        }

        if (p.tipo == pacientePrepaga){
            sesion.prepaga = p.prepaga;
            sesion.facturaPrepaga = p.facturaPrepaga;
            sesion.copago = p.copago;
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
        //console.log('Pacientes seleccionados:', selectedOption);
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

    render() {
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
                                    <i className="fa fa-comments-o fa-lg"></i>
                                    <strong>Sesión</strong>                                
                                    { this.state.nuevo &&
                                        <a><Badge color="success" className="badge-pill ml-2">Nueva</Badge></a>
                                    }                                    
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>                                                                                    
                                            <Col xs="12" sm="6">
                                                <FormGroup className="errorAddon">
                                                    <Label htmlFor="fchNac">Fecha</Label>
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
                                                <Label htmlFor="pacientes">Pacientes</Label>
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
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button type="submit" color="primary" onClick={ e => this.saveSesion(e)}>
                                        {this.state.loading && <Spinner/>}Guardar
                                    </Button>
                                    <Button type="reset" color="secondary" onClick={this.goBack}>Cancelar</Button>
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