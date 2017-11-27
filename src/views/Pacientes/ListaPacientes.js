import React, {Component} from 'react';
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

import Paciente from './Paciente';

import db from '../../fire';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: []
		};
	}

	loadPacientes(querySnapshot){
		let pacientes = [];
		querySnapshot.docs.forEach( doc => {            
			// console.log(doc.id, " => ", doc.data());
			let paciente = {id: doc.id, data: doc.data()}
			pacientes.push(paciente);
		});
		this.setState({pacientes: [...pacientes].concat([])});
	}

	componentWillMount(){
        db.collection("pacientes").get().then( querySnapshot => {
            this.loadPacientes(querySnapshot);
        });
	}
	
	componentDidMount(){
		db.collection("pacientes").onSnapshot( querySnapshot => {
			this.loadPacientes(querySnapshot);
		});
	}

	componentWillUnmount(){
		console.log('unmounting lISTA pacientes');
		let unsubscribe = db.collection("pacientes").onSnapshot(function () {});
		// Stop listening to changes
		unsubscribe();
	}

	render() {
		return (
			<div className="animated fadeIn">
				COMPONENTE DE PACIENTES (lista con acciones)
				<hr/>
				<ul>
					{this.state.pacientes.map( p => <li key={p.id}>{JSON.stringify(p)}</li>)}
				</ul>
				<hr/>
				<Paciente />
			</div>
		)
	}

}

export default ListaPacientes;