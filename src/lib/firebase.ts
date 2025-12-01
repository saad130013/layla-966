import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBchN2Wd5vRzSHDQ0BN7d9Am6s43wS1xCY",
  authDomain: "inspectionssys-a764d.firebaseapp.com",
  projectId: "inspectionssys-a764d",
  storageBucket: "inspectionssys-a764d.appspot.com",
  messagingSenderId: "823282027878",
  appId: "1:823282027878:web:aa55ef272af33821df88ca7",
  measurementId: "G-099GCJHKBD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
