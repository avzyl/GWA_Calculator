// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore db
export const auth = getAuth(app);
export const db = getFirestore(app);