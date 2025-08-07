// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-FbS6rYbFInUkgNXZGGhk9GOyUPPVk_w",
  authDomain: "conecta-mentor-8b174.firebaseapp.com",
  projectId: "conecta-mentor-8b174",
  storageBucket: "conecta-mentor-8b174.firebasestorage.app",
  messagingSenderId: "661984344312",
  appId: "1:661984344312:web:e9b11158ece185c7e6e30d",
  measurementId: "G-T7H3B7DL8C"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
