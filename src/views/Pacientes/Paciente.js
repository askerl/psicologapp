import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import Loader from 'react-loaders';
import { NotificationManager } from 'react-notifications';
import Toggle from 'react-toggle';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { pacientePrepaga, pacientePrivado, prepagas, prepagasById, tipoLoader, tipoPaciente } from '../../config/constants';
import { errores } from '../../config/mensajes';
import db from '../../fire';
import { calcPorcentajesSesiones, pacientesMap } from '../../utils/utils';
import Widget02 from '../Widgets/Widget02';
import { WidgetSesionesRestantes, WidgetSesionesUsadas } from '../Widgets/WidgetsAuxiliares';

class Paciente extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            id: '',
            nuevo: true,
            tipo: '',
            activo: true,
            facturaPrepaga: true,
            pagos: [],
            sesiones: 0,
            sesionesAut: 0,
            porcUsadas: 0,
            porcRestantes: 0,
            errorNombre: false,
            errorApellido: false,
            errorTipo: false,
            errorValorConsulta: false,
            errorPrepaga: false,            
            errorPago: false,
            pacientesMap: {},
            sesionesPaciente: [],
            showDeleteModal: false
        }; // <- set up react state
        this.loadPaciente = this.loadPaciente.bind(this);
        this.savePacient = this.savePacient.bind(this);
        this.deletePacient = this.deletePacient.bind(this);
        this.getPagosPrepaga = this.getPagosPrepaga.bind(this);
        this.goBack = this.goBack.bind(this);
        this.changeNombre = this.changeNombre.bind(this);
        this.changeApellido = this.changeApellido.bind(this);
        this.changePrepaga = this.changePrepaga.bind(this);
        this.changeTipoPaciente = this.changeTipoPaciente.bind(this);
        this.changeValorConsulta = this.changeValorConsulta.bind(this);
        this.changeSesionesAut = this.changeSesionesAut.bind(this);
        this.changePago = this.changePago.bind(this);
        this.validate = this.validate.bind(this);
        this.loading = this.loading.bind(this);
        this.porcentajesSesiones = this.porcentajesSesiones.bind(this);
        this.resetSesiones = this.resetSesiones.bind(this);
        this.checkExistePaciente = this.checkExistePaciente.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
    }

    componentDidMount(){
        // id del paciente
        let id = this.props.match.params.id;
        let nuevo = id === 'new';
        this.setState({id, nuevo});

        this.loading(true);

        pacientesMap().then( () => {
            this.setState({pacientesMap: window.pacientesMap});
        }).then( () => {
            if (!nuevo){
                // cargo paciente y sus sesiones
                db.collection("pacientes").doc(id).get().then( pac => {
                    // console.log(pac.id, pac.data());
                    this.loadPaciente(pac.data());
                }).then( () => {
                    db.collection("sesiones")
		            .where("paciente","==",id)
		            .orderBy("fecha","desc")
		            .get().then( querySnapshot => {
                        let sesionesPaciente = [];
                        querySnapshot.docs.forEach( doc => {
                            sesionesPaciente.push(doc.id);
                        });
                        this.setState({sesionesPaciente});
                        this.loading(false);
                    });
                });
            } else {
                this.loading(false);
            }
        });
        
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
        this.inputEmail.value       = p.email || '';
        this.inputFchNac.value      = moment(p.fchNac, "DD/MM/YYYY").format("YYYY-MM-DD");
        this.inputNotas.value       = p.notas;
        this.inputTipo.value        = p.tipo;
        this.setState({activo: p.activo, tipo: this.inputTipo.value, sesiones: p.sesiones});
        if (p.tipo === pacientePrivado){
            this.inputValorConsulta.value = p.valorConsulta; 
        } else {
            this.inputPrepaga.value     = p.prepaga;
            this.setState({pagos: this.getPagosPrepaga(p.prepaga), facturaPrepaga: p.facturaPrepaga});
            this.inputPago.value        = p.pago;
            this.inputCopago.value      = p.copago;
            this.inputCredencial.value  = p.credencial;
            this.inputSesiones.value    = p.sesionesAut;
            this.setState({sesionesAut: p.sesionesAut});
            this.porcentajesSesiones(p.sesionesAut, p.sesiones);
        }
    }

    porcentajesSesiones(sesionesAut, sesiones){
        let porcs = calcPorcentajesSesiones(sesionesAut, sesiones);
        this.setState({porcUsadas: porcs.porcUsadas, porcRestantes: porcs.porcRestantes});
    }

    resetSesiones(){
        this.setState({sesiones: 0});
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
        return prepagasById[prepaga].pagos;
    }

    changePago(){
        this.setState({errorPago: false});
        this.validate("pago");
    }

    changeSesionesAut(){
        this.setState({sesionesAut: this.inputSesiones.value});
    }

    savePacient(e){
        e.preventDefault(); // <- prevent form submit from reloading the page

        this.loading(true);

        if(this.validate()){

            let paciente = {
                "nombre": this.inputNombre.value || null,
                "apellido": this.inputApellido.value || null,
                "dni": this.inputDNI.value || null,
                "tel": this.inputTel.value || null,
                "fchNac": moment(this.inputFchNac.value).format('DD/MM/YYYY') || null,
                "telFlia": this.inputTelFlia.value || null,
                "dir": this.inputDir.value || null,
                "notas": this.inputNotas.value || null,
                "tipo": this.inputTipo.value || null,
                "email": this.inputEmail.value || null
            };

            if (this.state.tipo === pacientePrivado){
                paciente.valorConsulta = this.inputValorConsulta.value || 0;
            } else {
                paciente.prepaga = this.inputPrepaga.value || null;
                paciente.facturaPrepaga = this.state.facturaPrepaga;
                paciente.pago = parseInt(this.inputPago.value);
                paciente.copago = this.inputCopago.value || 0;
                paciente.sesionesAut = parseInt(this.inputSesiones.value) || 0;
                paciente.credencial = this.inputCredencial.value || null;
            }

            if (this.state.nuevo){
                // console.log('Nuevo paciente', paciente);
                paciente.sesiones = 0;
                paciente.activo = true;
                // db save
                db.collection("pacientes").add(paciente)
                .then(docRef => {
                    this.loading(false);
                    //console.log("Paciente generado con ID: ", docRef.id);
                    NotificationManager.success('Los datos han sido guardados');
                    this.goBack();
                })
                .catch(function(error) {
                    console.error("Error guardando paciente: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                    this.loading(false);
                });
            } else {
                paciente.activo = this.state.activo; 
                paciente.sesiones = this.state.sesiones;               
                // console.log('Editando paciente', paciente);
                db.collection("pacientes").doc(this.state.id).update(paciente)
                .then(() => {
                    this.loading(false);
                    //console.log("Paciente actualizado con ID:", this.state.id);
                    NotificationManager.success('Los datos han sido actualizados');
                    this.goBack();
                })
                .catch(function(error) {
                    console.error("Error guardando paciente: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                    this.loading(false);
                });
            }
        } else {
            this.loading(false);
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
            if ((!field || field === "pago") && (!this.inputPago.value || this.inputPago.value === "-1")) {
                this.setState({errorPago: true});
                isFormValid = false;
            }
        }

        return isFormValid;

    }

    checkExistePaciente() {
        if (this.inputNombre.value && this.inputApellido.value) {
            //console.log('chequeando si existe paciente', this.inputNombre.value, this.inputApellido.value);
            //console.log('pacientes map', this.state.pacientesMap);

            for (const id in this.state.pacientesMap) {
                let obj = this.state.pacientesMap[id];
                if (_.lowerCase(obj.nombre) == _.lowerCase(this.inputNombre.value) && _.lowerCase(obj.apellido) == _.lowerCase(this.inputApellido.value)
                    && id !== this.state.id
                ){
                    NotificationManager.warning(errores.existePacienteNombre);
                    return true;
                }
            }
        }
        return false;
    }

    toggleDelete(){
		this.setState({showDeleteModal: !this.state.showDeleteModal});
    }
    
    deletePacient(){
        // Get a new write batch
		let batch = db.batch();                
        
        let refPaciente = db.collection("pacientes").doc(this.state.id);
        batch.delete(refPaciente);

		this.state.sesionesPaciente.forEach( sesion => {			
			let refSession = db.collection("sesiones").doc(sesion);
			// elimino sesiones del paciente
			batch.delete(refSession);
		});

		//Commit the batch
		batch.commit().then(() => {			
			console.log("Paciente eliminado correctamente");
            NotificationManager.success('El Paciente ha sido eliminado');
            this.goBack();
		})
		.catch((error) => {
			console.error("Error eliminando paciente: ", error);
			NotificationManager.error(errores.errorBorrar, 'Error');
			this.loading(false);
		});

    }

    render() {
        return (
            <div className="animated fadeIn">
                <Loader type={tipoLoader} active={this.state.loading} />
                <div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn paciente"}>                
                    <Row>
                        <Col>
                            <Card className="mainCard">
                                <CardHeader>
                                    <i className="fa fa-user-circle fa-lg"></i>
                                    <strong>Paciente</strong>                                
                                    { this.state.nuevo &&
                                        <a><Badge color="success" className="badge-pill ml-2">Nuevo</Badge></a>
                                    }
                                    { !this.state.nuevo && !this.state.loading &&
                                        <div className="card-actions">
                                        <span id='activo-label'><small>{this.state.activo ? 'Activo' : 'Inactivo'}</small></span>
                                        <Toggle
                                            id='activo'
                                            checked={this.state.activo}                                        
                                            aria-labelledby='activo-label'
                                            onChange={(value)=>{this.setState({activo: !this.state.activo})}} />
                                        </div>
                                    }
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label for="nombre">Nombre(s)</Label>
                                                    <Input type="text" name="nombre" id="nombre" innerRef={ el => this.inputNombre = el } required
                                                        className={this.state.errorNombre ? 'is-invalid' : ''} onChange={this.changeNombre} onBlur={this.checkExistePaciente}/>
                                                    <FormFeedback>{errores.nombreVacio}</FormFeedback>
                                                </FormGroup>    
                                            </Col>
                                            <Col xs="12" sm="6">    
                                                <FormGroup>    
                                                    <Label htmlFor="apellido">Apellido(s)</Label>
                                                    <Input type="text" id="apellido" innerRef={ el => this.inputApellido = el } required 
                                                        className={this.state.errorApellido ? 'is-invalid' : ''} onChange={this.changeApellido} onBlur={this.checkExistePaciente}/>
                                                    <FormFeedback>{errores.apellidoVacio}</FormFeedback>
                                                </FormGroup>
                                            </Col> 
                                        </Row>
                                        <Row>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="dni">DNI</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-id-card-o"></i></InputGroupText>
                                                        </InputGroupAddon>
                                                        <Input type="text" id="dni" innerRef={el => this.inputDNI = el} />
                                                    </InputGroup>
                                                    <FormText>ej: 95001002</FormText>
                                                </FormGroup>
                                            </Col>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="fchNac">Fecha de nacimiento</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-calendar"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="date" id="fchNac" name="Fecha nacimiento" innerRef={el => this.inputFchNac = el} />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="tel">Teléfono</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-phone"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="text" id="tel" innerRef={el => this.inputTel = el} />
                                                    </InputGroup>
                                                    <FormText>ej: 1134567890</FormText>
                                                </FormGroup>
                                            </Col>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="telFlia">Contacto familiar</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-phone-square"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="text" id="telFlia" innerRef={el => this.inputTelFlia = el} />
                                                    </InputGroup>
                                                    <FormText>ej: 11123456780 - padre/madre</FormText>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="dir">Dirección</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-address-book-o"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="text" id="dir" innerRef={el => this.inputDir = el} />
                                                    </InputGroup>
                                                    <FormText>ej: Rivadavia 3456</FormText>
                                                </FormGroup>
                                            </Col>
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label htmlFor="email">Email</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-envelope-o"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="email" id="email" innerRef={el => this.inputEmail = el} />
                                                    </InputGroup>
                                                    <FormText>ej: alguien@example.com</FormText>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <Label htmlFor="tipo">Tipo de Paciente</Label>
                                                    <Input type="select" name="tipoPaciente" id="tipo" innerRef={el => this.inputTipo = el} required onChange={this.changeTipoPaciente}
                                                        className={this.state.errorTipo ? 'is-invalid' : ''}>
                                                        <option value="">Seleccione...</option>
                                                        {tipoPaciente.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}
                                                    </Input>
                                                    <FormFeedback>{errores.tipoPacienteVacio}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        { this.state.tipo === pacientePrivado &&
                                            <Row>
                                                <Col>
                                                    <FormGroup className="errorAddon">
                                                        <Label htmlFor="valorConsulta">Valor de consulta</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-usd"></i></InputGroupText></InputGroupAddon>
                                                            <Input type="number" id="valorConsulta" name="valorConsulta" innerRef={el => this.inputValorConsulta = el} required
                                                                className={this.state.errorValorConsulta ? 'is-invalid' : ''} onChange={this.changeValorConsulta} />
                                                        </InputGroup>
                                                        {this.state.errorValorConsulta &&
                                                            <div className="invalid-feedback">{errores.valorConsultaVacio}</div>
                                                        }
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        }
                                        { this.state.tipo === pacientePrivado && !this.state.nuevo &&
                                            <Row>
                                                <Col>
                                                    <Widget02 color="info" header={`${this.state.sesiones}`} mainText="Sesiones realizadas" icon="fa fa-comments-o"/>                                                
                                                </Col>
                                            </Row>
                                        }
                                        { this.state.tipo === pacientePrepaga &&
                                            <Row>
                                                <Col xs="12" sm="6">
                                                    <FormGroup>
                                                        <Label htmlFor="prepaga">Prepaga</Label>
                                                        <Input type="select" name="prepaga" id="prepaga" innerRef={ el => this.inputPrepaga = el } required 
                                                            onChange={this.changePrepaga} className={this.state.errorPrepaga ? 'is-invalid' : ''}>
                                                            <option value="">Seleccione prepaga...</option>
                                                            {prepagas.map( item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                                                        </Input>
                                                        <FormFeedback>{errores.prepagaVacia}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col xs="12" sm="6">
                                                    <FormGroup>
                                                        <Label htmlFor="facturaPrepaga">Factura para prepaga</Label>
                                                        <div className="input-toggle">
                                                            <Toggle
                                                                id='facturaPrepaga'                                                            
                                                                checked={this.state.facturaPrepaga}                                      
                                                                onChange={(value)=>{this.setState({facturaPrepaga: !this.state.facturaPrepaga})}} />
                                                        </div>
                                                    </FormGroup>    
                                                </Col>
                                            </Row>
                                        }
                                        { this.state.tipo === pacientePrepaga &&
                                            <Row>
                                                <Col xs="12" sm="6">
                                                    <FormGroup>
                                                        <Label htmlFor="pago">Pago por paciente</Label>
                                                        <Input type="select" name="pago" id="pago" innerRef={ el => this.inputPago = el } required 
                                                            onChange={this.changePago} className={this.state.errorPago ? 'is-invalid' : ''}>
                                                            <option value="-1">Seleccione pago...</option>
                                                            {this.state.pagos.map( (value,index) => <option key={index} value={index}>$ {value}</option>)}
                                                        </Input>
                                                        <FormFeedback>{errores.pagoPrepagaVacio}</FormFeedback>
                                                    </FormGroup>    
                                                </Col>
                                                <Col xs="12" sm="6">
                                                    <FormGroup className="errorAddon">
                                                        <Label htmlFor="copago">Copago</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-usd"></i></InputGroupText></InputGroupAddon>
                                                            <Input type="number" id="copago" name="copago" innerRef={el => this.inputCopago = el} onChange={this.changeCopago} />
                                                        </InputGroup>                                                        
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        }
                                        { this.state.tipo === pacientePrepaga &&
                                            <Row>
                                                <Col xs="12" sm="6">
                                                    <FormGroup>
                                                        <Label htmlFor="tipo">Sesiones autorizadas</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-comments-o"></i></InputGroupText></InputGroupAddon>
                                                            <Input type="number" id="sesionesAutorizadas" name="sesionesAutorizadas" innerRef={ el => this.inputSesiones = el } onChange={this.changeSesionesAut}/>
                                                        </InputGroup>
                                                    </FormGroup>    
                                                </Col>
                                                <Col xs="12" sm="6">
                                                    <FormGroup>
                                                        <Label htmlFor="credencial">Credencial</Label>
                                                        <InputGroup>
                                                            <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-vcard"></i></InputGroupText></InputGroupAddon>
                                                            <Input type="text" id="credencial" innerRef={el => this.inputCredencial = el} />
                                                        </InputGroup>
                                                    </FormGroup>
                                                </Col>                                            
                                            </Row>
                                        }
                                        { this.state.tipo === pacientePrepaga && !this.state.nuevo &&
                                            <Row>
                                                <Col xs="12" sm="6">                                                    
                                                    <WidgetSesionesUsadas title="Sesiones usadas" value={`${this.state.sesiones}`} porc={`${this.state.porcUsadas}`} resetAction={this.resetSesiones}/>
                                                </Col>
                                                <Col xs="12" sm="6">
                                                    <WidgetSesionesRestantes title="Sesiones restantes" value={`${this.state.sesionesAut - this.state.sesiones}`} porc={`${this.state.porcRestantes}`}/>
                                                </Col>
                                            </Row>                                    
                                        }
                                        <Row>
                                            <Col xs="12">
                                                <FormGroup>
                                                    <Label htmlFor="notas">Notas</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-book"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="textarea" id="notas" innerRef={el => this.inputNotas = el} rows="2" />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                        </Row>                      
                                    </Form>
                                </CardBody>
                                <CardFooter>
                                    <Button type="submit" color="primary" onClick={ e => this.savePacient(e)}>Guardar</Button>
                                    { !this.state.nuevo &&
                                    <Button color="danger" onClick={this.toggleDelete}>Eliminar</Button>
                                    }
                                    <Button type="reset" color="secondary" onClick={this.goBack}>Cancelar</Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                    <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDelete} className={'modal-md modal-danger'}>
                        <ModalHeader toggle={this.toggleDelete}>Eliminar Paciente</ModalHeader>
                        <ModalBody>
                            Confirme la eliminación del Paciente. Se eliminarán todas sus sesiones ({this.state.sesionesPaciente.length}) e impactará en las facturaciones . Esta acción no podrá deshacerse.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" size="sm" onClick={e => this.deletePacient(e)}>Eliminar</Button>
                            <Button color="secondary" size="sm" onClick={this.toggleDelete}>Cancelar</Button>{' '}
                        </ModalFooter>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Paciente;