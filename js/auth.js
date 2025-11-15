// js/auth.js - FIREBASE SEAT BOOKING AUTH
import { auth, db } from './firebase-config.js';
import { showLoader, showMessage } from './utils.js';
import { state } from './constants.js';

export function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Firebase auth initialized');
    }
    
    // Check if user already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User sudah login, load user data
            loadUserData(user.email);
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        showMessage('⚠️ Email dan password harus diisi', 'error');
        return;
    }

    showLoader(true);
    try {
        // Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Firebase login successful:', email);
        
        // Load user data dari Firestore
        await loadUserData(email);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('❌ Login failed: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

async function loadUserData(email) {
    try {
        const userDoc = await db.collection('users').doc(email).get();
        if (userDoc.exists) {
            state.currentUser = {
                username: email,
                name: userDoc.data().name,
                role: userDoc.data().role || 'user'
            };
            console.log('✅ User data loaded:', state.currentUser);
            showMainApp();
        } else {
            showMessage('❌ User data not found in database', 'error');
            await auth.signOut(); // Logout jika data user tidak ada
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        showMessage('❌ Error loading user data', 'error');
    }
}

function showMainApp() {
    const loginContainer = document.getElementById('loginFormContainer');
    const mainApp = document.getElementById('mainApp');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Update user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo && state.currentUser) {
        userInfo.innerHTML = `🧑‍💻 <strong>${state.currentUser.name}</strong>`;
    }
    
    // Show admin panel jika admin
    if (state.currentUser && state.currentUser.role === 'admin') {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
            console.log('✅ Admin panel shown');
        }
        
        // Show admin-only buttons
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Initialize bookings system
    initializeBookingsSystem();
}

function initializeBookingsSystem() {
    import('./bookings.js').then(module => {
        if (module.initializeBookings) {
            module.initializeBookings();
            console.log('✅ Bookings system initialized');
        }
    }).catch(error => {
        console.error('❌ Bookings module error:', error);
    });
}

// Global logout function
window.logout = async function() {
    try {
        await auth.signOut();
        state.currentUser = null;
        
        const loginContainer = document.getElementById('loginFormContainer');
        const mainApp = document.getElementById('mainApp');
        
        if (loginContainer) loginContainer.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        
        // Clear form
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        console.log('✅ User logged out');
    } catch (error) {
        console.error('❌ Logout error:', error);
    }
};