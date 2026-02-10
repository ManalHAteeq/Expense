// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'; // For Firebase Authentication
import { getFirestore } from 'firebase/firestore'; // For Cloud Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxcBe0w-8A2Xu_2W636GRn73iC2P6X6HM",
  authDomain: "expense-8f366.firebaseapp.com",
  projectId: "expense-8f366",
  storageBucket: "expense-8f366.firebasestorage.app",
  messagingSenderId: "58228919464",
  appId: "1:58228919464:web:1f308ff020542e6a4c869d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);