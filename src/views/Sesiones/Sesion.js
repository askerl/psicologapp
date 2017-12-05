import React, { Component, cloneElement } from 'react';
import {
    Row,
    Col,
    Badge,
    Button,
    Card,
    CardHeader,
    CardFooter,
    CardBody,
    Form,
    FormGroup,
    FormFeedback,
    FormText,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButton
} from 'reactstrap';

import db from '../../fire';

import {NotificationManager} from 'react-notifications';
import { tipoPaciente, pacientePrepaga, pacientePrivado, errores, calcPorcentajesSesiones, cargarPrepagas } from '../../constants';
import Select from 'react-select';
import Loader from 'react-loaders';

import moment from 'moment';
moment.locale("es");

class Sesion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            id: '',
            selectedOption: [],
            nuevo: true,
            prepagas: [],
            pacientes: [],
            errorFecha: false,
            errorPacientes: false
        }; // <- set up react state
        this.handleChange = this.handleChange.bind(this);
        this.loadPacientes = this.loadPacientes.bind(this);
        this.goBack = this.goBack.bind(this);
        this.validate = this.validate.bind(this);
        this.saveSesion = this.saveSesion.bind(this);
        this.loading = this.loading.bind(this);
        this.changeFecha = this.changeFecha.bind(this);
    }

    componentWillMount(){
        // id del paciente
        let id = this.props.match.params.id;
        let nuevo = id === 'new';
        this.setState({id, nuevo});

        this.loading(true);

        cargarPrepagas().then( () => {
            this.setState({prepagas: window.prepagas});            
            db.collection("pacientes").orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
                this.loadPacientes(querySnapshot);
                this.loading(false);
			});
        });
        
    }

    loadPacientes(querySnapshot){
		let pacientes = [];
		querySnapshot.docs.forEach( doc => {            
			let paciente = {};
            paciente.value = doc.id;
            paciente.label = `${doc.data().apellido}, ${doc.data().nombre}`;			
			pacientes.push(paciente);
		});
		this.setState({pacientes});
		console.log('pacientes', this.state.pacientes);		
    }
    
    loading(val){
        this.setState({loading: val});
    }

    loadPaciente(p){
        this.inputNombre.value      = p.nombre;
        this.inputApellido.value    = p.apellido;
        this.inputDNI.value         = p.dni;
        this.inputTel.value         = p.tel;
        this.inputTelFlia.value     = p.telFlia;
        this.inputDir.value         = p.dir;
        this.inputFchNac.value      = p.fchNac;
        this.inputNotas             = p.notas;
        this.inputTipo.value        = p.tipo;
        this.setState({activo: p.activo, tipo: this.inputTipo.value, sesiones: p.sesiones});
        if (p.tipo === pacientePrivado){
            this.inputValorConsulta.value = p.valorConsulta; 
        } else {
            this.inputPrepaga.value     = p.prepaga;
            this.setState({pagos: this.getPagosPrepaga(p.prepaga)});
            this.inputPago.value        = p.pago;
            this.inputCredencial.value  = p.credencial;
            this.inputSesiones.value    = p.sesionesAut;
            this.setState({sesionesAut: p.sesionesAut});
            this.porcentajesSesiones(p.sesionesAut, p.sesiones);
        }
    }

    saveSesion(e){
        e.preventDefault(); // <- prevent form submit from reloading the page

        this.loading(true);

        if(this.validate()){

            let selPacientes = this.state.selectedOption;


            if (this.state.nuevo) {
                // Get a new write batch
                let batch = db.batch();
                
                let warning = false;

                let sesionesFecha = {};

                db.collection("sesiones").where("fecha", "==", this.inputFecha.value)
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
                            batch.set(newSession, {fecha: this.inputFecha.value, paciente: pac.value});
                        }
                    });
    
                    //Commit the batch
                    batch.commit().then(() => {
                        this.loading(false);
                        console.log("Sesiones generadas correctamente");
                        NotificationManager.success('Los datos han sido guardados');
                        NotificationManager.warning('Algunas sesiones ya estaban cargadas');
                        this.goBack();
                    })
                    .catch((error) => {
                        console.error("Error generando sesiones: ", error);
                        NotificationManager.error(errores.errorGuardar, 'Error');
                        this.loading(false);
                    });

                })
                .catch(function(error) {
                    console.log("Error obteniendo sesiones en fecha: ", error);
                });

                

            }
       
        } else {
            this.loading(false);
        }
    
    }

    goBack(){
        this.props.history.push('/sesiones');
    }

    changeFecha(){
        this.setState({errorFecha: false});
        this.validate("fecha");
    }

    handleChange(selectedOption) {
        console.log('You\'ve selected:', selectedOption);
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
            <div className="animated fadeIn">
                <Loader type="ball-scale-ripple-multiple" active={this.state.loading} />
                <div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn sesion"}>                
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader>
                                    <i className="fa fa-comments-o fa-lg"></i>
                                    <strong>Sesion</strong>                                
                                    { this.state.nuevo &&
                                        <a><Badge color="warning" className="float-right mt-1">Nueva</Badge></a>
                                    }                                    
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>                                                                                    
                                            <Col xs="12" sm="6">
                                                <FormGroup className="errorAddon">
                                                    <Label htmlFor="fchNac">Fecha</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon><i className="fa fa-calendar"></i></InputGroupAddon>
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
                                    <Button type="submit" color="primary" onClick={ e => this.saveSesion(e)}>Guardar</Button>
                                    <Button type="reset" color="secondary" onClick={this.goBack}>Cancelar</Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default Sesion;