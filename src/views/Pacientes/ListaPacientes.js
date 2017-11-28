import React, {Component} from 'react';
import {Link} from 'react-router-dom';
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

import db from '../../fire';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: []
		};
		this.nuevoPaciente = this.nuevoPaciente.bind(this);
	}

	loadPacientes(querySnapshot){
		console.log('cargando lista de pacientes...');
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

	nuevoPaciente(){
		this.props.history.push(`/pacientes/new`);
	}
	
	// componentDidMount(){
	// 	db.collection("pacientes").onSnapshot( querySnapshot => {
	// 		this.loadPacientes(querySnapshot);
	// 	});
	// }

	// componentWillUnmount(){
	// 	console.log('unmounting lISTA pacientes');
	// 	let unsubscribe = db.collection("pacientes").onSnapshot(function () {});
	// 	// Stop listening to changes
	// 	unsubscribe();
	// }

	render() {
		return (
			<div className="animated fadeIn">
				COMPONENTE DE PACIENTES (lista con acciones)
				<Button onClick={this.nuevoPaciente}>Nuevo paciente</Button>
				<hr/>				
				<ul>
					{this.state.pacientes.map( p => <li key={p.id}><Link to={`/pacientes/${p.id}`}>{JSON.stringify(p)}</Link></li>)}
				</ul>
				<hr/>
			</div>
		)
	}

}

export default ListaPacientes;