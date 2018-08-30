import React, { Component } from 'react';
import { Col, Row, Badge } from 'reactstrap';
import { getPaciente, getSesionesPaciente } from '../../utils/utils';
import { overlay, tableColumnClasses } from '../../config/constants';
import LoadingOverlay from 'react-loading-overlay';
import { tablasFormatter } from '../../utils/formatters';
import { NotificationManager } from 'react-notifications';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

class SesionesPaciente extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            paciente: {},
            sesiones: []
        };
        this.loading = this.loading.bind(this);
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

    }

    loading(loading) {
        this.setState({loading});
    }

    render() {
        let paciente = this.state.paciente;
        
        const { SearchBar } = Search;

        const columns = [{
			dataField: 'id',
			text: 'Session ID',
			hidden: true
		}, {
			dataField: 'fecha.seconds',
			text: 'Fecha',
			headerAttrs: { width: '100px' },
			formatter: tablasFormatter.fecha
		}, {
			dataField: 'valor',
			text: 'Valor',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
		}, {
			dataField: 'copago',
			text: 'Copago',
			align: 'right', headerAlign: 'right',
			formatter: tablasFormatter.precio,
			headerClasses: tableColumnClasses.showSmall,
			classes: tableColumnClasses.showSmall
        }];
        
        const expandRow = {
			renderer: rowData => {
				return (
                    <div>PONER COMPONENTE PARA EDITAR LA HISTORIA CLÍNICA</div>
                )
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
            <div className="animated fadeIn">
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
                                                classes="tablaSesiones"
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

export default SesionesPaciente;
