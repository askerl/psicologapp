import firebase from 'firebase';
import { firebaseConfig as config } from './config/firebaseConfig';
import { env } from './config/envs';

// Required for side-effects
require("firebase/firestore");

firebase.initializeApp(config[env]);

// Configure FirebaseUI.
export const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'redirect',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
        //firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // credentialHelper: firebaseui.auth.CredentialHelper.NONE
    callbacks: {
        signInSuccess: (currentUser) => {
            console.log('Sign in success', currentUser);            
            return true;
        }
    }
};
const settings = {timestampsInSnapshots: true};
const db = firebase.firestore();
export const auth = firebase.auth();

export const logout = () => {
    console.log('Logout...');
    auth.signOut().then(function() {
        // Sign-out successful.
        console.log('Sign out');
      }).catch(function(error) {
        // An error happened.
        console.log('Error signout');
      });
}

// Storage refs
// Points to the root reference
export const storageRef = firebase.storage().ref();
// Points to 'backup'
export const backupRef = storageRef.child('backup');

// apply settings
db.settings(settings);

export default db;