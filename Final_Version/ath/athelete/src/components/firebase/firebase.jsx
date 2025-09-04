// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import {getAuth, onAuthStateChanged} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUQz99bU9YdOQ5iQosyHWe0eoPx3m9HLs",
  authDomain: "media-a1608.firebaseapp.com",
  projectId: "media-a1608",
  storageBucket: "media-a1608.firebasestorage.app",
  messagingSenderId: "648560997289",
  appId: "1:648560997289:web:1c7a84fef597fbf083cab8"
};

const app = initializeApp(firebaseConfig);
const auth= getAuth(app);
const db= getFirestore(app);
export{ auth, db, onAuthStateChanged, doc, setDoc, getDoc};