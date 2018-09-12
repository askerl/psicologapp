import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import Respaldos from '../Respaldos/respaldos';
	
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
					</Col>
				</Row>
			</div>
		);
	}
}

export default AdminPanel;
