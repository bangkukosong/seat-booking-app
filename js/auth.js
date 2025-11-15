// js/auth.js - CUSTOM AUTH WITH USER ID
import { db } from './firebase-config.js';
import { showLoader, showMessage } from './utils.js';
import { state } from './constants.js';

export function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Custom auth initialized');
    }
    
    // Check if user already logged in (from session)
    checkExistingAuth();
}

function checkExistingAuth() {
    // Check jika user sudah login sebelumnya (localStorage/session)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            state.currentUser = JSON.parse(savedUser);
            console.log('✅ User found in storage:', state.currentUser.username);
            showMainApp();
        } catch (error) {
            console.error('❌ Error loading saved user:', error);
            localStorage.removeItem('currentUser');
        }
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
        // ✅ CUSTOM AUTH: Check user di Firestore
        const userDoc = await db.collection('users').doc(username).get();
        
        if (!userDoc.exists) {
            showMessage('❌ User ID tidak ditemukan', 'error');
            return;
        }
        
        const userData = userDoc.data();
        
        // ✅ SIMPLE PASSWORD CHECK 
        // NOTE: Dalam production, gunakan proper hashing!
        if (userData.password !== password) {
            showMessage('❌ Password salah', 'error');
            return;
        }
        
        // ✅ SET MANUAL AUTH STATE
        state.currentUser = {
            username: username,
            name: userData.name,
            role: userData.role || 'user',
            email: userData.email || ''
        };
        
        // ✅ SAVE TO LOCALSTORAGE untuk persist session
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        
        console.log('✅ Custom login successful:', username);
        showMainApp();
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('❌ Login gagal: ' + error.message, 'error');
    } finally {
        showLoader(false);
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
window.logout = function() {
    // Clear state
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    
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
};