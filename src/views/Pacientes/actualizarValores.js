import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, CardFooter, Col, Row, Form, FormGroup, FormFeedback, Label, Input, InputGroup, InputGroupAddon, InputGroupText, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { tipoPaciente, pacientePrepaga, pacientePrivado } from '../../config/constants';
import { errores, mensajes } from '../../config/mensajes';
import { getPrepagas, getPacientes, actualizarValores } from '../../utils/utils';
import Spinner from '../../components/Spinner/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import { NotificationManager } from 'react-notifications';

class ActualizarValores extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tipo: '',
            valoresActuales: [],
            pacientesSel: [],
            errorTipo: false,
            errorPrepaga: false,
            errorValorActual: false,
            errorValorConsulta: false,
            showConfirmModal: false,
            textoResumen: ''
        }; // <- set up react state
        this.guardar = this.guardar.bind(this);
        this.validate = this.validate.bind(this);
        this.changeTipoPaciente = this.changeTipoPaciente.bind(this);
        this.changePrepaga = this.changePrepaga.bind(this);
        this.changeValorActual = this.changeValorActual.bind(this);
        this.changeValorConsulta = this.changeValorConsulta.bind(this);
        this.cargarValoresActuales = this.cargarValoresActuales.bind(this);
        this.goBack = this.goBack.bind(this);
        this.toggleConfirm = this.toggleConfirm.bind(this);
        this.confirmarGuardar = this.confirmarGuardar.bind(this);
        this.cargarDatos = this.cargarDatos.bind(this);
    }

    loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {
        this.loading(true);
        this.cargarDatos();      
    }

    cargarDatos() {
        Promise.all([getPrepagas(), getPacientes()]).then(values => { 
            let prepagas = values[0],
                pacientes = values[1];

            this.prepagas = prepagas;
            this.pacientes = pacientes;

			this.loading(false);
		});
    }

    changeTipoPaciente(){
        let tipo = this.inputTipo.value;
        // reseteo valores seleccionados de prepaga y valor actual
        this.inputValorActual.value = '';
        if (tipo === pacientePrivado) {
            this.cargarValoresActuales(tipo);
        }
        this.setState({tipo, errorTipo: false});
        this.validate("tipo");
    }

    changePrepaga(){
        // reseteo valor actual seleccionado si cambia prepaga
        this.inputValorActual.value = '';
        this.cargarValoresActuales(this.inputTipo.value, this.inputPrepaga.value);
        this.setState({errorPrepaga: false});
        this.validate("prepaga");
    }

    changeValorActual(){
        let pacientesSel = this.state.pacientesSel,
            valorActual = this.inputValorActual.value,
            tipo = this.inputTipo.value;

        if (valorActual) {
            pacientesSel = _.filter(this.pacientes, {'tipo': tipo, 'valorConsulta': parseFloat(valorActual)});
            if (tipo === pacientePrepaga) {
                pacientesSel = _.filter(pacientesSel, {'prepaga': this.inputPrepaga.value});
            }
        } else {
            pacientesSel = [];
        }
        console.log('pacientesSel', pacientesSel);
        this.setState({pacientesSel, errorValorActual: false});
        this.validate("valorActual");
    }

    changeValorConsulta(){
        this.setState({errorValorConsulta: false});
        this.validate("valorConsulta");
    }

    cargarValoresActuales(tipo, prepaga) {
        let valoresActuales = [];
        if (tipo === pacientePrivado) {
            valoresActuales = _.chain(this.pacientes).filter({'tipo': tipo}).sortBy('valorConsulta').map('valorConsulta').sortedUniqBy(parseFloat).value();
        } else {
            valoresActuales = _.chain(this.pacientes).filter({'tipo': tipo, 'prepaga': prepaga}).sortBy('valorConsulta').map('valorConsulta').sortedUniqBy(parseFloat).value();
        }
        this.setState({valoresActuales});
    }

    validate(field){
        
        let isFormValid = true;

        if ((!field || field === "tipo") && !this.inputTipo.value) {
            this.setState({errorTipo: true});
            isFormValid = false;
        }

        if (this.state.tipo === pacientePrepaga){
            if ((!field || field === "prepaga") && !this.inputPrepaga.value) {
                this.setState({errorPrepaga: true});
                isFormValid = false;
            }
        }

        if ((!field || field === "valorActual") && !this.inputValorActual.value) {
            this.setState({errorValorActual: true});
            isFormValid = false;
        }

        if ((!field || field == "valorConsulta") && !this.inputValorConsulta.value) {
            this.setState({errorValorConsulta: true});
            isFormValid = false;
        }

        return isFormValid;

    }

    toggleConfirm(){
		this.setState({showConfirmModal: !this.state.showConfirmModal});
	}

    guardar(e) {
        // valido datos de pantalla
        if(this.validate()){
            // muestro diálogo de confirmación con pacientes a actualizar
            this.setState({textoResumen: `Valor anterior: $${this.inputValorActual.value} - Valor nuevo: $${this.inputValorConsulta.value}`});
            this.toggleConfirm();
        }
    }

    confirmarGuardar() {
        this.loading(true);

        actualizarValores(this.state.pacientesSel, this.inputValorConsulta.value).then( () => {
            NotificationManager.success(mensajes.okUpdate);
            // recargo datos para actualizar valores por si sigue actualizando
            this.cargarDatos();
            // limpio pantalla
            this.inputTipo.value = '';
            if (this.state.tipo === pacientePrepaga) {
                this.inputPrepaga.value = '';
            }
            this.inputValorActual.value = '';
            this.inputValorConsulta.value = '';            
            // cierro diálogo de confirmación
            this.toggleConfirm();
        }).catch( error => {
            NotificationManager.error(errores.errorActualizarValores, 'Error');
			this.toggleConfirm();
			this.loading(false);
        });
    }

    goBack(){
        this.props.history.push('/sesiones');
    }

    render() {
        const prepagas = this.prepagas,
              valoresActuales = this.state.valoresActuales;

        const columns = [{
			dataField: 'id',
            text: 'ID paciente', 
            hidden: true
        }, {
			dataField: 'nombreCompleto',
            text: 'Paciente'
        }];

        return (
            <div className="animated fadeIn">
                <Card className="mainCard">
                    <CardHeader>
                        <i className="fa fa-money fa-lg"></i>Actualizar Valores
                    </CardHeader>
                    <CardBody>
                        <Form>
                            <Row>
                                <Col xs="12" sm="6">
                                    <FormGroup>
                                        <Label htmlFor="tipo" className="required">Tipo de Paciente</Label>
                                        <Input type="select" name="tipoPaciente" id="tipo" innerRef={el => this.inputTipo = el} required onChange={this.changeTipoPaciente}
                                            className={this.state.errorTipo ? 'is-invalid' : ''}>
                                            <option value="">Seleccione...</option>
                                            {tipoPaciente.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}
                                        </Input>
                                        <FormFeedback>{errores.tipoPacienteVacio}</FormFeedback>
                                    </FormGroup>
                                </Col>
                                {this.state.tipo === pacientePrepaga &&
                                <Col xs="12" sm="6">
                                    <FormGroup>
                                        <Label htmlFor="prepaga" className="required">Prepaga</Label>
                                        <Input type="select" name="prepaga" id="prepaga" innerRef={el => this.inputPrepaga = el} required
                                            onChange={this.changePrepaga} className={this.state.errorPrepaga ? 'is-invalid' : ''}>
                                            <option value="">Seleccione prepaga...</option>
                                            {prepagas.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                                        </Input>
                                        <FormFeedback>{errores.prepagaVacia}</FormFeedback>
                                    </FormGroup>
                                </Col>
                                }
                            </Row>
                            <Row>
                                <Col xs="12" sm="6">
                                    <FormGroup>
                                        <Label htmlFor="valoresActuales" className="required">Valor actual</Label>
                                        <Input type="select" name="valorActual" id="valorActual" innerRef={el => this.inputValorActual = el} required
                                            onChange={this.changeValorActual} className={this.state.errorValorActual ? 'is-invalid' : ''}>
                                            <option value="">Seleccione valor actual...</option>
                                            {valoresActuales.map(item => <option key={item} value={item}>${item}</option>)}
                                        </Input>
                                        <FormFeedback>{errores.valorActualVacio}</FormFeedback>
                                    </FormGroup>
                                </Col>
                                <Col xs="12" sm="6">
                                    <FormGroup className="errorAddon">
                                        <Label htmlFor="valorConsulta" className="required">Nuevo Valor</Label>
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
                        </Form>
                    </CardBody>
                    <CardFooter className="botonesFooter">
                        <Button type="submit" color="primary" onClick={ e => this.guardar()}>
                            {this.state.loading && <Spinner/>}Guardar
                        </Button>
                        <Button type="reset" color="secondary" onClick={this.goBack} disabled={this.state.loading}>Cancelar</Button>
                    </CardFooter>
                </Card>
                <Modal isOpen={this.state.showConfirmModal} toggle={this.toggleConfirm} className={'modal-lg modal-info'}>
					<ModalHeader toggle={this.toggleConfirm}>Confirmar actualización</ModalHeader>
					<ModalBody>
						Se actualizarán los valores de las consultas para los siguientes pacientes:
                        <BootstrapTable
                            keyField='id'
                            classes="table-sm mt-2 mb-2"
                            data={this.state.pacientesSel}
                            columns={columns}
                            noDataIndication='No hay pacientes seleccionados'
                            bordered={false}
                            bootstrap4
                            striped
                            hover />
                        <span className="font-weight-bold">{this.state.textoResumen}</span>    
					</ModalBody>
					<ModalFooter>
						<Button color="info" size="sm" onClick={this.confirmarGuardar}>
							{this.state.loading && <Spinner />}Confirmar
						</Button>
						<Button color="secondary" size="sm" onClick={this.toggleConfirm} disabled={this.state.loading}>Cancelar</Button>
					</ModalFooter>
				</Modal>
			</div>
        )
    }

}

export default ActualizarValores;