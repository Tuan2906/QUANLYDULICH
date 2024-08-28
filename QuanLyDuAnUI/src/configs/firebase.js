// firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpIHafT7WfBaZg36iDnv2QEdiZSl7dx1k",
  authDomain: "roomrental-da167.firebaseapp.com",
  projectId: "roomrental-da167",
  storageBucket: "roomrental-da167.appspot.com",
  messagingSenderId: "1064998633608",
  appId: "1:1064998633608:web:ec2d05898446f4bb389f3d",
  measurementId: "G-6XZQ6YHY6S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db, collection, doc, onSnapshot, addDoc, serverTimestamp, getDocs };
