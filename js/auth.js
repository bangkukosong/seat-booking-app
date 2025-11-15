// js/auth.js - UPDATED FOR STATE OBJECT
import { optimizedPost } from './api-manager.js';
import { showLoader, showMessage } from './utils.js';
import { initializeBookings } from './bookings.js';
import { initializeAdmin } from './admin.js';
import { initializeUser } from './user.js';
import { state } from './constants.js'; // ✅ IMPORT STATE

export function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        document.getElementById('loginMessage').innerText = '⚠️ User ID dan password harus diisi';
        return;
    }

    showLoader(true);
    try {
        const result = await optimizedPost('login', { username, password });
        showLoader(false);

        if (result.success && result.user) {
            // ✅ FIX: Assign to state object
            state.currentUser = result.user;
            showMainApp();
        } else {
            document.getElementById('loginMessage').innerText = result.message || 'Login gagal';
        }
    } catch (error) {
        showLoader(false);
        document.getElementById('loginMessage').innerText = '❌ Error connecting to server';
    }
}

async function showMainApp() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userInfo').innerHTML = `🧑‍💻 <strong>${state.currentUser.name}</strong>`;

    // Initialize all modules
    initializeBookings();
    initializeAdmin();
    initializeUser();
    
    showLoader(false);
}

export function logout() {
    state.currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    import('./api-manager.js').then(({ clearCache }) => {
        clearCache();
    });
}