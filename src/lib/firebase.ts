// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, Timestamp, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User, type AuthError } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "gymflex-pass-fgz47",
  "appId": "1:601963160257:web:92c63d2f6b5546de072a40",
  "storageBucket": "gymflex-pass-fgz47.firebasestorage.app",
  "apiKey": "AIzaSyCmrOG6sFXRi_dH7FcuoD6WsDdzOO-7ak4",
  "authDomain": "gymflex-pass-fgz47.firebaseapp.com",
  "messagingSenderId": "601963160257"
};

// Initialize Firebase App
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

const app = getFirebaseApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { 
  app, 
  db, 
  auth, 
  storage,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  ref,
  getDownloadURL,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type AuthError
};
