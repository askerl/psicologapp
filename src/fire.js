import firebase from 'firebase';
import firebaseui from 'firebaseui';

// Required for side-effects
require("firebase/firestore");

var configPROD = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: "AIzaSyBP2hcETIRSFvvFhgMabmDZ-RjShqDlX70",
    authDomain: "psicologapp-84.firebaseapp.com",
    databaseURL: "https://psicologapp-84.firebaseio.com",
    projectId: "psicologapp-84",
    storageBucket: "psicologapp-84.appspot.com",
    messagingSenderId: "721791562259"
};

var configTESTING = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: 'AIzaSyDVbWeM5isevTOPK5TEyGjCZlZqulVUjJQ',
    authDomain: 'psicologapp-testing.firebaseapp.com',
    databaseURL: 'https://psicologapp-testing.firebaseio.com',
    projectId: 'psicologapp-testing',
    storageBucket: 'psicologapp-testing.appspot.com',
    messagingSenderId: '236252094290',
};

firebase.initializeApp(configTESTING);

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
let auxAuth = firebase.auth();
auxAuth.languageCode = 'es';
export const auth = auxAuth;


export const logout = () => {
    console.log('Logout...');
    auxAuth.signOut().then(function() {
        // Sign-out successful.
        console.log('Sign out');
      }).catch(function(error) {
        // An error happened.
        console.log('Error signout');
      });

}

db.settings(settings);

export default db;