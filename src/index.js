import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route, Switch, BrowserRouter} from 'react-router-dom';

// Styles

// CSS for datepickers

// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
// Import Main styles for this application
import '../scss/style.scss'
// Temp fix for reactstrap
import '../scss/core/_dropdown-menu-right.scss'
// CSS for notifications
import 'react-notifications/lib/notifications.css';

import 'react-select/dist/react-select.css';

// Containers
import Full from './containers/Full';

ReactDOM.render((
  <HashRouter>
    <Switch>
      <Route path="/" name="Inicio" component={Full}/>
    </Switch>
  </HashRouter>
), document.getElementById('root'));
