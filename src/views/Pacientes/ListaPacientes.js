import React, {Component, cloneElement} from 'react';
import {Link} from 'react-router-dom';
import {
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardFooter,
	CardBody,
	Progress
} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Loader from 'react-loaders';
import db from '../../fire';
import { filtroTipoPaciente, pacientePrivado, pacientePrepaga, calcPorcentajesSesiones, cargarPrepagas, tipoFormatter, prepagaFormatter, tipoLoader } from '../../constants';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: [],
			filtroPrepagas: {},
			loading: false
		};
		this.actionsFormatter = this.actionsFormatter.bind(this);
		this.restantesFormatter = this.restantesFormatter.bind(this);
		this.nuevoPaciente = this.nuevoPaciente.bind(this);
		this.loading = this.loading.bind(this);
	}

	componentWillMount(){
		this.loading(true);

		cargarPrepagas().then( () => {
			this.setState({filtroPrepagas: window.filtroPrepagas});
			db.collection("pacientes").orderBy("apellido","asc").orderBy("nombre","asc").get().then( querySnapshot => {
				this.loadPacientes(querySnapshot);
				this.loading(false);
			});
		});
	
	}

	loadPacientes(querySnapshot){
		let pacientes = [];
		querySnapshot.docs.forEach( doc => {            
			let paciente = doc.data();
			paciente.id = doc.id;
			paciente.sesionesRestantes = paciente.sesionesAut ? (paciente.sesionesAut - paciente.sesiones) : '';
			let porcs = calcPorcentajesSesiones(paciente.sesionesAut, paciente.sesiones);
			paciente.porcRestantes = porcs.porcRestantes;
			paciente.nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;
			pacientes.push(paciente);
		});
		this.setState({pacientes: [...pacientes].concat([])});
		console.log('pacientes', this.state.pacientes);		
	}

	loading(val){
        this.setState({loading: val});
    }

	nuevoPaciente(){
		this.props.history.push('/pacientes/new');
	}

	actionsFormatter(cell, row) {
		return (
			<Link to={`/pacientes/${cell}`} title="Editar paciente"><i className="fa fa-edit fa-lg"></i></Link>
		);
	}
	
	restantesFormatter(cell, row) {
		let color;
		if (row.porcRestantes > 80) {
			color = "success";
		} else if (row.porcRestantes > 10) {
			color = "warning";
		} else {
			color = "danger";
		}
		let prog = cell == '' ? '': 
			<div className="d-flex flex-column">
				<div className="d-flex">
					<strong>{cell}</strong>
				</div>				
				<Progress className="progress-xs" color={color} value={row.porcRestantes}/>
			</div>;
		return prog;
	}
	
	
	render() {

		const options = {
			noDataText: 'No hay pacientes registrados',
			onFilterChange: this.onFilterChange
		}

		return (
			<div className="animated fadeIn">
				<Loader type={tipoLoader} active={this.state.loading} />
				<div className={(this.state.loading ? 'invisible' : 'visible') + " animated fadeIn listaPacientes"}>                
					<Row>
						<Col>
							<Card>
								<CardHeader>
									<i className="fa fa-address-book-o"></i> Pacientes
								</CardHeader>
								<CardBody>
									<div className="d-flex flex-row mb-1">
										<div className="mr-auto">
											<Button color="primary" size="sm" onClick={this.nuevoPaciente}><i className="fa fa-plus"></i> Nuevo paciente</Button>
										</div>
									</div>
									<BootstrapTable ref="table" version='4'
										data={this.state.pacientes}
										bordered={false}
										striped hover
										options={options}
										>
										<TableHeaderColumn 
											dataField='id' isKey
											dataFormat={ this.actionsFormatter}
											dataAlign='center'
											width="43">											
										</TableHeaderColumn>										
										<TableHeaderColumn
											dataField='nombreCompleto'
											filter={{ type: 'TextFilter', placeholder:"..."}}
											dataSort>
											<span className="thTitle">Paciente</span>
										</TableHeaderColumn>										
										<TableHeaderColumn 
											dataField='tipo'
											width="130"
											dataFormat={ tipoFormatter }
          									filter={ { type: 'SelectFilter', placeholder:"Todos", options: filtroTipoPaciente } }
											dataSort>
											<span className="thTitle">Tipo</span>
										</TableHeaderColumn>
										<TableHeaderColumn 
											dataField='prepaga'
											dataFormat={ prepagaFormatter } 											
											filter={ { type: 'SelectFilter', placeholder:"Todas", options: this.state.filtroPrepagas } }
											dataSort
											>
											<span className="thTitle">Prepaga</span>
										</TableHeaderColumn>
										<TableHeaderColumn
											dataField='sesionesRestantes'
											dataFormat= { this.restantesFormatter }											
											filter={{ type: 'NumberFilter', placeholder:"...", numberComparators: [ '=', '>', '<=' ] }}
											dataSort
											width="200"
											>
											<span className="thTitle">Sesiones restantes</span>
										</TableHeaderColumn>
										
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