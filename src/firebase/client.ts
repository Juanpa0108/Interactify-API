// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA78jwHU5oujBwsn8pVnd89JI6yHGtvWms",
  authDomain: "proyecto3pi.firebaseapp.com",
  projectId: "proyecto3pi",
  storageBucket: "proyecto3pi.firebasestorage.app",
  messagingSenderId: "98785807246",
  appId: "1:98785807246:web:bffcddd0024dfdaff772df",
  measurementId: "G-WMBZ8VF906"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);