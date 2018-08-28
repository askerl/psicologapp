import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { numberFilter, selectFilter, textFilter } from 'react-bootstrap-table2-filter';
import LoadingOverlay from 'react-loading-overlay';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Col, Input, Row } from 'reactstrap';
import { breakpoints, estadosPaciente, filtroPrepagas, filtroTipoPaciente, overlay } from '../../config/constants';
import { tablasFormatter } from '../../utils/formatters';
import { filterPacientesEstado, getPacientes, getSession, setSession } from '../../utils/utils';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: [],
			filtroEstado: getSession('filtroEstado') || estadosPaciente[1].value, //activos por defecto,
			loading: true,
			size: ''
		};
		this.cargarPacientes = this.cargarPacientes.bind(this);
		this.nuevoPaciente = this.nuevoPaciente.bind(this);
		this.changeEstado = this.changeEstado.bind(this);
		this.loading = this.loading.bind(this);
		this.resize = this.resize.bind(this);
	}

	componentDidMount(){
		// set initial filter state
		this.filtroEstado.value = this.state.filtroEstado;
		// resize listener
		window.addEventListener("resize", this.resize);
		this.resize();
		this.cargarPacientes();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

	resize(){
		this.setState({size: window.innerWidth});
	}

	cargarPacientes() {
		this.loading(true);
		getPacientes().then( result => {
			let pacientes = filterPacientesEstado(result, this.filtroEstado.value);
			this.setState({pacientes: [...pacientes].concat([])});
			this.loading(false);
		});
	}

	loading(val){
        this.setState({loading: val});
    }

	nuevoPaciente(){
		this.props.history.push('/pacientes/new');
	}

	changeEstado(){
		setSession('filtroEstado', this.filtroEstado.value);
		this.setState({filtroEstado: this.filtroEstado.value});
		this.cargarPacientes();
	}
	
	render() {

		const columns = [{
			dataField: 'id',
			text: '',
			headerAttrs: { width: '36px' },
			formatter: tablasFormatter.actionsPaciente
		}, {
			dataField: 'nombreCompleto',
			text: 'Paciente',
			//headerAttrs: { 'min-width': '200px' },
			formatter: tablasFormatter.nombrePaciente,
			sort: true,
			filter: textFilter({placeholder:' ', className:tablasFormatter.filterClass})
		},{
			dataField: 'edad',
			text: 'Edad',
			align: 'center', headerAlign: 'center',
			headerAttrs: { width: '130px' },
			formatter: tablasFormatter.edad,
			sort: true,
			filter: numberFilter({
				placeholder:' ', 
				comparatorClassName: tablasFormatter.filterClass,
				numberClassName: tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'tipo',
			text: 'Tipo',
			headerAttrs: { width: '130px' },
			formatter: tablasFormatter.tipoPaciente,
			sort: true,
			filter: selectFilter({
				options: filtroTipoPaciente,
				placeholder: 'Todos',
				className:tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'prepaga',
			text: 'Prepaga',
			headerAttrs: { width: '130px' },
			formatter: tablasFormatter.prepaga,
			sort: true,
			filter: selectFilter({
				options: filtroPrepagas,
				placeholder: 'Todas',
				className:tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.md
		},{
			dataField: 'credencial',
			text: 'Credencial',
			sort: true,
			filter: textFilter({placeholder:' ', className:tablasFormatter.filterClass}),
			hidden: this.state.size < breakpoints.md
		},{
			dataField: 'sesionesRestantes',
			text: 'Sesiones restantes',
			formatter: tablasFormatter.sesionesRestantes,
			sort: true,
			filter: numberFilter({
				placeholder:' ', 
				comparatorClassName: tablasFormatter.filterClass,
				numberClassName: tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.lg
		}];

		return (
			<div className="animated fadeIn listaPacientes">
				<Row>
					<Col>
						<Card className="mainCard">
							<CardHeader>
								<i className="fa fa-address-book-o fa-lg"></i> Pacientes
								</CardHeader>
							<CardBody>
								<Row>
								<Col>
									<div className="d-flex flex-row mb-2">
										<div className="mr-auto">
											<Link to={'/pacientes/new'} title="Nuevo Paciente" className="linkButton">
												<Button color="primary" size="sm"><i className="fa fa-plus"></i> Nuevo paciente</Button>
											</Link>
										</div>
										<div className="filtros">
											<Input id="filtroEstado" className="filtroEstado" type="select" title="Filtrar por estado"
												bsSize="sm" name="filtroEstado"  innerRef={el => this.filtroEstado = el} onChange={this.changeEstado}>
												{estadosPaciente.map((item, index) => <option key={index} value={item.value}>{item.title}</option>)}
											</Input>
										</div>
									</div>
								</Col>
								</Row>
									<LoadingOverlay
										active={this.state.loading}
										animate
										spinner
										color={overlay.color}
										background={overlay.background}>
										<BootstrapTable keyField='id' classes="tablaPacientes"
											data={this.state.pacientes} 
											columns={columns} 
											filter={filterFactory()}
											defaultSortDirection="asc"
											noDataIndication='No hay pacientes registrados'
											bordered={false}
											bootstrap4
											striped
											hover/>
									</LoadingOverlay>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}

}

export default ListaPacientes;