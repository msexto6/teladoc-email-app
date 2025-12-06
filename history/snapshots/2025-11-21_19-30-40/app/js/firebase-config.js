// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDYP04SNmOnFX5gq_HNE1UebZ4z3b-VCE",
    authDomain: "teladoc-email-app.firebaseapp.com",
    projectId: "teladoc-email-app",
    storageBucket: "teladoc-email-app.firebasestorage.app",
    messagingSenderId: "825418975588",
    appId: "1:825418975588:web:df034405304d6482ee9271"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firestore and Storage
const db = firebase.firestore();
const storage = firebase.storage();

console.log('✓ Firebase initialized successfully');
console.log('✓ Firestore ready');
console.log('✓ Storage ready');
