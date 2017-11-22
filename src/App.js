import React, { Component } from 'react';
import fire from './fire';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { pacientes: [] }; // <- set up react state
  }
  componentWillMount(){
    /* Create reference to messages in Firebase Database */
    let pacientesRef = fire.database().ref('pacientes').orderByKey().limitToLast(100);
    pacientesRef.on('child_added', snapshot => {
      /* Update React state when message is added at Firebase Database */
      console.log('snapshot', snapshot);
      // let paciente = { text: snapshot.val(), id: snapshot.key };
      // this.setState({ pacientes: [paciente].concat(this.state.pacientes) });
    })
  }
  addMessage(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the message to Firebase */
    fire.database().ref('pacientes').push( {"dni": this.inputDNI.value, "nombre": this.inputName.value} );
    this.inputDNI.value = ''; // <- clear the input
    this.inputName.value = ''; // <- clear the input
  }
  render() {
    return (
      <form onSubmit={this.addMessage.bind(this)}>
        <input type="text" ref={ el => this.inputDNI = el } placeholder="DNI"/>
        <input type="text" ref={ el => this.inputName = el } placeholder="Nombre"/>
        <input type="submit"/>
        <ul>
          { /* Render the list of messages */
            this.state.pacientes.map( paciente => <li key={paciente.dni}>{paciente.dni} {paciente.nombre}</li> )
          }
        </ul>
      </form>
    );
  }
}

export default App;