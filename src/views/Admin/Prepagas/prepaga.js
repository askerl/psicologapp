import React, { Component } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { NotificationManager } from 'react-notifications';
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import Spinner from '../../../components/Spinner/Spinner';
import { overlay } from '../../../config/constants';
import { errores, mensajes } from '../../../config/mensajes';
import db from '../../../fire';
import { generateIdPrepaga, getPrepaga, getPrepagas, getSession, removeSession, borrarPrepaga } from '../../../utils/utils';

class Prepaga extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            id: '',
            nuevo: true,
            prepagas: [],
            errorNombre: false,
            errorPagoAusencia: false
        }; // <- set up react state
        this.goBack = this.goBack.bind(this);
        this.validate = this.validate.bind(this);
        this.savePrepaga = this.savePrepaga.bind(this);
        this.changeNombre = this.changeNombre.bind(this);
        this.checkExistePrepaga = this.checkExistePrepaga.bind(this);
        this.loading = this.loading.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
        this.deletePrepaga = this.deletePrepaga.bind(this);
    }

    componentDidMount(){
        // id de la prepaga 
        let id = this.props.match.params.id;
        let nuevo = id === 'new';
        this.setState({id, nuevo});

        this.loading(true);

        getPrepagas().then( prepagas => {            
            this.setState({prepagas});

            if (!nuevo) {
                let prepaga = _.find(prepagas, {'id': id});
                if (prepaga) {
                    // cargo datos de la prepaga
                    this.inputNombre.value  = prepaga.nombre;
                    this.inputPagoAusencia.value = prepaga.pagoAusencia;
                } else {
                    console.log('Error al cargar los datos de la prepaga', error);
                    NotificationManager.error(errores.errorCargarDatosPrepaga, 'Error');
                    this.goBack();
                }
            }

			this.loading(false);
		});
    }

    loading(val){
        this.setState({loading: val});
    }

    goBack(){
        this.props.history.push('/admin/prepagas');
    }

    validate(field){
        
        let isFormValid = true;

        if (!field || field === "nombre") { 
            if (!this.inputNombre.value) {
                this.setState({errorNombre: true});
                isFormValid = false;
            } else {
                if (this.checkExistePrepaga()) {
                    isFormValid = false;
                }
            }
        }

        return isFormValid;

    }

    changeNombre() {
        this.setState({errorNombre: false});
        this.validate("nombre");
    }

    checkExistePrepaga() {
        if (this.inputNombre.value) {
            let existe = _.find(this.state.prepagas, prepaga => {
                if (generateIdPrepaga(this.inputNombre.value) == prepaga.id
                    && prepaga.id !== this.state.id
                ){
                    return true;
                }
            });
            if (existe){
                NotificationManager.error(errores.existePrepagaNombre);
                return true;
            }
        }
        return false;
    }

    savePrepaga() {
        this.loading(true);

        if(this.validate()){

            let prepaga = {
                nombre: _.trim(this.inputNombre.value) || '',
                pagoAusencia: parseFloat(this.inputPagoAusencia.value) || 0
            };

            if (this.state.nuevo){
                // db save
                // quito espacios y caracteres especiales del nombre (.,-,etc)
                let newId = generateIdPrepaga(prepaga.nombre);
                db.collection("prepagas").doc(newId).set(prepaga)
                .then(() => {
                        this.loading(false);
                        removeSession('prepagas');
                        NotificationManager.success(mensajes.okSave);
                        this.goBack();
                })
                .catch( error => {
                    console.error("Error guardando prepaga: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                    this.loading(false);
                });
            } else {
                db.collection("prepagas").doc(this.state.id).update(prepaga)
                .then(() => {
                    this.loading(false);
                    removeSession('prepagas');
                    //console.log("Paciente actualizado con ID:", this.state.id);
                    NotificationManager.success(mensajes.okUpdate);
                    this.goBack();
                })
                .catch(error => {
                    console.error("Error guardando prepaga: ", error);
                    NotificationManager.error(errores.errorGuardar, 'Error');
                    this.loading(false);
                });
            }

            this.loading(false);
        } else {
            this.loading(false);
        }

    }

    toggleDelete(){
		this.setState({showDeleteModal: !this.state.showDeleteModal});
    }
    
    deletePrepaga(){
        this.loading(true);
        borrarPrepaga(this.state.id).then(() => {			
            console.log("Prepaga eliminada correctamente");
            removeSession('prepagas');
            NotificationManager.success(mensajes.okDeletePrepaga);
            this.goBack();
		})
		.catch((error) => {
			console.error("Error eliminando prepaga: ", error);
            NotificationManager.error(error, 'Error');
            this.toggleDelete();
			this.loading(false);
		});
    }

    render() {
        return (
            <div className="animated fadeIn prepaga"> 
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
                                    <i className="fa fa-hospital-o fa-lg"></i>
                                    <strong>Prepaga</strong>                                
                                    { this.state.nuevo &&
                                        <a><Badge color="success" className="badge-pill ml-2">Nueva</Badge></a>
                                    }                                    
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>                                                                                    
                                            <Col xs="12" sm="6">
                                                <FormGroup>
                                                    <Label for="nombre">Nombre</Label>
                                                    <Input type="text" name="nombre" id="nombre" innerRef={el => this.inputNombre = el} required
                                                        className={this.state.errorNombre ? 'is-invalid' : ''} onChange={this.changeNombre}/>
                                                    <FormFeedback>{errores.nombreVacio}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs="12" sm="6">
                                                <FormGroup className="errorAddon">
                                                    <Label htmlFor="pagoAusencia">Pago por ausencia</Label>
                                                    <InputGroup>
                                                        <InputGroupAddon addonType="prepend"><InputGroupText><i className="fa fa-usd"></i></InputGroupText></InputGroupAddon>
                                                        <Input type="number" id="pagoAusencia" name="pagoAusencia" innerRef={el => this.inputPagoAusencia = el} />
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Form>
                                </CardBody>
                                <CardFooter className="botonesCard">
                                    <Button type="submit" color="primary" onClick={ e => this.savePrepaga(e)}>
                                        {this.state.loading && <Spinner/>}Guardar
                                    </Button>
                                    {!this.state.nuevo &&
                                    <Button color="danger" onClick={this.toggleDelete}>Eliminar</Button>
                                    }
                                    <Button type="reset" color="secondary" onClick={this.goBack} disabled={this.state.loading}>Cancelar</Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                    <Modal isOpen={this.state.showDeleteModal} toggle={this.toggleDelete} className={'modal-md modal-danger'}>
                        <ModalHeader toggle={this.toggleDelete}>Eliminar Prepaga</ModalHeader>
                        <ModalBody>
                            Confirme la eliminación de la Prepaga. Esta acción no podrá deshacerse.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" size="sm" onClick={this.deletePrepaga}>
                                {this.state.loading && <Spinner />}Eliminar
                            </Button>
                            <Button color="secondary" size="sm" onClick={this.toggleDelete} disabled={this.state.loading}>Cancelar</Button>
                        </ModalFooter>
                    </Modal>
                </LoadingOverlay>
            </div>
        );
    }
}

export default Prepaga;