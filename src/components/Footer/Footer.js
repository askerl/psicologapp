import React, { Component } from 'react';
import { version } from '../../config/version';
import { env, envs } from '../../config/envs';

class Footer extends Component {
  render() {
    const test = env == envs.TEST;
    return (
      <footer className={"app-footer " + (test ? 'testFooter': '')}>
        <div className="mr-auto">
          <small><a href="https://www.linkedin.com/in/alfredo-skerl/" target="_blank">Alfredo Skerl <i className="fa fa-linkedin-square mr-1" title="Linkedin"></i></a> &copy; 2018.</small>
        </div>
        { test &&
          <div className="mr-1"><small><strong>{`${env} - `}</strong></small></div>
        }
        <div><small>v<strong>{version}</strong></small></div>
      </footer>
    )
  }
}

export default Footer;
