import React, { Component } from 'react';

import Widget04 from '../Widgets/Widget04';

class Dashboard extends Component {

  render() {
    return (
      <div className="animated fadeIn">
        <Widget04 icon="icon-people" color="info" header="57" value="80">Pacientes</Widget04>
        <Widget04 icon="icon-bubbles" color="orange" header="385" value="25">Sesiones</Widget04>
      </div>
    )
  }
}

export default Dashboard;
