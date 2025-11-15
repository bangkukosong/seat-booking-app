// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js';

const firebaseConfig = {
    apiKey: "AIzaSyALdxLc87bsjCc4ZyQ_HWPuhE07p4jq54s",
    authDomain: "bangku-kosong.firebaseapp.com",
    projectId: "bangku-kosong",
    storageBucket: "bangku-kosong.firebasestorage.app",
    messagingSenderId: "802646179240",
    appId: "1:802646179240:web:de9f330d278a6ca49ff19d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log('🔥 Firebase Firestore initialized successfully!');