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
import { tipoPaciente, pacientePrepaga, pacientePrivado, errores } from '../../constants';

class Paciente extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: '',
            nuevo: true,
            tipo: '',
            prepagas: [],
            pagos: [],
            errorNombre: false,
            errorApellido: false,
            errorTipo: false,
            errorValorConsulta: false,
            errorPrepaga: false,            
            errorPago: false
        }; // <- set up react state
        this.loadPaciente = this.loadPaciente.bind(this);
        this.savePacient = this.savePacient.bind(this);
        this.getPagosPrepaga = this.getPagosPrepaga.bind(this);
        this.goBack = this.goBack.bind(this);
        this.changeNombre = this.changeNombre.bind(this);
        this.changeApellido = this.changeApellido.bind(this);
        this.changePrepaga = this.changePrepaga.bind(this);
        this.changeTipoPaciente = this.changeTipoPaciente.bind(this);
        this.changeValorConsulta = this.changeValorConsulta.bind(this);
        this.changePago = this.changePago.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentWillMount(){
        db.collection("prepagas").get().then( querySnapshot => {
            let prepagas = [];
            querySnapshot.docs.forEach( doc => {            
                let prepaga = {id: doc.id, data: doc.data()}
                prepagas.push(prepaga);
            });
            this.setState({prepagas: [...prepagas].concat([])});
        });

        let id = this.props.match.params.id;
        let nuevo = id === 'new';

        this.setState({id, nuevo});
        if (!nuevo){
            db.collection("pacientes").doc(id).get().then( pac => {
                console.log(pac.id, pac.data());
                this.loadPaciente(pac.data());
            });
        }
    }

    loadPaciente(p){
        this.inputNombre.value      = p.nombre;
        this.inputApellido.value    = p.apellido;
        this.inputDNI.value         = p.dni;
        this.inputTel.value         = p.tel;
        this.inputTipo.value        = p.tipo;
        this.setState({tipo: this.inputTipo.value});
        if (p.tipo === pacientePrivado){
            this.inputValorConsulta.value = p.valorConsulta; 
        } else {
            this.inputPrepaga.value     = p.prepaga;
            this.setState({pagos: this.getPagosPrepaga(p.prepaga)});
            this.inputPago.value        = p.pago;
            this.inputCredencial.value  = p.credencial;
        }
    }

    changeNombre(){
        this.setState({errorNombre: false});
        this.validate("nombre");
    }

    changeApellido(){
        this.setState({errorApellido: false});
        this.validate("apellido");
    }

    changeTipoPaciente(){        
        this.setState({tipo: this.inputTipo.value, errorTipo: false});
        this.validate("tipo");
    }

    changeValorConsulta(){
        this.setState({errorValorConsulta: false});
        this.validate("valorConsulta");
    }

    changePrepaga() {
        let selPrepaga = this.inputPrepaga.value;
        let pagosPrepaga = this.getPagosPrepaga(selPrepaga);
        this.setState({pagos: [...pagosPrepaga].concat([]), errorPrepaga: false});
        this.validate("prepaga");
    }

    getPagosPrepaga(prepaga){
        let pagos = [];
        this.state.prepagas.forEach( el => {
            if (el.id === prepaga) {
                pagos = [...el.data.pagos].concat([]);
                return;
            }
        })
        return pagos;
    }

    changePago(){
        this.setState({errorPago: false});
        this.validate("pago");
    }

    savePacient(e){
        e.preventDefault(); // <- prevent form submit from reloading the page

        if(this.validate()){

            let paciente = {
                "nombre": this.inputNombre.value || null,
                "apellido": this.inputApellido.value || null,
                "dni": this.inputDNI.value || null,
                "tel": this.inputTel.value || null,
                "tipo": this.inputTipo.value || null
            };

            if (this.state.tipo === pacientePrivado){
                paciente.valorConsulta = this.inputValorConsulta.value || null;
            } else {
                paciente.prepaga = this.inputPrepaga.value || null;
                paciente.pago = this.inputPago.value || null;
                paciente.credencial = this.inputCredencial.value || null;
            }

            if (this.state.nuevo){
                // console.log('Nuevo paciente', paciente);
                db.collection("pacientes").add(paciente)
                .then(docRef => {
                    console.log("Paciente generado con ID: ", docRef.id);
                    NotificationManager.success('Los datos han sido guardados');
                    this.goBack();
                })
                .catch(function(error) {
                    console.error("Error guardando paciente: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                });
            } else {
                // console.log('Editando paciente', paciente);
                db.collection("pacientes").doc(this.state.id).set(paciente)
                .then(() => {
                    console.log("Paciente actualizado con ID:", this.state.id);
                    NotificationManager.success('Los datos han sido actualizados');
                    this.goBack();
                })
                .catch(function(error) {
                    console.error("Error guardando paciente: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                });
            }
        }
    }

    goBack(){
        this.props.history.push('/pacientes');
    }

    validate(field){
        
        let isFormValid = true;

        if ((!field || field === "nombre") && !this.inputNombre.value) {
            this.setState({errorNombre: true});
            isFormValid = false;
        }

        if ((!field || field === "apellido") && !this.inputApellido.value) {
            this.setState({errorApellido: true});
            isFormValid = false;
        }

        if ((!field || field === "tipo") && !this.inputTipo.value) {
            this.setState({errorTipo: true});
            isFormValid = false;
        }

        if (this.state.tipo === pacientePrivado){
            console.log(this.inputValorConsulta.value);
            if ((!field || field == "valorConsulta") && !this.inputValorConsulta.value) {
                this.setState({errorValorConsulta: true});
                isFormValid = false;
            }
        }

        if (this.state.tipo === pacientePrepaga){
            if ((!field || field === "prepaga") && !this.inputPrepaga.value) {
                this.setState({errorPrepaga: true});
                isFormValid = false;
            }
            if ((!field || field === "pago") && !this.inputPago.value) {
                this.setState({errorPago: true});
                isFormValid = false;
            }
        }

        return isFormValid;

    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm="12" md="8">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-user-circle"></i>
                                <strong>Paciente</strong>
                                { this.state.nuevo &&
                                    <Badge color="primary" className="float-right mt-1">Nuevo</Badge>
                                }
                            </CardHeader>
                            <CardBody>
                                <Form>                                    
                                    <FormGroup>
                                        <Label for="nombre">Nombre(s)</Label>
                                        <Input type="text" name="nombre" id="nombre" innerRef={ el => this.inputNombre = el } required
                                            className={this.state.errorNombre ? 'is-invalid' : ''} onChange={this.changeNombre}/>
                                        <FormFeedback>{errores.nombreVacio}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="apellido">Apellido(s)</Label>
                                        <Input type="text" id="apellido" innerRef={ el => this.inputApellido = el } required 
                                            className={this.state.errorApellido ? 'is-invalid' : ''} onChange={this.changeApellido}/>
                                        <FormFeedback>{errores.apellidoVacio}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="tipo">Tipo de Paciente</Label>
                                        <Input type="select" name="tipoPaciente" id="tipo" innerRef={ el => this.inputTipo = el } required onChange={this.changeTipoPaciente}
                                            className={this.state.errorTipo ? 'is-invalid' : ''}>
                                            <option value="">Seleccione...</option>
                                            {tipoPaciente.map( item => <option key={item.key} value={item.key}>{item.name}</option>)}
                                        </Input>
                                        <FormFeedback>{errores.tipoPacienteVacio}</FormFeedback>
                                    </FormGroup>
                                    { this.state.tipo === pacientePrivado &&
                                        <FormGroup className="errorAddon">
                                            <Label htmlFor="valorConsulta">Valor de consulta</Label>
                                            <InputGroup>
                                                <InputGroupAddon><i className="fa fa-usd"></i></InputGroupAddon>
                                                <Input type="number" id="valorConsulta" name="valorConsulta" innerRef={ el => this.inputValorConsulta = el } required
                                                    className={this.state.errorValorConsulta ? 'is-invalid' : ''} onChange={this.changeValorConsulta}/>                                                
                                            </InputGroup>                                            
                                            { this.state.errorValorConsulta &&
                                                <div className="invalid-feedback">{errores.valorConsultaVacio}</div>
                                            }
                                        </FormGroup>
                                    }
                                    { this.state.tipo === pacientePrepaga &&
                                        <FormGroup row>
                                            <Col xs="12" sm="6">
                                                <Label htmlFor="prepaga">Prepaga</Label>
                                                <Input type="select" name="prepaga" id="prepaga" innerRef={ el => this.inputPrepaga = el } required 
                                                    onChange={this.changePrepaga} className={this.state.errorPrepaga ? 'is-invalid' : ''}>
                                                    <option value="">Seleccione prepaga...</option>
                                                    {this.state.prepagas.map( item => <option key={item.id} value={item.id}>{item.data.nombre}</option>)}
                                                </Input>
                                                <FormFeedback>{errores.prepagaVacia}</FormFeedback>
                                            </Col>
                                            <Col xs="12" sm="6">
                                                <Label htmlFor="pago">Pago por paciente</Label>
                                                <Input type="select" name="pago" id="pago" innerRef={ el => this.inputPago = el } required 
                                                    onChange={this.changePago} className={this.state.errorPago ? 'is-invalid' : ''}>
                                                    <option value="">Seleccione pago...</option>
                                                    {this.state.pagos.map( (value,index) => <option key={index} value={index}>$ {value}</option>)}
                                                </Input>
                                                <FormFeedback>{errores.pagoPrepagaVacio}</FormFeedback>
                                            </Col>
                                        </FormGroup>
                                    }
                                    { this.state.tipo === pacientePrepaga &&
                                        <FormGroup>
                                            <Label htmlFor="credencial">Credencial</Label>
                                            <InputGroup>
                                                <InputGroupAddon><i className="fa fa-vcard"></i></InputGroupAddon>
                                                <Input type="text" id="credencial" innerRef={ el => this.inputCredencial = el }/> 
                                            </InputGroup>
                                        </FormGroup>
                                    }
                                    <FormGroup>
                                        <Label htmlFor="dni">DNI</Label>
                                        <InputGroup>
                                            <InputGroupAddon><i className="fa fa-id-card-o"></i></InputGroupAddon>
                                            <Input type="text" id="dni" innerRef={ el => this.inputDNI = el }/>
                                        </InputGroup>
                                        <FormText>ej: 95001002</FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="tel">Teléfono</Label>
                                        <InputGroup>
                                            <InputGroupAddon><i className="fa fa-phone"></i></InputGroupAddon>
                                            <Input type="text" id="tel" innerRef={ el => this.inputTel = el }/>
                                        </InputGroup>
                                        <FormText>ej: 1134567890</FormText>
                                    </FormGroup>
                                </Form>
                            </CardBody>
                            <CardFooter>
                                <Button type="submit" size="sm" color="primary" onClick={ e => this.savePacient(e)}><i className="fa fa-dot-circle-o"></i> Guardar</Button>
                                <Button type="reset" size="sm" color="danger" onClick={this.goBack}><i className="fa fa-ban"></i> Cancelar</Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Paciente;