// auth.js - FIXED VERSION
import { auth, db } from './firebase-config.js';
import { showLoader, showMessage } from './utils.js';
import { state } from './constants.js';

export function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Auth system ready - Firestore login');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showMessage('⚠️ User ID dan password harus diisi', 'error');
        return;
    }

    showLoader(true);
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.login(username, password);
        
        if (result.success) {
            console.log('✅ Login successful for:', username);
            state.currentUser = result.user;
            showMainApp();
            showMessage('✅ Login successful!', 'success');
        } else {
            showMessage(`❌ ${result.message}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('❌ Login gagal: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

function showMainApp() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    const userInfo = document.getElementById('userInfo');
    if (userInfo && state.currentUser) {
        userInfo.innerHTML = `🧑‍💻 <strong>${state.currentUser.name}</strong> | ${state.currentUser.teamName || state.currentUser.team}`;
    }
    
    if (state.currentUser.role === 'admin' || state.currentUser.role === 'super_admin') {
        document.getElementById('adminPanel').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        console.log('✅ Admin features enabled');
    }
    
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
        if (auth.currentUser) {
            await auth.signOut();
        }
        
        state.currentUser = null;
        
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