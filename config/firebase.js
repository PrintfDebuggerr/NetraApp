import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr34lxeDwj9xIqntfpKrtFx29gZ1mAPQk",
  authDomain: "netra-49c2c.firebaseapp.com",
  projectId: "netra-49c2c",
  storageBucket: "netra-49c2c.firebasestorage.app",
  messagingSenderId: "342525427220",
  appId: "1:342525427220:web:ff22e84c6ed5252731f101",
  measurementId: "G-MFQFD4GF14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication (without custom persistence for Expo Go compatibility)
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
