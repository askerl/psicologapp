import React, { Component } from 'react';
import db from '../../fire';
import Widget04 from '../Widgets/Widget04';

class Dashboard extends Component {
  
  constructor(props) {
    super(props);

  }

  componentWillMount(){
    this.countPac = 0;
    db.collection("pacientes").get().then((querySnapshot)=> {
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
        <Widget04  color="info" header="2" value="2">Pacientes</Widget04>
        <Widget04  color="orange" header="385" value="25">Sesiones</Widget04>
      </div>
    );
  }
}

export default Dashboard;
