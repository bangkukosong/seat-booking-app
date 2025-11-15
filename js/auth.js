// js/auth.js - FINAL VERSION (Simple User ID Login)
import { auth, db } from './firebase-config.js';
import { showLoader, showMessage } from './utils.js';
import { state } from './constants.js';

export function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Auth system ready - User ID login');
    }
    
    // Check if user already logged in
    auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            console.log('✅ Auto-login detected:', firebaseUser.email);
            await loadUserData(firebaseUser.email);
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const userId = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!userId || !password) {
        showMessage('⚠️ User ID dan password harus diisi', 'error');
        return;
    }

    showLoader(true);
    try {
        // ✅ AUTO-CONVERT: "dendy" → "dendy@bangkukosong.internal"
        const email = `${userId}@bangkukosong.internal`;
        console.log('🔄 Converting User ID to email:', email);
        
        // ✅ Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login successful for:', userId);
        
        // ✅ Load user profile data
        await loadUserData(email);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // ✅ User-friendly error messages in Bahasa
        if (error.code === 'auth/user-not-found') {
            showMessage('❌ User ID tidak ditemukan', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showMessage('❌ Password salah', 'error');
        } else if (error.code === 'auth/too-many-requests') {
            showMessage('❌ Terlalu banyak percobaan gagal. Coba lagi nanti.', 'error');
        } else if (error.code === 'auth/network-request-failed') {
            showMessage('❌ Gagal terhubung ke server. Cek koneksi internet.', 'error');
        } else {
            showMessage('❌ Login gagal: ' + error.message, 'error');
        }
    } finally {
        showLoader(false);
    }
}

async function loadUserData(email) {
    try {
        // ✅ Load additional user data dari Firestore
        const userDoc = await db.collection('users').doc(email).get();
        const userId = email.split('@')[0]; // "dendy"
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            state.currentUser = {
                userId: userId, // "dendy"
                email: email,   // "dendy@bangkukosong.internal"  
                name: userData.name || userId,
                role: userData.role || 'user',
                firebaseUID: auth.currentUser.uid
            };
        } else {
            // ✅ Create default user profile jika belum ada
            state.currentUser = {
                userId: userId,
                email: email,
                name: userId, // Default name sama dengan User ID
                role: 'user',
                firebaseUID: auth.currentUser.uid
            };
            
            // Save ke Firestore untuk pertama kali
            await db.collection('users').doc(email).set({
                name: userId,
                email: email,
                role: 'user',
                createdAt: new Date(),
                firebaseUID: auth.currentUser.uid
            });
        }
        
        console.log('✅ User profile loaded:', state.currentUser.name);
        showMainApp();
        
    } catch (error) {
        console.error('❌ Error loading user profile:', error);
        showMessage('❌ Error memuat profil user', 'error');
    }
}

function showMainApp() {
    // Hide login, show main app
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Update user info display
    const userInfo = document.getElementById('userInfo');
    if (userInfo && state.currentUser) {
        userInfo.innerHTML = `🧑‍💻 <strong>${state.currentUser.name}</strong>`;
    }
    
    // Show admin features jika admin
    if (state.currentUser.role === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        console.log('✅ Admin features enabled');
    }
    
    // Initialize bookings system
    initializeBookingsSystem();
}

function initializeBookingsSystem() {
    import('./bookings.js').then(module => {
        if (module.initializeBookings) {
            module.initializeBookings();
            console.log('✅ Bookings system started');
        }
    });
}

// Global logout function
window.logout = async function() {
    try {
        await auth.signOut();
        state.currentUser = null;
        
        // Reset UI
        document.getElementById('loginFormContainer').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        console.log('✅ Logout successful');
        showMessage('👋 Berhasil logout', 'success');
    } catch (error) {
        console.error('❌ Logout error:', error);
        showMessage('❌ Gagal logout', 'error');
    }
};