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
import Loader from 'react-loaders';
import db from '../../fire';
import moment from 'moment';
moment.locale("es");
import { tipoLoader, filtroPrepagas, filtroTipoPaciente, tableColumnClasses, estadosPaciente} from '../../config/constants';
import { calcPorcentajesSesiones } from '../../utils/utils';
import { tablasFormatter } from '../../utils/formatters';
import filterFactory, { textFilter, numberFilter, selectFilter } from 'react-bootstrap-table2-filter';

class ListaPacientes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pacientes: [],
			filtroEstado: estadosPaciente[1].value, //activos por defecto
			loading: true
		};
		this.nuevoPaciente = this.nuevoPaciente.bind(this);
		this.changeEstado = this.changeEstado.bind(this);
		this.loading = this.loading.bind(this);
	}

	componentDidMount(){
		this.loading(true);
		this.filtroEstado.value = this.state.filtroEstado;
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
			paciente.sesionesRestantes = paciente.sesionesAut ? (paciente.sesionesAut - paciente.sesiones) : '';
			let porcs = calcPorcentajesSesiones(paciente.sesionesAut, paciente.sesiones);
			paciente.porcRestantes = porcs.porcRestantes;
			paciente.nombreCompleto = `${paciente.apellido}, ${paciente.nombre}`;
			let fchNacMoment = moment(paciente.fchNac, 'DD/MM/YYYY');
    		paciente.edad = fchNacMoment.isValid() ? moment().diff(fchNacMoment, 'years') : 0;
			pacientes.push(paciente);
		});
		this.setState({pacientes: [...pacientes].concat([])});
		//console.log('pacientes', this.state.pacientes);		
	}

	loading(val){
        this.setState({loading: val});
    }

	nuevoPaciente(){
		this.props.history.push('/pacientes/new');
	}

	changeEstado(){
		this.estadoFilter(this.filtroEstado.value);
		this.setState({filtroEstado: this.filtroEstado.value});
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
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
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
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
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
			headerClasses: tableColumnClasses.showMedium,
			classes: tableColumnClasses.showMedium
		},{
			dataField: 'credencial',
			text: 'Credencial',
			sort: true,
			filter: textFilter({placeholder:' ', className:tablasFormatter.filterClass}),
			headerClasses: tableColumnClasses.showMedium,
			classes: tableColumnClasses.showMedium
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
			headerClasses: tableColumnClasses.showLarge,
			classes: tableColumnClasses.showLarge
		},{
			dataField: 'activo',
			text: 'Activo',
			filter: textFilter({
				getFilter: (filter) => {
				  this.estadoFilter = filter;
				},
				defaultValue: estadosPaciente[1].value.toString()
			}),
			headerClasses: tableColumnClasses.hide,
			classes: tableColumnClasses.hide
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
								<Col xs="12" sm="6">
									<div className="d-flex flex-row mb-2 mr-auto">
										<Button color="primary" size="sm" onClick={this.nuevoPaciente}><i className="fa fa-plus"></i> Nuevo paciente</Button>
									</div>
								</Col>
								<Col xs="12" sm="6">
									<div className="filtros d-flex flex-row mb-2 justify-content-sm-end">
										<Input id="filtroEstado" className="filtroEstado" type="select" title="Filtrar por estado"
											bsSize="sm" name="filtroEstado"  innerRef={el => this.filtroEstado = el} onChange={this.changeEstado}>
											{estadosPaciente.map((item, index) => <option key={index} value={item.value}>{item.title}</option>)}
										</Input>
									</div>
								</Col>
								</Row>
								<Loader type={tipoLoader} active={this.state.loading} />
								{!this.state.loading &&
									<BootstrapTable keyField='id' classes="tablaPacientes"
										data={this.state.pacientes} 
										columns={columns} 
										filter={filterFactory()}
										defaultSortDirection="asc"
										noDataIndication='No hay pacientes registrados'
										bordered={ false }
										bootstrap4
										striped
										hover/>
								}
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}

}

export default ListaPacientes;