// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp1ArYIENWpKLQyA99ohD0TGYcMvx4eAI",
  authDomain: "krishiyabhivruddhi.firebaseapp.com",
  projectId: "krishiyabhivruddhi",
  storageBucket: "krishiyabhivruddhi.firebasestorage.app",
  messagingSenderId: "943393963130",
  appId: "1:943393963130:web:77d1aacf5ff307330f0fc3",
  measurementId: "G-R7Y4JSRDD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
