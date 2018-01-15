import React, { Component } from 'react';
import db from '../../fire';
import { pacientePrepaga, pacientePrivado, prepagas, round } from '../../constants';
import Loader from 'react-loaders';

import {
	Row,
	Col,
	Progress,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	CardTitle
} from 'reactstrap';
	
import Widget02 from '../Widgets/Widget02';
import {StatItem, Callout} from '../Widgets/WidgetsAuxiliares';
	
class AdminPanel extends Component {
  
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
	}

	loading(val){
		this.setState({loading: val});
	}

	componentDidMount(){
		this.loading(true);
        // cargo datos
        this.loading(false);
	}

	render() {
		let data = this.state;
		return (
			<div className="animated fadeIn">
				<Loader type="ball-scale-ripple-multiple" active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn dashboard"}>           
					<Row>
						<Col>
							<Card>
								<CardBody>									
									<span className="h6">Panel administrativo</span>
								</CardBody>
							</Card>
						</Col>
					</Row>

				</div>
			</div>
		);
	}
}

export default Dashboard;
