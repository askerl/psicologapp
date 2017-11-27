import React, { Component, cloneElement } from 'react';
import {
    Row,
    Col,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    CardHeader,
    CardFooter,
    CardBody,
    Form,
    FormGroup,
    FormText,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButton
} from 'reactstrap';

import db from '../../fire';

import {NotificationManager} from 'react-notifications';
import { tipoPaciente, obraSocial } from '../../constants';

class Paciente extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tipo: '',
            prepagas: [],
            pagos: []
        }; // <- set up react state
        this.savePacient = this.savePacient.bind(this);
        this.changePrepaga = this.changePrepaga.bind(this);
        this.changeTipoPaciente = this.changeTipoPaciente.bind(this);
    }

    componentWillMount(){
        db.collection("prepagas").get().then( querySnapshot => {
            let prepagas = [];
            querySnapshot.docs.forEach( doc => {            
                // console.log(doc.id, " => ", doc.data());
                let prepaga = {id: doc.id, data: doc.data()}
                prepagas.push(prepaga);
            });
            // console.log('aux prepagas',prepagas);
            this.setState({prepagas: [...prepagas].concat([])});
            // console.log('prepagaas', this.state.prepagas);
        });
    }

    changeTipoPaciente(){
        this.setState({tipo: this.inputTipo.value});
    }

    changePrepaga() {
        let selPrepaga = this.inputPrepaga.value
        let auxPagos = [];
        this.state.prepagas.forEach( el => {
            if (el.id === selPrepaga) {
                auxPagos = [...el.data.copagos].concat([]);
                return;
            }
        })
        this.setState({pagos: [...auxPagos].concat([])});
    }

    savePacient(e){
        e.preventDefault(); // <- prevent form submit from reloading the page

        let paciente = {
            "nombre": this.inputNombre.value || null,
            "apellido": this.inputApellido.value || null,
            "dni": this.inputDNI.value || null,
            "tel": this.inputTel.value || null,
            "tipo": this.inputTipo.value || null,
            "prepaga": this.inputPrepaga.value || null,
            "pago": this.inputPago.value || null,
            "credencial": this.inputCredencial.value || null
        };
        // clean-up paciente
        if (paciente.tipo !== obraSocial){
            delete paciente.prepaga;
            delete paciente.pago;
            delete paciente.credencial;
        }

        console.log('Grabando Paciente', paciente);

        db.collection("pacientes").add(paciente)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            NotificationManager.success('Los datos han sido guardados');
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="6">
                        <Card>
                            <CardHeader>
                                <i className="fa fa-user-circle"></i>
                                <strong>Paciente</strong>
                            </CardHeader>
                            <CardBody>
                                <Form className="formPaciente">
                                    <FormGroup>
                                        <Label htmlFor="nombre">Nombre(s)</Label>
                                        <Input type="text" id="nombre" innerRef={ el => this.inputNombre = el } required/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="apellido">Apellido(s)</Label>
                                        <Input type="text" id="apellido" innerRef={ el => this.inputApellido = el } required/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="dni">DNI</Label>
                                        <InputGroup>
                                            <InputGroupAddon><i className="fa fa-id-card-o"></i></InputGroupAddon>
                                            <Input type="text" id="dni" placeholder="ej: 95001002" innerRef={ el => this.inputDNI = el }/>
                                        </InputGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="tel">Teléfono</Label>
                                        <InputGroup>
                                            <InputGroupAddon><i className="fa fa-phone"></i></InputGroupAddon>
                                            <Input type="text" id="tel" placeholder="ej: 1134567890" innerRef={ el => this.inputTel = el }/>
                                        </InputGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="tipo">Tipo de Paciente</Label>
                                        <Input type="select" name="tipoPaciente" id="tipo" innerRef={ el => this.inputTipo = el } required onChange={this.changeTipoPaciente}>
                                            <option value="">Seleccione...</option>
                                            {tipoPaciente.map( item => <option key={item.key} value={item.key}>{item.name}</option>)}
                                        </Input>
                                    </FormGroup>
                                    <FormGroup row className={this.state.tipo !== "O" ? "invisible" : "visible"}>
                                        <Col xs="12" sm="6">
                                            <Label htmlFor="prepaga">Prepaga</Label>
                                            <Input type="select" name="prepaga" id="prepaga" innerRef={ el => this.inputPrepaga = el } required onChange={this.changePrepaga}>
                                                <option value="">Seleccione prepaga...</option>
                                                {this.state.prepagas.map( item => <option key={item.id} value={item.id}>{item.data.nombre}</option>)}
                                            </Input> 
                                        </Col>
                                        <Col xs="12" sm="6">
                                            <Label htmlFor="pago">Pago por paciente</Label>
                                            <InputGroup>
                                                <Input type="select" name="pago" id="pago" innerRef={ el => this.inputPago = el } required>
                                                    <option value="">Seleccione pago...</option>
                                                    {this.state.pagos.map( item => <option key={item} value={item}>$ {item}</option>)}
                                                </Input>
                                            </InputGroup>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row className={this.state.tipo !== "O" ? "invisible" : "visible"}>
                                        <Col xs="12">
                                            <Label htmlFor="credencial">Credencial</Label>
                                            <InputGroup>
                                                <InputGroupAddon><i className="fa fa-vcard"></i></InputGroupAddon>
                                                <Input type="text" id="credencial" placeholder="Credencial del Paciente" innerRef={ el => this.inputCredencial = el }/> 
                                            </InputGroup>
                                        </Col>
                                    </FormGroup>
                                    </Form>
                            </CardBody>
                            <CardFooter>
                                <Button type="submit" size="sm" color="primary" onClick={(e) => this.savePacient(e)}><i className="fa fa-dot-circle-o"></i> Guardar</Button>
                                <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Cancelar</Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Paciente;