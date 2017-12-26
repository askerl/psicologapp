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
        console.log('HEADER DROPDOWN - CURRENT USER', user);
        
        if (user) {
          this.setState({user});
          // User is signed in.
          var displayName = user.displayName;
          var email = user.email;
          var emailVerified = user.emailVerified;
          var photoURL = user.photoURL;
          var uid = user.uid;
          var phoneNumber = user.phoneNumber;
          var providerData = user.providerData;
          user.getIdToken().then((accessToken) => {
            // document.getElementById('sign-in-status').textContent = 'Signed in';
            // document.getElementById('sign-in').textContent = 'Sign out';
            // document.getElementById('account-details').textContent = JSON.stringify({
            //   displayName: displayName,
            //   email: email,
            //   emailVerified: emailVerified,
            //   phoneNumber: phoneNumber,
            //   photoURL: photoURL,
            //   uid: uid,
            //   accessToken: accessToken,
            //   providerData: providerData
            // }, null, '  ');
          });
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
        <DropdownToggle className="nav-link dropdown-toggle">
            <img src={user.photoURL} className="img-avatar" alt={user.displayName}/>
            <span className="d-md-down-none">{user.displayName}</span>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem onClick={this.logout}><i className="fa fa-lock"></i> Logout</DropdownItem>
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
