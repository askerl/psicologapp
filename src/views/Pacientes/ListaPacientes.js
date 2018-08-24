import React, {Component} from 'react';
import {
	Row,
	Col,
	Button,
	Card,
	CardHeader,
	CardBody,
	Input
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
moment.locale("es");
import { filtroPrepagas, filtroTipoPaciente, estadosPaciente, overlay, breakpoints} from '../../config/constants';
import { getPacientes } from '../../utils/utils';
import { tablasFormatter } from '../../utils/formatters';
import filterFactory, { textFilter, numberFilter, selectFilter } from 'react-bootstrap-table2-filter';
import LoadingOverlay from 'react-loading-overlay';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: [],
			filtroEstado: localStorage.getItem('filtroEstado') || estadosPaciente[1].value, //activos por defecto,
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
		// load data
		this.cargarPacientes();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

	resize(){
		console.log
		this.setState({size: window.innerWidth});
	}

	cargarPacientes() {
		this.loading(true);
		getPacientes(this.filtroEstado.value).then( pacientes => {
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
		localStorage.setItem('filtroEstado', this.filtroEstado.value);
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
											<Button color="primary" size="sm" onClick={this.nuevoPaciente}><i className="fa fa-plus"></i> Nuevo paciente</Button>
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