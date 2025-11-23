// js/firebase-config.js - PASTI WORK VERSION
// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAaD_5QxFFWOmOV1h_YewvRVxR0UlQFK_4",
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
