import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { errores, mensajes } from '../../../config/mensajes';
import Spinner from '../../../components/Spinner/Spinner';
import { overlay, breakpoints } from '../../../config/constants';
import { tablasFormatter } from '../../../utils/formatters';
import LoadingOverlay from 'react-loading-overlay';
import BootstrapTable from 'react-bootstrap-table-next';
	
class Prepagas extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
            loading: false,
            prepagas: []
        };
	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {

    }
    
	render() {

        const columns = [{
			dataField: 'id',
			text: '',
            headerAttrs: { width: '88px' },
            formatter: tablasFormatter.actionsPrepaga
		}, {
			dataField: 'nombre',
			text: 'Nombre',
            sort: true
        }, {
			dataField: 'pagoAusencia',
            text: 'Pago por ausencia',
            align: 'right', headerAlign: 'right',
            formatter: tablasFormatter.precio
        }];

		return (
			<div>
                <Card>
                    <CardHeader>
                        <i className="fa fa-hospital-o fa-lg"></i> Prepagas
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs="12" sm="6">
                                <div className="d-flex flex-row mb-2 mr-auto">										
                                    <Button color="success" size="sm" title="Nueva Prepaga" onClick={() => console.log('Nueva Prepaga')} disabled={this.state.loading}>
                                        {this.state.loading ? <Spinner/> : <i className="fa fa-plus mr-2"></i>}Nueva Prepaga
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
                                        data={this.state.prepagas}
                                        columns={columns}
                                        classes="tablaPrepagas"
                                        noDataIndication='No hay prepagas registradas'
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

export default Prepagas;
