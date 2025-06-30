// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjdugOb3r6B2DPsg4fGMZ6RrTQjDKUKqQ",
  authDomain: "capstoneproject-hast.firebaseapp.com",
  projectId: "capstoneproject-hast",
  storageBucket: "capstoneproject-hast.firebasestorage.app",
  messagingSenderId: "831512899464",
  appId: "1:831512899464:web:dd19ff602a343b7f9b543d",
  measurementId: "G-Y059CVPGQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging }