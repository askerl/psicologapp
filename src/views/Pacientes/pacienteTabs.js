import React, { Component } from 'react';
import { Badge, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import Paciente from './paciente';
import HistoriaClinica from './pacienteHistoriaClinica';

class PacienteTabs extends Component {

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            id: props.match.params.id,
            activeTab: '1',
        };
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            });
        }
    }

    render() {
        let nuevo = this.state.id == 'new';
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" className="mb-4">
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '1' })}
                                    onClick={() => { this.toggle('1'); }}>
                                    <div className="d-flex d-flex align-items-center">
                                        <i className="icon-notebook mr-2"></i>
                                        <span>Datos</span>
                                        <Badge className={nuevo ? 'badge-pill ml-2' : 'd-none'} color="success">Nuevo</Badge>
                                    </div>
                                </NavLink>
                            </NavItem>
                            {!nuevo &&
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '2' })}
                                    onClick={() => { this.toggle('2'); }}>
                                    <div className="d-flex d-flex align-items-center">
                                        <i className="icon-bubbles mr-2"></i>
                                        <span>Historia Clínica</span>
                                    </div>
                                </NavLink>
                            </NavItem>
                            }
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <Paciente id={this.state.id} goBack={() => this.props.history.push('/pacientes')}/>
                            </TabPane>
                            {!nuevo &&
                            <TabPane tabId="2">
                                <HistoriaClinica id={this.state.id} goBack={() => this.props.history.push('/pacientes')}/>
                            </TabPane>
                            }
                        </TabContent>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PacienteTabs;
