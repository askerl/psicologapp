import React, {Component, cloneElement} from 'react';
import {Link, Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumb from '../../components/Breadcrumb/';
import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';

import Dashboard from '../../views/Dashboard/';
import ListaPacientes from '../../views/Pacientes/ListaPacientes';
import Paciente from '../../views/Pacientes/Paciente';
import ListaSesiones from '../../views/Sesiones/ListaSesiones';
import Sesion from '../../views/Sesiones/Sesion';
import Facturaciones from '../../views/Facturaciones/Facturaciones';

import {NotificationContainer} from 'react-notifications';

import db from '../../fire';


class Full extends Component {

  render() {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar {...this.props}/>
          <main className="main">
            <Breadcrumb />
            <Container fluid className="p-0 pl-sm-3 pr-sm-3">
              <Switch>
                <Route path="/dashboard" name="Dashboard" component={Dashboard}/>
                <Route exact path="/pacientes" name="Pacientes" component={ListaPacientes}/>
                <Route path='/pacientes/:id' name="Paciente" component={Paciente}/>
                <Route exact path="/sesiones" name="Sesiones" component={ListaSesiones}/>
                <Route path='/sesiones/:id' name="Sesion" component={Sesion}/>
                <Route exact path="/facturaciones" name="Facturaciones" component={Facturaciones}/>
                <Redirect from="/" to="/dashboard"/>                
              </Switch>
              <NotificationContainer enterTimeout={200}/>
            </Container>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Full;
