// js/admin.js
import { currentUser } from './constants.js';
import { optimizedPost } from './api-manager.js';
import { showMessage, showLoader } from './utils.js';

export function initializeAdmin() {
    if (currentUser.role === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        
        setupAdminEventListeners();
    }
}

function setupAdminEventListeners() {
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
}

// Admin Functions
export function showAddUserForm() {
    document.getElementById('addUserFormContainer').style.display = 'block';
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserMessage').innerHTML = '';
}

export function hideAddUserForm() {
    document.getElementById('addUserFormContainer').style.display = 'none';
}

async function handleAddUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('newUserUsername').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    
    if (!username || !password || !name) {
        showAddUserMessage('❌ All fields are required', 'error');
        return;
    }
    
    try {
        showAddUserMessage('⏳ Adding user...', 'info');
        
        const result = await optimizedPost('addUser', { 
            username, 
            password, 
            name, 
            role 
        });
        
        if (result.success) {
            showAddUserMessage('✅ User added successfully!', 'success');
            setTimeout(() => {
                hideAddUserForm();
                showMessage('✅ User added successfully', 'success');
            }, 1500);
        } else {
            showAddUserMessage(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Add User Error:', error);
        showAddUserMessage('❌ Error adding user. Please try again.', 'error');
    }
}

function showAddUserMessage(text, type) {
    const messageEl = document.getElementById('addUserMessage');
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

export function showUserManagement() {
    showMessage('👥 User management feature coming soon...', 'info');
}

export function showAllBookings() {
    showMessage('📊 All bookings feature coming soon...', 'info');
}