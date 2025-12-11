// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRugQ_jylyOUjrHa8b9wHH-OuUT3pyLa0",
  authDomain: "gwa-calculator-95248.firebaseapp.com",
  projectId: "gwa-calculator-95248",
  storageBucket: "gwa-calculator-95248.firebasestorage.app",
  messagingSenderId: "388253665956",
  appId: "1:388253665956:web:1bc6bda38485cdfac1b431",
  measurementId: "G-5VRB0K97E5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);