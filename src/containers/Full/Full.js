import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumb from '../../components/Breadcrumb/';
import Footer from '../../components/Footer/';

import Dashboard from '../../views/Dashboard/dashboard';
import ListaPacientes from '../../views/Pacientes/listaPacientes';
import Paciente from '../../views/Pacientes/paciente';
import ListaSesiones from '../../views/Sesiones/listaSesiones';
import Sesion from '../../views/Sesiones/sesion';
import Facturaciones from '../../views/Facturaciones/facturaciones';


import {NotificationContainer} from 'react-notifications';

import {auth, logout} from '../../fire';
import { isHabilitado } from '../../utils/utils';

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
