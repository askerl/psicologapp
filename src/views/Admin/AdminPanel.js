import React, { Component } from 'react';
import { Col, Row, Button } from 'reactstrap';
import Respaldos from './Respaldos/respaldos';
import Prepagas from './Prepagas/prepagas';

	
class AdminPanel extends Component {
  
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// nada por ahora
	}

	render() {
		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Respaldos/>
						<Prepagas/>
					</Col>
				</Row>
			</div>
		);
	}
}

export default AdminPanel;
