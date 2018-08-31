import React, { Component } from 'react';
import { Col, Row, Badge } from 'reactstrap';
import { getPaciente, getSesionesPaciente } from '../../utils/utils';
import { overlay, tableColumnClasses, breakpoints } from '../../config/constants';
import LoadingOverlay from 'react-loading-overlay';
import { tablasFormatter } from '../../utils/formatters';
import { NotificationManager } from 'react-notifications';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import EvolucionSesion from './pacienteEvolucion';

class HistoriaClinica extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            paciente: {},
            sesiones: [],
            size: ''
        };
        this.loading = this.loading.bind(this);
        this.resize = this.resize.bind(this);
    }

    componentDidMount() {
        let id = this.props.id;
        getPaciente(id).then( paciente => {
            this.setState({paciente});
        }).then(getSesionesPaciente(id).then( sesiones => {
            // console.log('sesiones del paciente', sesionesPaciente);
            this.setState({sesiones});
            this.loading(false);
        })).catch(error => { 
            console.log('Error al cargar los datos del paciente', error);
            NotificationManager.error(errores.errorCargarDatosPaciente, 'Error');
            this.loading(false);
            this.props.goBack();
        });
        window.addEventListener("resize", this.resize);
		this.resize();
    }

    componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

    loading(loading) {
        this.setState({loading});
    }

    resize(){
		this.setState({size: window.innerWidth});
	}

    render() {
        let paciente = this.state.paciente;
        
        const { SearchBar } = Search;

        const columns = [{
			dataField: 'id',
			text: 'Session ID',
            hidden: true
        }, {
			dataField: 'nro',
			text: 'Nro.',
            headerAttrs: { width: '60px' },
            align: 'right', headerAlign: 'right',
            sort: true
		}, {
			dataField: 'fecha.seconds',
			text: 'Fecha',
			headerAttrs: { width: '100px' },
            formatter: tablasFormatter.fecha,
            sort: true
		}, {
			dataField: 'evolucion',
			text: 'Evolución',
        }];
        
        const expandRow = {
			renderer: rowData => {
                return <EvolucionSesion id={rowData.id}/>
            },
			showExpandColumn: true,
			expandHeaderColumnRenderer: ({ isAnyExpands }) => {
				return <span title={isAnyExpands ? 'Contraer todo' : 'Expandir todo'}><i className={"fa " + (isAnyExpands ? 'fa-minus' : 'fa-plus')}/></span>;
			},
			expandColumnRenderer: ({ expanded }) => {
				return <span title={expanded ? 'Contraer fila' : 'Expandir fila'}><i className={"fa " + (expanded ? 'fa-minus' : 'fa-plus')}/></span>;
			}
		}

        return (
            <div className="animated fadeIn historiaClinica">
                <LoadingOverlay
                    active={this.state.loading}
                    animate
                    spinner
                    color={overlay.color}
                    background={overlay.backgroundWhite}>
                    <Row>
                        <Col>
                            <div className="d-flex align-items-center mb-3">
                                <h5 className="mr-2 mb-0">{paciente.nombreCompleto}</h5>{tablasFormatter.tipoPaciente(paciente.tipo)}
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ToolkitProvider
                                keyField='id'
                                data={this.state.sesiones}
                                columns={columns}
                                search={{ searchFormatted: true }}>
                                {
                                    props => (
                                        <div>
                                            <SearchBar {...props.searchProps}
                                                placeholder="Buscar..."
                                                className={`${tablasFormatter.filterClass} mb-2`} />
                                            <BootstrapTable	{...props.baseProps}
                                                classes="tablaHC"
                                                defaultSortDirection="asc"
                                                noDataIndication='No hay sesiones registradas'
                                                expandRow={expandRow}
                                                bootstrap4
                                                bordered={false}
                                                striped
                                                hover />
                                        </div>
                                    )
                                }
                            </ToolkitProvider>
                        </Col>
                    </Row>
                </LoadingOverlay>
            </div>
        );
    }
}

export default HistoriaClinica;
