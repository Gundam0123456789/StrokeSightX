// auth.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';      // Firestore
import { getDatabase } from 'firebase/database';         // Realtime DB

const firebaseConfig = {
  apiKey: "AIzaSyCxEsH9SW2g3lK5ZCckOWn0ZYi2SzDVGLQ",
  authDomain: "strokeaware-ff8c5.firebaseapp.com",
  projectId: "strokeaware-ff8c5",
  storageBucket: "strokeaware-ff8c5.appspot.com",
  messagingSenderId: "33287097753",
  appId: "1:33287097753:web:05951a37e7469a2183d708",
  measurementId: "G-QJ08L3V38S",
  databaseURL: "https://strokeaware-ff8c5-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);     // ✅ For Firestore
const rtdb = getDatabase(app);           // ✅ For Realtime Database

export {
  app,
  auth,
  firestore,     // use this for Firestore operations (collection, doc, etc.)
  rtdb           // use this for Realtime Database (ref, onValue, etc.)
};
