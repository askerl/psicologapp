import React, { Component } from 'react';
import db from '../../fire';
import Widget04 from '../Widgets/Widget04';

class Dashboard extends Component {
  
  constructor(props) {
    super(props);

  }

  componentDidMount(){
    this.countPac = 0;
    db.collection("pacientes").get().then(function(querySnapshot) {
      console.log('cantidad pacientes', querySnapshot.docs.length);
      this.countPac = querySnapshot.docs.length;
    });

    this.maxPac = 100;
    this.proPac = (this.countPac / this.maxPac ) * 100;

    console.log(this.proPac);
  }

  render() {
    return (
      <div className="animated fadeIn">
        en construcción...
        <hr/>
        <Widget04 icon="icon-people" color="info" header="2" value="2">Pacientes</Widget04>
        <Widget04 icon="icon-bubbles" color="orange" header="385" value="25">Sesiones</Widget04>
      </div>
    );
  }
}

export default Dashboard;
