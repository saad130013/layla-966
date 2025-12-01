import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0OZWWkKrB4O3wVfCZgb5a7QELkOsdilw",
  authDomain: "layla-966.firebaseapp.com",
  projectId: "layla-966",
  storageBucket: "layla-966.firebasestorage.app",
  messagingSenderId: "646607727400",
  appId: "1:646607727400:web:14d624f85792d274293e1d",
  measurementId: "G-WRTHMQR3H8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
