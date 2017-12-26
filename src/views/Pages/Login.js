import React, {Component} from 'react';
import {Container, Row, Col, CardGroup, Card, CardBody, Button, Input, InputGroup, InputGroupAddon} from 'reactstrap';
import { FirebaseAuth } from 'react-firebaseui';
import { uiConfig, auth } from '../../fire';


class Login extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col>
                <FirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}/>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
