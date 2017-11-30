import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardFooter,
	CardBody
} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Loader from 'react-loaders';
import db from '../../fire';
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga } from '../../constants';


function tipoFormatter(cell, row) {
	let badge;
	switch (cell) {
		case pacientePrivado:
			badge = `<span class="badge badge-secondary">${filtroTipoPaciente[pacientePrivado]}</span>`;
			break;
		case pacientePrepaga:
			badge = `<span class="badge badge-info">${filtroTipoPaciente[pacientePrepaga]}</span>`;
			break;
	}
	return badge;
}

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: [],
			resultados: 0,
			loading: false
		};
		this.nuevoPaciente = this.nuevoPaciente.bind(this);
		this.loading = this.loading.bind(this);
	}

	componentWillMount(){
		this.loading(true);
        db.collection("pacientes").orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
			this.loadPacientes(querySnapshot);
			this.loading(false);
		});
	}

	loadPacientes(querySnapshot){
		let pacientes = [];
		querySnapshot.docs.forEach( doc => {            
			let paciente = doc.data();
			paciente.id = doc.id;
			pacientes.push(paciente);
		});
		this.setState({pacientes: [...pacientes].concat([])});
		console.log('pacientes', this.state.pacientes);		
	}

	loading(val){
        this.setState({loading: val});
    }

	nuevoPaciente(){
		this.props.history.push(`/pacientes/new`);
	}
	
	render() {

		const options = {
			noDataText: 'No hay pacientes registrados',
			onFilterChange: this.onFilterChange
		}

		return (
			<div className="animated fadeIn">
				<Loader type="ball-scale-ripple-multiple" active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn listaPacientes"}>                
					<Row>
						<Col>
							<Card>
								<CardHeader>
									<i className="fa fa-align-justify"></i> Pacientes
								</CardHeader>
								<CardBody>
									<div className="d-flex flex-row mb-1">
										{/* <div className="callout callout-info mb-0 mt-0">
											<small className="text-muted">Resultados</small>
											<br/>
											<strong className="h4">{`${this.state.resultados}`}</strong>											
										</div> */}
										<div className="align-self-end ml-auto">
											<Button color="primary" size="sm" onClick={this.nuevoPaciente}><i className="fa fa-plus"></i> Nuevo paciente</Button>
										</div>
									</div>
									{/* 
					<ul>
						{this.state.pacientes.map( p => <li key={p.id}><Link to={`/pacientes/${p.id}`}>{JSON.stringify(p)}</Link></li>)}
					</ul> */}
									<BootstrapTable ref="table" version='4'
										data={this.state.pacientes}
										bordered={false}
										striped hover condensed
										options={options}>
										<TableHeaderColumn
											dataField='id'
											isKey
											hidden>
											ID
										</TableHeaderColumn>										
										<TableHeaderColumn
											dataField='apellido'
											filter={{ type: 'TextFilter', placeholder:"Ingrese apellido..."}}
											dataSort>
											Apellido
										</TableHeaderColumn>
										<TableHeaderColumn
											dataField='nombre'
											filter={{ type: 'TextFilter', placeholder:"Ingrese nombre..."}}
											dataSort>
											Nombre
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='tipo'
											width="130"
											dataFormat={ tipoFormatter }
          									filter={ { type: 'SelectFilter', placeholder:"Todos", options: filtroTipoPaciente } }
											dataSort>
											Tipo
										</TableHeaderColumn>
										{/* <TableHeaderColumn dataField='tipo' 
											dataFormat={ tipoFormatter }
											// formatExtraData={ filtroTipoPaciente }
          									filter={ { type: 'SelectFilter', placeholder:"Todos", options: filtroTipoPaciente } }
											dataSort>
											Tipo
										</TableHeaderColumn> */}

										{/* <TableHeaderColumn width="20%"></TableHeaderColumn> */}
									</BootstrapTable>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		)
	}

}

export default ListaPacientes;