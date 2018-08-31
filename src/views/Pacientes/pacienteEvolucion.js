import React, { Component } from 'react';

class EvolucionSesion extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount(){

    }

    render() {
        let idSesion = this.props.id;
        return (
            <div>
                Evolución del paciente en la sesion {idSesion}
            </div>
        )
    }

}

export default EvolucionSesion;