import React, {Component} from 'react';
import {
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import { db, auth, logout } from '../../fire';

class HeaderDropdown extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      dropdownOpen: false,
      user: {
        photoURL: ''
      }
    };
  }

  componentDidMount(){

      auth.onAuthStateChanged( (user) => {        
        if (user) {
          this.setState({user});
        } 
      }, (error) => {
        console.log(error);
      });

  }

  logout(){
    logout();
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  dropAccnt() {
    console.log('current user', this.state.user);
    let user = this.state.user;
    return (
      <Dropdown nav isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle className="nav-link dropdown-toggle mr-2">
            <img src={user.photoURL} className="img-avatar" alt={user.displayName}/>
            <span className="d-md-down-none">{user.displayName}</span>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={this.logout}><i className="fa fa-lock"></i> Salir</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    const {...attributes} = this.props;
    return (
      this.dropAccnt()
    );
  }
}

export default HeaderDropdown;
