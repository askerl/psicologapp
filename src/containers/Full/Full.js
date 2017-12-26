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

import { FirebaseAuth } from 'react-firebaseui';

import {db, auth, uiConfig, logout} from '../../fire';
import { isHabilitado } from '../../constants';

class Full extends Component {

  componentDidMount(){

    auth.onAuthStateChanged( (user) => {
      if (user) {
        // chequeo si es usuario de mi lista
        if (!isHabilitado(user.email)){
          logout();
          this.props.history.push('/login');  
        } 
      } else {
        // User is signed out.
        // redirect to login
        this.props.history.push('/login');
      }
    }, (error) => {
      console.log(error);
    });
  };

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
