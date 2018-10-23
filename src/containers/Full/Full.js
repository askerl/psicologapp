import React, { Component } from 'react';
import { NotificationContainer } from 'react-notifications';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import Breadcrumb from '../../components/Breadcrumb/';
import Footer from '../../components/Footer/';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import { auth, logout } from '../../fire';
import { clearSession, isHabilitado } from '../../utils/utils';
import Dashboard from '../../views/Dashboard/dashboard';
import Facturaciones from '../../views/Facturaciones/facturaciones';
import ListaPacientes from '../../views/Pacientes/listaPacientes';
import PacienteTabs from '../../views/Pacientes/pacienteTabs';
import ListaSesiones from '../../views/Sesiones/listaSesiones';
import Sesion from '../../views/Sesiones/sesion';
import ListaPrepagas from '../../views/Admin/Prepagas/listaPrepagas';
import Prepaga from '../../views/Admin/Prepagas/prepaga';
import Respaldos from '../../views/Admin/Respaldos/respaldos';

class Full extends Component {

	componentWillMount() {
		// clear previously stored session when rendering the Full component
		clearSession();
	}

	componentDidMount() {

		// AUTENTICACIÓN
		auth.onAuthStateChanged((user) => {
			if (user) {
				// chequeo si es usuario de mi lista
				if (!isHabilitado(user.email)) {
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
				<Header/>
				<div className="app-body">
					<Sidebar {...this.props} />
					<main className="main">
						<Breadcrumb />
						<Container fluid className="p-0 pl-sm-3 pr-sm-3">
							<Switch>
								<Route path="/dashboard" name="Dashboard" component={Dashboard} />
								<Route exact path="/pacientes" name="Pacientes" component={ListaPacientes} />
								<Route path='/pacientes/:id' name="Paciente" component={PacienteTabs} />
								<Route exact path="/sesiones" name="Sesiones" component={ListaSesiones} />
								<Route path='/sesiones/:id/:type?' name="Sesion" component={Sesion} />
								<Route exact path="/facturaciones" name="Facturaciones" component={Facturaciones} />
								<Route exact path="/admin/prepagas" name="Prepagas" component={ListaPrepagas} />
								<Route path='/admin/prepagas/:id' name="Prepaga" component={Prepaga} />
								<Route exact path="/admin/respaldos" name="Respaldos" component={Respaldos} />
								<Redirect from="/" to="/dashboard" />
							</Switch>
							<NotificationContainer enterTimeout={200} />
						</Container>
					</main>
				</div>
				<Footer />
			</div>
		);
	}
}

export default Full;
