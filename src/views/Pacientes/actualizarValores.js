import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, CardFooter, Col, Row, Form, FormGroup, FormFeedback, Label, Input, InputGroup, InputGroupAddon, InputGroupText, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { tipoPaciente, pacientePrepaga, pacientePrivado } from '../../config/constants';
import { errores } from '../../config/mensajes';
import { getPrepagas, getPacientes } from '../../utils/utils';
import Spinner from '../../components/Spinner/Spinner';

class ActualizarValores extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tipo: '',
            valoresActuales: [],
            errorTipo: false,
            errorPrepaga: false,
            errorValorActual: false,
            errorValorConsulta: false,
            showConfirmModal: false
        }; // <- set up react state
        this.guardar = this.guardar.bind(this);
        this.validate = this.validate.bind(this);
        this.changeTipoPaciente = this.changeTipoPaciente.bind(this);
        this.changePrepaga = this.changePrepaga.bind(this);
        this.changeValorActual = this.changeValorActual.bind(this);
        this.changeValorConsulta = this.changeValorConsulta.bind(this);
        this.cargarValoresActuales = this.cargarValoresActuales.bind(this);
    }

    loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {
        this.loading(true);

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
        if (tipo === pacientePrivado) {
            this.cargarValoresActuales(tipo);
        }
        this.setState({tipo, errorTipo: false});
        this.validate("tipo");
    }

    changePrepaga(){
        this.cargarValoresActuales(this.inputTipo.value, this.inputPrepaga.value);
        this.setState({errorPrepaga: false});
        this.validate("prepaga");
    }

    changeValorActual(){
        this.setState({errorValorActual: false});
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

    guardar() {

    }

    goBack(){
        this.props.history.push('/sesiones');
    }

    render() {
        let prepagas = this.prepagas,
            valoresActuales = this.state.valoresActuales;
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
                            {/* {showResumen &&
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
                            } */}
                        </Form>
                    </CardBody>
                    <CardFooter className="botonesFooter">
                        <Button type="submit" color="primary" onClick={ e => this.guardar(e)}>
                            {this.state.loading && <Spinner/>}Guardar
                        </Button>
                        <Button type="reset" color="secondary" onClick={this.goBack} disabled={this.state.loading}>Cancelar</Button>
                    </CardFooter>
                </Card>
			</div>
        )
    }

}

export default ActualizarValores;