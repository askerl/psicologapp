import React, { Component } from 'react';
import { version } from '../../config/version';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <span><a href="#">Alfredo Skerl</a> &copy; 2017. v<strong>{version}</strong></span>
      </footer>
    )
  }
}

export default Footer;
