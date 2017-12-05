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
            <Container fluid>
              <Switch>
                <Route path="/dashboard" name="Dashboard" component={Dashboard}/>
                <Route exact path="/pacientes" name="Pacientes" component={ListaPacientes}/>
                <Route path='/pacientes/:id' name="Paciente" component={Paciente}/>
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
