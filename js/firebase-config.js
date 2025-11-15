// js/firebase-config.js - PASTI WORK VERSION
import 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js';
import 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyALdxLc87bsjCc4ZyQ_HWPuhE07p4jq54s",
    authDomain: "bangku-kosong.firebaseapp.com",
    projectId: "bangku-kosong",
    storageBucket: "bangku-kosong.firebasestorage.app",
    messagingSenderId: "802646179240",
    appId: "1:802646179240:web:de9f330d278a6ca49ff19d"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export services
const db = firebase.firestore();
const auth = firebase.auth();

// ✅ EKSPOR EXPLICIT
export { db, auth };

console.log('🔥 Firebase Auth & Firestore exported successfully!');