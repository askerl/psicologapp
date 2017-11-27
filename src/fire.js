import firebase from 'firebase';

// Required for side-effects
require("firebase/firestore");

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
    apiKey: "AIzaSyBP2hcETIRSFvvFhgMabmDZ-RjShqDlX70",
    authDomain: "psicologapp-84.firebaseapp.com",
    databaseURL: "https://psicologapp-84.firebaseio.com",
    projectId: "psicologapp-84",
    storageBucket: "psicologapp-84.appspot.com",
    messagingSenderId: "721791562259"
};
firebase.initializeApp(config);

let db = firebase.firestore();

export default db;