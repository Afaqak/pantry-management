// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRUpE71QWiusYCiWOsr3RXxYKlF1bFUxo",
  authDomain: "pantry-man-19efd.firebaseapp.com",
  projectId: "pantry-man-19efd",
  storageBucket: "pantry-man-19efd.appspot.com",
  messagingSenderId: "856063597866",
  appId: "1:856063597866:web:b737de3cf64e3ff9e81253",
  measurementId: "G-S9Z0XVD11Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google: ", error);
  }
};

export { auth, signInWithGoogle };
