import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { numberFilter, selectFilter, textFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import LoadingOverlay from 'react-loading-overlay';
import { Button, Card, CardBody, CardHeader, Col, Input, Row } from 'reactstrap';
import ExportCSV from '../../components/ExportCSV/exportCSV';
import { breakpoints, estadosPaciente, filtroPrepagas, filtroTipoPaciente, overlay } from '../../config/constants';
import { tablasFormatter, csvFormatter } from '../../utils/formatters';
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
		this.editarPaciente = this.editarPaciente.bind(this);
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

	nuevoPaciente() {
		this.props.history.push('/pacientes/new');
	}

	editarPaciente(id) {
		this.props.history.push(`/pacientes/${id}`);
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
			formatter: tablasFormatter.actionsPaciente,
			formatExtraData: this.editarPaciente,
			csvExport: false
		},{
			dataField: 'nombreCompleto',
			text: 'Paciente',
			formatter: tablasFormatter.nombrePaciente,
			sort: true,
			filter: textFilter({placeholder:' ', className:tablasFormatter.filterClass})
		},{
			dataField: 'dni',
			text: 'DNI',
			hidden: true
		},{
			dataField: 'fchNac',
			text: 'Fch. Nac.',
			hidden: true
		},{
			dataField: 'edad',
			text: 'Edad',
			align: 'center', headerAlign: 'center',
			headerAttrs: { width: '130px' },
			sort: true,
			filter: numberFilter({
				placeholder:' ', 
				comparatorClassName: tablasFormatter.filterClass,
				numberClassName: tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.sm
		},{
			dataField: 'tel',
			text: 'Teléfono',
			hidden: true
		},{
			dataField: 'telFlia',
			text: 'Contacto Flia.',
			hidden: true
		},{
			dataField: 'dir',
			text: 'Dirección',
			hidden: true
		},{
			dataField: 'email',
			text: 'Email',
			hidden: true
		},{
			dataField: 'tipo',
			text: 'Tipo',
			headerAttrs: { width: '130px' },
			formatter: tablasFormatter.tipoPaciente,
			csvFormatter: csvFormatter.tipoPaciente,
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
			csvFormatter: tablasFormatter.prepaga,
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
			csvFormatter: csvFormatter.credencial,
			sort: true,
			filter: textFilter({placeholder:' ', className:tablasFormatter.filterClass}),
			hidden: this.state.size < breakpoints.md
		},{
			dataField: 'facturaPrepaga',
			text: 'Factura prepaga',
			csvFormatter: tablasFormatter.factura,
			formatExtraData: tablasFormatter.boolFormatter,
			hidden: true
		},{
			dataField: 'valorConsulta',
			text: 'Valor consulta',
			csvFormatter: csvFormatter.valorConsulta,
			hidden: true
		},{
			dataField: 'copago',
			text: 'Copago',
			csvFormatter: csvFormatter.copago,
			hidden: true
		},{
			dataField: 'sesiones',
			text: 'Sesiones',
			csvFormatter: csvFormatter.sesiones,
			hidden: true
		},{
			dataField: 'sesionesRestantes',
			text: 'Sesiones restantes',
			formatter: tablasFormatter.sesionesRestantes,
			csvFormatter: csvFormatter.sesiones,
			sort: true,
			filter: numberFilter({
				placeholder:' ', 
				comparatorClassName: tablasFormatter.filterClass,
				numberClassName: tablasFormatter.filterClass
			}),
			hidden: this.state.size < breakpoints.lg
		},{
			dataField: 'sesionesAut',
			text: 'Autorizadas',
			csvFormatter: csvFormatter.sesiones,
			hidden: true
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
							<ToolkitProvider
								keyField='id'
								data={this.state.pacientes}
								columns={columns}
                               	exportCSV={{fileName: 'pacientes.csv'}}
							>
							{
								props => (
									<div>
										<Row>
											<Col xs="12" sm="6">
												<div className="d-flex flex-row mb-2 mr-auto">										
													<Button color="success" size="sm" onClick={this.nuevoPaciente}><i className="fa fa-plus mr-2"></i>Nuevo paciente</Button>													
													<ExportCSV { ...props.csvProps } />
												</div>
											</Col>
											<Col xs="12" sm="6">
												<div className="filtros d-flex flex-row mb-2 justify-content-sm-end">
													<Input id="filtroEstado" className="filtroEstado" type="select" title="Filtrar por estado"
														bsSize="sm" name="filtroEstado" innerRef={el => this.filtroEstado = el} onChange={this.changeEstado}>
														{estadosPaciente.map((item, index) => <option key={index} value={item.value}>{item.title}</option>)}
													</Input>
												</div>
											</Col>
										</Row>
										<Row>
											<Col>
												<LoadingOverlay
													active={this.state.loading}
													animate
													spinner
													color={overlay.color}
													background={overlay.background}>
													<BootstrapTable {...props.baseProps}
														classes="tablaPacientes"
														filter={filterFactory()}
														defaultSortDirection="asc"
														noDataIndication='No hay pacientes registrados'
														bordered={false}
														bootstrap4
														striped
														hover />
												</LoadingOverlay>
											</Col>
										</Row>
									</div>
								)
							}
							</ToolkitProvider>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}

}

export default ListaPacientes;