// js/firebase-config.js
import 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALdxLc87bsjCc4ZyQ_HWPuhE07p4jq54s",
    authDomain: "bangku-kosong.firebaseapp.com",
    projectId: "bangku-kosong",
    storageBucket: "bangku-kosong.firebasestorage.app",
    messagingSenderId: "802646179240",
    appId: "1:802646179240:web:de9f330d278a6ca49ff19d"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = firebase.firestore();

console.log('🔥 Firebase Firestore initialized successfully!');