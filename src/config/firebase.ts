import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration for videocalc-b1b43
// These are public configuration values, not sensitive data
const firebaseConfig = {
  apiKey: "AIzaSyAwhZEJ6byooK1gtlrNveZ-cSxK9a7kbg0",
  authDomain: "videocalc-b1b43.firebaseapp.com",
  projectId: "videocalc-b1b43",
  storageBucket: "videocalc-b1b43.firebasestorage.app",
  messagingSenderId: "1002679649212",
  appId: "1:1002679649212:web:ebdedfaa1962cb9b3921b9",
  measurementId: "G-NVD93E95GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;