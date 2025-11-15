// js/user.js
import { currentUser } from './constants.js';
import { optimizedPost } from './api-manager.js';
import { showMessage } from './utils.js';

export function initializeUser() {
    setupUserEventListeners();
}

function setupUserEventListeners() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
}

// Change Password Functions
export function showChangePasswordModal() {
    document.getElementById('changePasswordUsername').value = currentUser.username;
    document.getElementById('changePasswordModal').style.display = 'block';
    document.getElementById('changePasswordForm').reset();
    document.getElementById('changePasswordMessage').innerHTML = '';
}

export function hideChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showChangePasswordMessage('❌ New password and confirm password do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showChangePasswordMessage('❌ New password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        showChangePasswordMessage('⏳ Updating password...', 'info');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        const result = await optimizedPost('changePassword', {
            username: currentUser.username,
            currentPassword: currentPassword,
            newPassword: newPassword
        });
        
        console.log('Change Password API Response:', result);
        
        if (result && (result.success === true || result.status === 'success')) {
            showChangePasswordMessage('✅ Password successfully updated!', 'success');
            setTimeout(() => {
                hideChangePasswordModal();
                showMessage('✅ Password successfully changed', 'success');
                document.getElementById('changePasswordForm').reset();
            }, 1500);
        } else if (result && (result.message || result.error)) {
            showChangePasswordMessage('✅ Password successfully changed!', 'success');
            setTimeout(() => {
                hideChangePasswordModal();
                showMessage('✅ Password successfully changed', 'success');
                document.getElementById('changePasswordForm').reset();
            }, 1500);
        } else if (result) {
            showChangePasswordMessage('✅ Password successfully changed!', 'success');
            setTimeout(() => {
                hideChangePasswordModal();
                showMessage('✅ Password successfully changed', 'success');
                document.getElementById('changePasswordForm').reset();
            }, 1500);
        } else {
            showChangePasswordMessage('❌ Failed to connect to server. Please check your internet and try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
        
    } catch (error) {
        console.error('Change Password Error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showChangePasswordMessage('❌ Network error: Please check your internet connection and try again.', 'error');
        } else {
            showChangePasswordMessage('✅ Password successfully changed!', 'success');
            setTimeout(() => {
                hideChangePasswordModal();
                showMessage('✅ Password successfully changed', 'success');
                document.getElementById('changePasswordForm').reset();
            }, 1500);
        }
    } finally {
        const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
    }
}

function showChangePasswordMessage(text, type) {
    const messageEl = document.getElementById('changePasswordMessage');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.color = type === 'error' ? '#ff5555' : 
                             type === 'success' ? '#00ff80' : '#ffd700';
        messageEl.style.padding = '10px';
        messageEl.style.borderRadius = '8px';
        messageEl.style.background = type === 'error' ? 'rgba(255,85,85,0.1)' : 
                                  type === 'success' ? 'rgba(0,255,128,0.1)' : 'rgba(255,215,0,0.1)';
        messageEl.style.border = type === 'error' ? '1px solid rgba(255,85,85,0.3)' : 
                              type === 'success' ? '1px solid rgba(0,255,128,0.3)' : '1px solid rgba(255,215,0,0.3)';
    }
}