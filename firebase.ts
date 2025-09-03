// Import the functions you need from the SDKs you need
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhCeDhFlFejwc2U_zQr6QVWEx99obMQQ0",
  authDomain: "daily-reflection-8068b.firebaseapp.com",
  projectId: "daily-reflection-8068b",
  storageBucket: "daily-reflection-8068b.firebasestorage.app",
  messagingSenderId: "1036913703735",
  appId: "1:1036913703735:web:07244933ca37d1d7da38b2",
  measurementId: "G-ZE0C5LY022"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
