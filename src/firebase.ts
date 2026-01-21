// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBf3_XJ8798_lJ7X-s-9Hcg9_9DQZzgOvQ",
  authDomain: "fbweb-f83e8.firebaseapp.com",
  projectId: "fbweb-f83e8",
  storageBucket: "fbweb-f83e8.firebasestorage.app",
  messagingSenderId: "20394254532",
  appId: "1:20394254532:web:dad1ae57a37fafc1712991",
  measurementId: "G-R1C7JSEK8J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };