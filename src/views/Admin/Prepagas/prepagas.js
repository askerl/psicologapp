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
            loading: false
        };
	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount() {

    }
    
	render() {

		return (
			<div>
                <Card>
                    <CardHeader>
                        <i className="fa fa-database fa-lg"></i> Prepagas
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col>
                              Coming soon...
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
			</div>
		);
	}
}

export default Prepagas;
