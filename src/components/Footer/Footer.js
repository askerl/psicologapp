import React, { Component } from 'react';
import { version } from '../../config/version';

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <div className="mr-auto"><small><a href="#">Alfredo Skerl</a> &copy; 2017.</small></div>
        <div><small>v<strong>{version}</strong></small></div>
      </footer>
    )
  }
}

export default Footer;
