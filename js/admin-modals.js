// admin-modals.js - COMPLETE FIXED VERSION v4.4
// WITH DELETE USER MODAL & ENHANCED FEATURES
import { showMessage } from './utils.js';

// ==================== GLOBAL VARIABLES ====================
let userSortState = { field: 'index', direction: 'asc' };
let bookingSortState = { field: 'index', direction: 'desc' };
let currentModal = null;

// ==================== MODAL CONTROLS ====================
window.hideAdminModal = function() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.remove();
        currentModal = null;
    }
}

// Close modal when clicking outside
function setupModalClose() {
    setTimeout(() => {
        const overlay = document.querySelector('.admin-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    hideAdminModal();
                }
            });
        }
    }, 100);
}

// ==================== DELETE USER MODAL ====================
export function showDeleteUserModal(user) {
    console.log('🎯 Showing delete user modal for:', user.username);
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'admin-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="admin-modal-content" style="max-width: 500px;">
            <div class="admin-modal-header">
                <h3 class="admin-modal-title">🗑️ Delete User</h3>
                <button class="admin-close-btn">&times;</button>
            </div>
            
            <div class="admin-message warning">
                ⚠️ You are about to permanently delete a user account.
            </div>
            
            <div style="background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: #ff4444; margin-bottom: 10px;">🚨 DANGER ZONE</h4>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 8px;">
                    This action will <strong>PERMANENTLY DELETE</strong>:
                </p>
                <ul style="color: rgba(255,255,255,0.8); margin-left: 20px; margin-bottom: 10px;">
                    <li>User account: <strong>${user.username}</strong></li>
                    <li>All associated bookings (active & cancelled)</li>
                    <li>User preferences and settings</li>
                </ul>
                <p style="color: #ff6b6b; font-weight: 600;">
                    This action cannot be undone!
                </p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <h4 style="color: var(--gold); margin-bottom: 10px;">📊 User Information</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <strong>Username:</strong><br>
                        <span style="color: rgba(255,255,255,0.9);">${user.username}</span>
                    </div>
                    <div>
                        <strong>Full Name:</strong><br>
                        <span style="color: rgba(255,255,255,0.9);">${user.name}</span>
                    </div>
                    <div>
                        <strong>Role:</strong><br>
                        <span style="color: rgba(255,255,255,0.9);">${user.role}</span>
                    </div>
                    <div>
                        <strong>Team:</strong><br>
                        <span style="color: rgba(255,255,255,0.9);">${user.teamName || 'No team'}</span>
                    </div>
                </div>
            </div>
            
            <div class="delete-options" style="margin-bottom: 20px;">
                <h4 style="color: var(--gold); margin-bottom: 10px;">🗑️ Delete Options</h4>
                <div class="option-group">
                    <div class="option-label">
                        <input type="radio" id="deleteUserAndBookings" name="deleteOption" value="deleteAll" checked>
                        <label for="deleteUserAndBookings">Delete User + All Bookings (PERMANENT)</label>
                    </div>
                    <div class="option-label">
                        <input type="radio" id="deleteBookingsOnly" name="deleteOption" value="deleteBookings">
                        <label for="deleteBookingsOnly">Delete User's Bookings Only (Keep User)</label>
                    </div>
                    <div class="option-label">
                        <input type="radio" id="cancelBookingsOnly" name="deleteOption" value="cancelOnly">
                        <label for="cancelBookingsOnly">Cancel Active Bookings Only (Safe)</label>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.9);">
                    🔍 Confirm username to delete:
                </label>
                <input type="text" id="confirmUsername" class="form-control" 
                       placeholder="Type the username to confirm" 
                       style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3);">
            </div>
            
            <div class="admin-btn-group">
                <button class="admin-btn admin-btn-secondary" id="cancelDeleteBtn">
                    ❌ Cancel
                </button>
                <button class="admin-btn admin-btn-danger" id="confirmDeleteBtn" disabled>
                    🗑️ Delete User
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Event handlers
    const closeBtn = modalOverlay.querySelector('.admin-close-btn');
    const cancelBtn = modalOverlay.querySelector('#cancelDeleteBtn');
    const confirmBtn = modalOverlay.querySelector('#confirmDeleteBtn');
    const confirmInput = modalOverlay.querySelector('#confirmUsername');

    // Close modal functions
    const closeModal = () => {
        modalOverlay.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Confirm username input
    confirmInput.addEventListener('input', (e) => {
        const isConfirmed = e.target.value === user.username;
        confirmBtn.disabled = !isConfirmed;
        
        if (isConfirmed) {
            confirmInput.style.borderColor = '#00ff80';
            confirmInput.style.background = 'rgba(0, 255, 128, 0.1)';
        } else {
            confirmInput.style.borderColor = '#ff4444';
            confirmInput.style.background = 'rgba(255, 68, 68, 0.1)';
        }
    });

    // Confirm delete action
    confirmBtn.addEventListener('click', async () => {
        if (confirmInput.value !== user.username) {
            showMessage('❌ Username confirmation does not match', 'error');
            return;
        }

        const deleteOption = modalOverlay.querySelector('input[name="deleteOption"]:checked').value;
        
        // Disable button and show loading
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '⏳ Deleting...';
        
        try {
            const { FirestoreAPI } = await import('./firestore-api.js');
            let result;
            
            switch (deleteOption) {
                case 'deleteAll':
                    result = await FirestoreAPI.deleteUser(user.username);
                    break;
                    
                case 'deleteBookings':
                    result = await FirestoreAPI.deleteUserBookingsPermanently(user.username);
                    break;
                    
                case 'cancelOnly':
                    result = await FirestoreAPI.cancelAllUserBookings(user.username);
                    break;
            }
            
            if (result.success) {
                showMessage(`✅ ${result.message}`, 'success');
                closeModal();
                
                // Refresh user management modal if it exists
                const userManagementModal = document.querySelector('.admin-modal-overlay');
                if (userManagementModal) {
                    userManagementModal.remove();
                    setTimeout(() => window.showUserManagement(), 500);
                }
            } else {
                showMessage(`❌ ${result.message}`, 'error');
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '🗑️ Delete User';
            }
            
        } catch (error) {
            console.error('Delete user error:', error);
            showMessage('❌ Error deleting user: ' + error.message, 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '🗑️ Delete User';
        }
    });

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// ==================== ADDITIONAL DELETE FUNCTIONS ====================
// Add these to FirestoreAPI class
window.FirestoreAPI = window.FirestoreAPI || {};

// Cancel all active bookings for a user
FirestoreAPI.cancelAllUserBookings = async function(username) {
    try {
        const snapshot = await db.collection('bookings')
            .where('userName', '==', username)
            .where('status', '==', 'active')
            .get();

        const cancelPromises = [];
        snapshot.forEach(doc => {
            const booking = doc.data();
            cancelPromises.push(
                db.collection('bookings').doc(doc.id).update({
                    status: "cancelled",
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
        });

        await Promise.all(cancelPromises);
        
        return { 
            success: true, 
            message: `${snapshot.size} active bookings cancelled for ${username}` 
        };
    } catch (error) {
        console.error('Cancel all bookings error:', error);
        return { success: false, message: error.message };
    }
};

// Delete user bookings permanently
FirestoreAPI.deleteUserBookingsPermanently = async function(username) {
    try {
        const snapshot = await db.collection('bookings')
            .where('userName', '==', username)
            .get();

        const deletePromises = [];
        snapshot.forEach(doc => {
            deletePromises.push(db.collection('bookings').doc(doc.id).delete());
        });

        await Promise.all(deletePromises);
        
        return { 
            success: true, 
            message: `${snapshot.size} bookings permanently deleted for ${username}` 
        };
    } catch (error) {
        console.error('Delete user bookings error:', error);
        return { success: false, message: error.message };
    }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================
function sortUsers(field) {
    if (userSortState.field === field) {
        userSortState.direction = userSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        userSortState.field = field;
        userSortState.direction = 'asc';
    }
    
    const sortedUsers = [...window.currentUsersData].sort((a, b) => {
        let aValue, bValue;
        
        switch(field) {
            case 'username':
                aValue = a.username.toLowerCase();
                bValue = b.username.toLowerCase();
                break;
            case 'team':
                aValue = a.teamId || '';
                bValue = b.teamId || '';
                break;
            case 'role':
                aValue = a.role;
                bValue = b.role;
                break;
            case 'status':
                aValue = isUserActive(a.lastLogin) ? 1 : 0;
                bValue = isUserActive(b.lastLogin) ? 1 : 0;
                break;
            case 'lastLogin':
                // ✅ SORT BERDASARKAN LAST LOGIN DATE
                aValue = a.lastLogin?.toDate?.() || a.lastLogin || new Date(0);
                bValue = b.lastLogin?.toDate?.() || b.lastLogin || new Date(0);
                break;
            default:
                aValue = window.currentUsersData.indexOf(a);
                bValue = window.currentUsersData.indexOf(b);
        }
        
        if (aValue < bValue) return userSortState.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return userSortState.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateUsersTable(sortedUsers);
    updateUserSortIndicators(field, userSortState.direction);
}

function updateUserSortIndicators(field, direction) {
    // Reset semua header
    document.querySelectorAll('.admin-table th').forEach(th => {
        const originalText = th.getAttribute('data-original') || th.textContent.replace(/ ▲| ▼/, '');
        th.textContent = originalText;
        th.setAttribute('data-original', originalText);
    });
    
    // Update header yang aktif
    const activeHeader = document.querySelector(`th[onclick="sortUsers('${field}')"]`);
    if (activeHeader) {
        const originalText = activeHeader.getAttribute('data-original') || activeHeader.textContent;
        const arrow = direction === 'asc' ? ' ▲' : ' ▼';
        activeHeader.textContent = originalText + arrow;
    }
}

function updateBookingSortIndicators(field, direction) {
    // Reset semua header
    document.querySelectorAll('.admin-table th').forEach(th => {
        const originalText = th.getAttribute('data-original') || th.textContent.replace(/ ▲| ▼/, '');
        th.textContent = originalText;
        th.setAttribute('data-original', originalText);
    });
    
    // Update header yang aktif
    const activeHeader = document.querySelector(`th[onclick="sortBookings('${field}')"]`);
    if (activeHeader) {
        const originalText = activeHeader.getAttribute('data-original') || activeHeader.textContent;
        const arrow = direction === 'asc' ? ' ▲' : ' ▼';
        activeHeader.textContent = originalText + arrow;
    }
}

function performUserSearch() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filterValue = document.getElementById('userFilter').value;
    
    const filteredUsers = window.currentUsersData.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) || 
                             (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                             (user.teamId && user.teamId.toLowerCase().includes(searchTerm));
        
        let matchesFilter = true;
        switch(filterValue) {
            case 'active':
                matchesFilter = user.isActive;
                break;
            case 'inactive':
                matchesFilter = !user.isActive;
                break;
            case 'admin':
                matchesFilter = user.role === 'admin' || user.role === 'super_admin';
                break;
            case 'user':
                matchesFilter = user.role === 'user';
                break;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    updateUsersTable(filteredUsers);
}

// ==================== USER MANAGEMENT FUNCTIONS ====================
function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const countInfo = document.getElementById('userCountInfo');
    
    console.log('🔄 updateUsersTable called with:', users.length, 'users');
    
    if (tbody) {
        tbody.innerHTML = users.map((user, index) => {
            // DEBUG: Log setiap user data
            console.log(`👤 User ${index + 1}:`, {
                username: user.username,
                lastLogin: user.lastLogin,
                lastLoginType: typeof user.lastLogin
            });
            
            const lastLoginDate = user.lastLogin;
            const isActive = isUserActive(lastLoginDate);
            const lastLoginDisplay = formatLastLogin(lastLoginDate);
            
            console.log(`✅ Processed ${user.username}:`, {
                isActive,
                lastLoginDisplay
            });
            
            return `
                <tr data-userid="${user.id}" data-username="${user.username}" data-team="${user.teamId}" data-role="${user.role}" data-status="${isActive ? 'active' : 'inactive'}">
                    <td>${index + 1}</td>
                    <td>
                        <div style="font-weight: 600;">${user.username}</div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${user.name || 'No name'}</div>
                    </td>
                    <td>
                        <select class="admin-select team-select" 
                                data-userid="${user.id}" 
                                data-username="${user.username}">
                            <option value="">Select Team</option>
                            <option value="ITPM" ${user.teamId === 'ITPM' ? 'selected' : ''}>ITPM</option>
                            <option value="CM" ${user.teamId === 'CM' ? 'selected' : ''}>CM</option>
                            <option value="R&C" ${user.teamId === 'R&C' ? 'selected' : ''}>R&C</option>
                            <option value="CTM" ${user.teamId === 'CTM' ? 'selected' : ''}>CTM</option>
                            <option value="CISO" ${user.teamId === 'CISO' ? 'selected' : ''}>CISO</option>
                            <option value="OTS" ${user.teamId === 'OTS' ? 'selected' : ''}>OTS</option>
                            <option value="CTOO" ${user.teamId === 'CTOO' ? 'selected' : ''}>CTOO</option>
                            <option value="NFRR" ${user.teamId === 'NFRR' ? 'selected' : ''}>NFRR</option>
                            <option value="Resilience" ${user.teamId === 'Resilience' ? 'selected' : ''}>Resilience</option>
                            <option value="PSS" ${user.teamId === 'PSS' ? 'selected' : ''}>PSS</option>
                            <option value="BIFAST" ${user.teamId === 'BIFAST' ? 'selected' : ''}>BI Fast</option>
                            <option value="ET" ${user.teamId === 'ET' ? 'selected' : ''}>ET</option>
                            <option value="EUS" ${user.teamId === 'EUS' ? 'selected' : ''}>EUS</option>
                        </select>
                    </td>
                    <td>
                        <select class="admin-select role-select" 
                                data-userid="${user.id}" 
                                data-username="${user.username}">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            ${user.role === 'super_admin' ? '<option value="super_admin" selected>Super Admin</option>' : ''}
                        </select>
                    </td>
                    <td>
                        <span class="admin-status-badge ${isActive ? 'admin-status-active' : 'admin-status-inactive'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td style="color: rgba(255,255,255,0.7); font-size: 0.85rem; text-align: center;">
                        ${lastLoginDisplay}
                    </td>
                    <td>
                        <div class="admin-action-buttons">
                            <button class="admin-btn-action admin-btn-reset" 
                                    onclick="adminResetPassword('${user.username}')"
                                    title="Reset Password">
                                🔑
                            </button>
                            <button class="admin-btn-action ${isActive ? 'admin-btn-disable' : 'admin-btn-enable'}" 
                                    onclick="admin${isActive ? 'Deactivate' : 'Activate'}User('${user.id}', '${user.username}')"
                                    title="${isActive ? 'Deactivate' : 'Activate'}">
                                ${isActive ? '❌' : '✅'}
                            </button>
                            <button class="admin-btn-action admin-btn-delete" 
                                    onclick="showDeleteUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})"
                                    title="Delete User" 
                                    ${user.role === 'super_admin' ? 'disabled' : ''}
                                    style="${user.role === 'super_admin' ? 'opacity: 0.3; cursor: not-allowed;' : ''}">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    if (countInfo) {
        countInfo.textContent = `Showing ${users.length} users`;
    }
    
    attachAdminModalEvents();
}

// ✅ TAMBAHIN 2 HELPER FUNCTION INI di bagian yang tepat
function isUserActive(lastLoginData) {
    if (!lastLoginData) return false;
    
    try {
        let date;
        
        if (lastLoginData.toDate && typeof lastLoginData.toDate === 'function') {
            date = lastLoginData.toDate();
        } else if (lastLoginData instanceof Date) {
            date = lastLoginData;
        } else {
            return false;
        }
        
        if (isNaN(date.getTime())) return false;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return date >= thirtyDaysAgo;
        
    } catch (error) {
        console.error('isUserActive error:', error);
        return false;
    }
}

function formatLastLogin(lastLoginData) {
    if (!lastLoginData) {
        return '<span style="color: rgba(255,255,255,0.4);">Never</span>';
    }
    
    try {
        let date;
        
        // Handle Firestore Timestamp
        if (lastLoginData.toDate && typeof lastLoginData.toDate === 'function') {
            date = lastLoginData.toDate();
        } 
        // Handle Date object
        else if (lastLoginData instanceof Date) {
            date = lastLoginData;
        }
        // Fallback
        else {
            return '<span style="color: rgba(255,255,255,0.4);">Unknown</span>';
        }
        
        // Check if valid date
        if (isNaN(date.getTime())) {
            return '<span style="color: rgba(255,255,255,0.4);">Invalid</span>';
        }
        
        // ✅ FORMAT TANGGAL SINGKAT: MM/DD/YY
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        
        return `${month}/${day}/${year}`;
        
    } catch (error) {
        console.error('formatLastLogin error:', error);
        return '<span style="color: rgba(255,255,255,0.4);">Error</span>';
    }
}

function clearUserSearch() {
    document.getElementById('userSearch').value = '';
    document.getElementById('userFilter').value = 'all';
    performUserSearch();
}

// ==================== BOOKINGS MANAGEMENT FUNCTIONS ====================
function sortBookings(field) {
    if (bookingSortState.field === field) {
        bookingSortState.direction = bookingSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        bookingSortState.field = field;
        bookingSortState.direction = 'desc';
    }
    
    const sortedBookings = [...window.currentBookingsData].sort((a, b) => {
        let aValue, bValue;
        
        switch(field) {
            case 'date':
                aValue = a.bookingDate || '';
                bValue = b.bookingDate || '';
                break;
            case 'user':
                aValue = a.userName.toLowerCase();
                bValue = b.userName.toLowerCase();
                break;
            case 'seat':
                aValue = a.seat;
                bValue = b.seat;
                break;
            case 'team':
                aValue = a.userTeam || '';
                bValue = b.userTeam || '';
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            default:
                const aTime = a.bookingTime?.toDate?.() || a.timestamp || a.createdAt;
                const bTime = b.bookingTime?.toDate?.() || b.timestamp || b.createdAt;
                aValue = new Date(aTime).getTime();
                bValue = new Date(bTime).getTime();
        }
        
        if (aValue < bValue) return bookingSortState.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return bookingSortState.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    window.currentBookingsData = sortedBookings;
    performBookingSearch();
    updateBookingSortIndicators(field, bookingSortState.direction);
}

function performBookingSearch() {
    const searchTerm = document.getElementById('bookingSearch').value.toLowerCase();
    const filterValue = document.getElementById('bookingFilter').value;
    const today = new Date().toISOString().split('T')[0];
    
    const filteredBookings = window.currentBookingsData.filter(booking => {
        const matchesSearch = booking.userName.toLowerCase().includes(searchTerm) || 
                             booking.seat.toLowerCase().includes(searchTerm) ||
                             (booking.userTeam && booking.userTeam.toLowerCase().includes(searchTerm));
        
        let matchesFilter = true;
        switch(filterValue) {
            case 'active':
                matchesFilter = booking.status === 'active';
                break;
            case 'cancelled':
                matchesFilter = booking.status === 'cancelled';
                break;
            case 'today':
                matchesFilter = booking.bookingDate === today;
                break;
            case 'future':
                matchesFilter = booking.bookingDate >= today;
                break;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    updateBookingsTable(filteredBookings);
}

function updateBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    const countInfo = document.getElementById('bookingCountInfo');
    
    if (tbody) {
        tbody.innerHTML = bookings.map((booking, index) => {
            const bookingTime = booking.bookingTime?.toDate?.() || 
                              booking.timestamp ? new Date(booking.timestamp) : 
                              booking.createdAt?.toDate?.() || new Date();
            const timeDisplay = bookingTime.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const today = new Date().toISOString().split('T')[0];
            const isFuture = booking.bookingDate >= today;
            const canCancel = booking.status === 'active' && isFuture;
            
            return `
                <tr data-bookingid="${booking.id}" data-date="${booking.bookingDate}" data-user="${booking.userName}" data-seat="${booking.seat}" data-team="${booking.userTeam}" data-status="${booking.status}" data-future="${isFuture}">
                    <td class="checkbox-cell">
                        ${canCancel ? `
                            <input type="checkbox" class="booking-selection-checkbox" 
                                   data-bookingid="${booking.id}"
                                   data-user="${booking.userName}"
                                   data-seat="${booking.seat}" 
                                   data-date="${booking.bookingDate}"
                                   onchange="updateBulkSelectionUI()">
                        ` : ''}
                    </td>
                    <td class="index-cell">${index + 1}</td>
                    <td>
                        <div style="font-weight: 600;">${booking.bookingDate || 'Unknown'}</div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                            ${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                    </td>
                    <td>${booking.userName}</td>
                    <td>
                        <span style="font-weight: 600; color: var(--gold);">${booking.seat}</span>
                    </td>
                    <td>
                        <span style="color: rgba(255,255,255,0.8);">${booking.userTeam || 'N/A'}</span>
                    </td>
                    <td>
                        <span class="admin-status-badge ${booking.status === 'active' ? 'admin-status-active' : 'admin-status-cancelled'}">
                            ${booking.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                    </td>
                    <td style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                        ${timeDisplay}
                    </td>
                    <td>
                        <div class="admin-action-buttons">
                            ${canCancel ? `
                                <button class="admin-btn-action admin-btn-danger" 
                                        onclick="cancelSingleBooking('${booking.id}', '${booking.userName}', '${booking.seat}', '${booking.bookingDate}')"
                                        title="Cancel Booking">
                                    ❌
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    if (countInfo) {
        countInfo.textContent = `Showing ${bookings.length} bookings`;
    }
    
    updateBulkSelectionUI();
}

function clearBookingSearch() {
    document.getElementById('bookingSearch').value = '';
    document.getElementById('bookingFilter').value = 'all';
    performBookingSearch();
}

// ==================== BULK SELECTION FUNCTIONS ====================
function toggleAllBookingsSelection() {
    const selectAll = document.getElementById('selectAllBookings');
    const checkboxes = document.querySelectorAll('.booking-selection-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateBulkSelectionUI();
}

function updateBulkSelectionUI() {
    const selectedCheckboxes = document.querySelectorAll('.booking-selection-checkbox:checked');
    const selectedBookings = Array.from(selectedCheckboxes).map(checkbox => ({
        id: checkbox.dataset.bookingid,
        userName: checkbox.dataset.user,
        seat: checkbox.dataset.seat,
        date: checkbox.dataset.date
    }));
    
    window.bulkSelections = { selectedBookings };
    
    const selectionBar = document.getElementById('bulkSelectionBar');
    const selectedCount = document.getElementById('selectedCount');
    const selectAllCheckbox = document.getElementById('selectAllBookings');
    
    if (selectedBookings.length > 0) {
        selectionBar.style.display = 'flex';
        selectedCount.textContent = selectedBookings.length;
        
        const totalCheckboxes = document.querySelectorAll('.booking-selection-checkbox').length;
        selectAllCheckbox.checked = selectedBookings.length === totalCheckboxes;
        selectAllCheckbox.indeterminate = selectedBookings.length > 0 && selectedBookings.length < totalCheckboxes;
    } else {
        selectionBar.style.display = 'none';
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

function clearAllSelections() {
    const checkboxes = document.querySelectorAll('.booking-selection-checkbox');
    const selectAll = document.getElementById('selectAllBookings');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectAll.checked = false;
    selectAll.indeterminate = false;
    
    updateBulkSelectionUI();
}

function quickBulkCancel() {
    const selectedBookings = window.bulkSelections.selectedBookings;
    
    if (selectedBookings.length === 0) {
        showAdminMessage('❌ No bookings selected', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">⚠️ Cancel Selected Bookings</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <p style="color: rgba(255,255,255,0.8);">
                        Cancel <strong>${selectedBookings.length}</strong> selected bookings?
                    </p>
                    <div style="background: rgba(255,68,68,0.1); padding: 15px; border-radius: 10px; margin: 15px 0; border: 1px solid rgba(255,68,68,0.3);">
                        <p style="margin: 0; color: #ff4444; font-size: 0.9rem;">
                            ⚠️ This action cannot be undone
                        </p>
                    </div>
                    
                    <div style="max-height: 200px; overflow-y: auto; text-align: left; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                        ${selectedBookings.map(booking => `
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span><strong>${booking.seat}</strong> - ${booking.userName}</span>
                                <span style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">
                                    ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="admin-btn-group">
                    <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                        ← Keep Bookings
                    </button>
                    <button class="admin-btn admin-btn-danger" onclick="executeQuickBulkCancel()">
                        🗑️ Cancel ${selectedBookings.length} Bookings
                    </button>
                </div>
            </div>
        </div>
    `;

    hideAdminModal();
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();
}

async function executeQuickBulkCancel() {
    const selectedBookings = window.bulkSelections.selectedBookings;
    
    try {
        showAdminMessage(`⏳ Cancelling ${selectedBookings.length} bookings...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        let successCount = 0;
        let errorCount = 0;
        
        for (const booking of selectedBookings) {
            try {
                const result = await FirestoreAPI.cancelBooking(
                    booking.seat, 
                    booking.userName, 
                    booking.date
                );
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        let message = `✅ Bulk cancel completed: ${successCount} successful`;
        if (errorCount > 0) {
            message += `, ${errorCount} failed`;
        }
        
        showAdminMessage(message, errorCount > 0 ? 'error' : 'success');
        
        setTimeout(() => {
            hideAdminModal();
            setTimeout(() => {
                window.showAllBookings();
            }, 500);
        }, 2000);
        
    } catch (error) {
        showAdminMessage(`❌ Bulk cancel failed: ${error.message}`, 'error');
    }
}

// ==================== BULK CANCEL MODAL ====================
function showBulkCancelModal() {
    const today = new Date().toISOString().split('T')[0];
    const futureBookings = window.currentBookingsData.filter(b => 
        b.bookingDate >= today && b.status === 'active'
    );
    
    if (futureBookings.length === 0) {
        showAdminMessage('❌ No future bookings to cancel', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">🗑️ Bulk Cancel</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; margin: 10px 0; border: 1px solid rgba(255, 215, 0, 0.3);">
                        <h4 style="color: var(--gold); margin-bottom: 10px;">${futureBookings.length} Future Bookings</h4>
                    </div>
                    
                    <div style="background: rgba(255,68,68,0.1); padding: 12px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(255,68,68,0.3);">
                        <p style="margin: 0; color: #ff4444; font-size: 0.9rem;">
                            ⚠️ This will cancel ALL future active bookings
                        </p>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                        <button class="admin-btn admin-btn-danger" onclick="cancelAllFutureBookings()" style="justify-content: center;">
                            🗑️ Cancel All ${futureBookings.length} Bookings
                        </button>
                        <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()" style="justify-content: center;">
                            ← Back to Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    hideAdminModal();
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();
}

async function cancelAllFutureBookings() {
    const today = new Date().toISOString().split('T')[0];
    const futureBookings = window.currentBookingsData.filter(b => 
        b.bookingDate >= today && b.status === 'active'
    );
    
    try {
        showAdminMessage(`⏳ Cancelling ${futureBookings.length} future bookings...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        let successCount = 0;
        let errorCount = 0;
        
        for (const booking of futureBookings) {
            try {
                const result = await FirestoreAPI.cancelBooking(
                    booking.seat, 
                    booking.userName, 
                    booking.bookingDate
                );
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }
        
        let message = `✅ Bulk cancel completed: ${successCount} successful`;
        if (errorCount > 0) {
            message += `, ${errorCount} failed`;
        }
        
        showAdminMessage(message, errorCount > 0 ? 'error' : 'success');
        
        setTimeout(() => {
            hideAdminModal();
            setTimeout(() => {
                window.showAllBookings();
            }, 500);
        }, 2000);
        
    } catch (error) {
        showAdminMessage(`❌ Bulk cancel failed: ${error.message}`, 'error');
    }
}

// ==================== SINGLE BOOKING CANCEL ====================
async function executeSingleBookingCancel(bookingId, userName, seat, date) {
    try {
        showAdminMessage(`⏳ Cancelling booking...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.cancelBooking(seat, userName, date);
        
        if (result.success) {
            showAdminMessage(`✅ Booking cancelled successfully`, 'success');
            hideAdminModal();
            
            setTimeout(() => {
                window.showAllBookings();
            }, 1000);
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

async function cancelSingleBooking(bookingId, userName, seat, date) {
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content" style="max-width: 450px;">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">⚠️ Cancel Booking</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: rgba(255, 85, 85, 0.1); padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid rgba(255, 85, 85, 0.3);">
                        <h4 style="color: #ff5555; margin-bottom: 15px;">Confirm Cancellation</h4>
                        <p style="margin: 8px 0; color: rgba(255,255,255,0.9);">
                            <strong>User:</strong> ${userName}
                        </p>
                        <p style="margin: 8px 0; color: rgba(255,255,255,0.9);">
                            <strong>Seat:</strong> ${seat}
                        </p>
                        <p style="margin: 8px 0; color: rgba(255,255,255,0.9);">
                            <strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div class="admin-btn-group">
                    <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                        ❌ Keep Booking
                    </button>
                    <button class="admin-btn admin-btn-danger" onclick="executeSingleBookingCancel('${bookingId}', '${userName}', '${seat}', '${date}')">
                        ✅ Confirm Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    hideAdminModal();
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();
}

// ==================== PASSWORD GENERATOR ====================
function generateStrongPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ==================== PASSWORD GENERATOR MODAL ====================
function showPasswordGenerator() {
    const password = generateStrongPassword();
    
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content password-generator-modal" style="max-width: 500px;">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">🔐 Generate Secure Password</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <p style="color: rgba(255,255,255,0.8);">Use this secure randomly generated password:</p>
                </div>

                <div class="password-display" id="generatedPassword">
                    ${password}
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <button class="copy-btn" onclick="copyGeneratedPassword()" id="copyPasswordBtn">
                        📋 Copy to Clipboard
                    </button>
                </div>

                <div style="background: rgba(255,215,0,0.1); padding: 12px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(255,215,0,0.3);">
                    <p style="margin: 0; color: var(--gold); font-size: 0.8rem; text-align: center;">
                        💡 <strong>Tip:</strong> Share this password securely with the user
                    </p>
                </div>

                <div class="admin-btn-group">
                    <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                        Close
                    </button>
                    <button class="admin-btn admin-btn-primary" onclick="generateNewPassword()">
                        🔄 Generate New
                    </button>
                </div>
            </div>
        </div>
    `;

    hideAdminModal();
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();
}

// ==================== RESET PASSWORD ====================
async function adminResetPassword(username) {
    try {
        const newPassword = generateStrongPassword(10);
        
        const modalHTML = `
            <div class="admin-modal-overlay">
                <div class="admin-modal-content" style="max-width: 450px;">
                    <div class="admin-modal-header">
                        <h3 class="admin-modal-title">🔐 Reset Password - ${username}</h3>
                        <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 15px;">
                        <p style="color: rgba(255,255,255,0.8);">New auto-generated password:</p>
                    </div>

                    <div class="password-display" id="generatedPassword">
                        ${newPassword}
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                        <button class="copy-btn" onclick="copyGeneratedPassword()" id="copyPasswordBtn">
                            📋 Copy Password
                        </button>
                    </div>

                    <div class="admin-btn-group">
                        <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                            Cancel
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="confirmPasswordReset('${username}', '${newPassword}')">
                            ✅ Confirm Reset
                        </button>
                    </div>
                </div>
            </div>
        `;

        hideAdminModal();
        
        const modalContainer = document.createElement('div');
        modalContainer.id = 'adminModal';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        setupModalClose();

    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

async function confirmPasswordReset(username, newPassword) {
    try {
        showAdminMessage(`⏳ Resetting password for ${username}...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.resetUserPassword(username, newPassword);
        
        if (result.success) {
            showAdminMessage(`✅ Password reset successfully for ${username}`, 'success');
            setTimeout(() => {
                hideAdminModal();
            }, 2000);
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

window.copyGeneratedPassword = function() {
    const passwordElement = document.getElementById('generatedPassword');
    const copyBtn = document.getElementById('copyPasswordBtn');
    
    if (passwordElement) {
        const password = passwordElement.textContent;
        navigator.clipboard.writeText(password).then(() => {
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.innerHTML = '📋 Copy to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            showAdminMessage('❌ Failed to copy password', 'error');
        });
    }
};

window.generateNewPassword = function() {
    const passwordElement = document.getElementById('generatedPassword');
    if (passwordElement) {
        passwordElement.textContent = generateStrongPassword();
    }
};

// ==================== EXPORT FUNCTIONS ====================
async function exportUserReport() {
    try {
        showAdminMessage('⏳ Generating user report...', 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.exportUserReport();
        
        if (result.success) {
            downloadCSV(result.data, `${result.filename}_${new Date().toISOString().split('T')[0]}.csv`);
            showAdminMessage('✅ User report exported successfully!', 'success');
        } else {
            showAdminMessage(`❌ Export failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Export error: ${error.message}`, 'error');
    }
}

async function exportBookingReport() {
    try {
        showAdminMessage('⏳ Generating booking report...', 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.exportBookingReport();
        
        if (result.success) {
            downloadCSV(result.data, `${result.filename}_${new Date().toISOString().split('T')[0]}.csv`);
            showAdminMessage('✅ Booking report exported successfully!', 'success');
        } else {
            showAdminMessage(`❌ Export failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Export error: ${error.message}`, 'error');
    }
}

function downloadCSV(data, filename) {
    if (!data || data.length === 0) {
        showAdminMessage('❌ No data to export', 'error');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== USER MANAGEMENT MODAL ====================
export function showUserManagementModal(users) {
    console.log('🔍 DEBUG USER DATA:', users);
    
    // Check lastLogin data untuk setiap user
    users.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
            username: user.username,
            lastLogin: user.lastLogin,
            lastLoginType: typeof user.lastLogin,
            lastLoginValue: user.lastLogin?.toDate ? user.lastLogin.toDate() : user.lastLogin
        });
    });
    
    // ✅ PROCESS LAST LOGIN DATA SEBELUM DISPLAY
    const processedUsers = users.map(user => {
        // Ensure lastLogin data is properly handled
        if (user.lastLogin && user.lastLogin.toDate) {
            user.lastLoginDate = user.lastLogin.toDate(); // Backup converted date
        }
        return user;
    });
    
    const activeUsers = processedUsers.filter(u => u.isActive).length;
    const adminUsers = processedUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
    
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">👥 User Management</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div class="admin-stats-bar">
                    <div class="stat-card">
                        <span class="stat-number">${processedUsers.length}</span>
                        <span class="stat-label">Total Users</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${activeUsers}</span>
                        <span class="stat-label">Active Users</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${adminUsers}</span>
                        <span class="stat-label">Admin Users</span>
                    </div>
                </div>

                <div class="admin-search-bar">
                    <div class="search-input-group">
                        <input type="text" id="userSearch" placeholder="🔍 Search users..." class="admin-search-input">
                        <button class="admin-search-clear" onclick="clearUserSearch()">✕</button>
                    </div>
                    <select id="userFilter" class="admin-filter-select">
                        <option value="all">All Users</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                        <option value="admin">Admins Only</option>
                        <option value="user">Users Only</option>
                    </select>
                </div>

                <div class="admin-action-bar">
                    <div class="admin-action-info" id="userCountInfo">
                        Showing ${processedUsers.length} users
                    </div>
                    <div class="admin-action-buttons">
                        <button class="admin-btn admin-btn-export" onclick="exportUserReport()">
                            📊 Export CSV
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="hideAdminModal(); showAddUserForm();">
                            ➕ Add User
                        </button>
                    </div>
                </div>

                <div id="adminMessage" class="admin-message" style="display: none;"></div>

                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th onclick="sortUsers('index')" data-original="#">#</th>
                                <th onclick="sortUsers('username')" style="cursor: pointer;" data-original="User">User</th>
                                <th onclick="sortUsers('team')" style="cursor: pointer;" data-original="Team">Team</th>
                                <th onclick="sortUsers('role')" style="cursor: pointer;" data-original="Role">Role</th>
                                <th onclick="sortUsers('status')" style="cursor: pointer;" data-original="Status">Status</th>
                                <th onclick="sortUsers('lastLogin')" style="cursor: pointer; text-align: center;" data-original="Last Login">Last Login</th>
                                <th style="text-align: center;" data-original="Actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <!-- Data akan diisi oleh updateUsersTable -->
                        </tbody>
                    </table>
                </div>

                <div class="admin-btn-group">
                    <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                        ← Close
                    </button>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('adminModal');
    if (existingModal) existingModal.remove();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();

    window.currentUsersData = processedUsers; // ✅ PAKAI PROCESSED DATA
    
    // Attach event listeners
    setTimeout(() => {
        // ✅ INITIAL RENDER DENGAN DATA YANG SUDAH DIPROSES
        updateUsersTable(processedUsers);
        
        const searchInput = document.getElementById('userSearch');
        const filterSelect = document.getElementById('userFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', performUserSearch);
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', performUserSearch);
        }
        
        attachAdminModalEvents();
        updateUserSortIndicators(userSortState.field, userSortState.direction);
        
    }, 100);
}
// ==================== ALL BOOKINGS MODAL ====================
export function showAllBookingsModal(bookings) {
    const activeBookings = bookings.filter(b => b.status === 'active').length;
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.bookingDate === today && b.status === 'active').length;
    const futureBookings = bookings.filter(b => b.bookingDate >= today && b.status === 'active').length;
    
    const modalHTML = `
        <div class="admin-modal-overlay">
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">📊 All Bookings</h3>
                    <button class="admin-close-btn" onclick="hideAdminModal()">&times;</button>
                </div>
                
                <div class="admin-stats-bar">
                    <div class="stat-card">
                        <span class="stat-number">${bookings.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${activeBookings}</span>
                        <span class="stat-label">Active</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${futureBookings}</span>
                        <span class="stat-label">Future</span>
                    </div>
                </div>

                <div class="admin-search-bar">
                    <div class="search-input-group">
                        <input type="text" id="bookingSearch" placeholder="🔍 Search..." class="admin-search-input">
                        <button class="admin-search-clear" onclick="clearBookingSearch()">✕</button>
                    </div>
                    <select id="bookingFilter" class="admin-filter-select">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="today">Today</option>
                        <option value="future">Future</option>
                    </select>
                </div>

                <div class="admin-action-bar">
                    <div class="admin-action-info" id="bookingCountInfo">
                        ${bookings.length} bookings
                    </div>
                    <div class="admin-action-buttons">
                        <button class="admin-btn admin-btn-export" onclick="exportBookingReport()">
                            📊 Export
                        </button>
                    </div>
                </div>

                <div id="adminMessage" class="admin-message" style="display: none;"></div>

                <div style="background: rgba(0, 120, 215, 0.1); padding: 8px 12px; border-radius: 6px; margin: 10px 0; border: 1px solid rgba(0, 120, 215, 0.3);">
                    <p style="margin: 0; color: #0078d7; font-size: 0.8rem; text-align: center;">
                        💡 <strong>Bulk Actions:</strong> Use checkboxes to select multiple bookings, then cancel them all at once
                    </p>
                </div>

                <div class="bulk-selection-bar" style="display: none;" id="bulkSelectionBar">
                    <div class="bulk-selection-info">
                        <span id="selectedCount">0</span> bookings selected for cancellation
                    </div>
                    <div class="bulk-action-buttons">
                        <button class="admin-btn admin-btn-secondary" onclick="clearAllSelections()" title="Clear selection">
                            ❌ Clear
                        </button>
                        <button class="admin-btn admin-btn-danger" onclick="quickBulkCancel()" title="Cancel selected bookings">
                            🗑️ Cancel Selected
                        </button>
                    </div>
                </div>

                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th class="checkbox-cell" data-original="" title="Select bookings for bulk cancellation">
                                    <input type="checkbox" id="selectAllBookings" onchange="toggleAllBookingsSelection()" title="Select all future bookings">
                                    <span style="font-size: 0.7rem; color: rgba(255,255,255,0.6); margin-left: 5px;">Bulk</span>
                                </th>
                                <th class="index-cell" onclick="sortBookings('index')" data-original="#">#</th>
                                <th onclick="sortBookings('date')" style="cursor: pointer;" data-original="Date">Date</th>
                                <th onclick="sortBookings('user')" style="cursor: pointer;" data-original="User">User</th>
                                <th onclick="sortBookings('seat')" style="cursor: pointer;" data-original="Seat">Seat</th>
                                <th onclick="sortBookings('team')" style="cursor: pointer;" data-original="Team">Team</th>
                                <th onclick="sortBookings('status')" style="cursor: pointer;" data-original="Status">Status</th>
                                <th data-original="Time">Time</th>
                                <th style="text-align: center;" data-original="Actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            ${bookings.map((booking, index) => {
                                const bookingTime = booking.bookingTime?.toDate?.() || 
                                                  booking.timestamp ? new Date(booking.timestamp) : 
                                                  booking.createdAt?.toDate?.() || new Date();
                                const timeDisplay = bookingTime.toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                const today = new Date().toISOString().split('T')[0];
                                const isFuture = booking.bookingDate >= today;
                                const canCancel = booking.status === 'active' && isFuture;
                                
                                return `
                                    <tr>
                                        <td class="checkbox-cell">
                                            ${canCancel ? `
                                                <input type="checkbox" class="booking-selection-checkbox" 
                                                       data-bookingid="${booking.id}"
                                                       data-user="${booking.userName}"
                                                       data-seat="${booking.seat}" 
                                                       data-date="${booking.bookingDate}"
                                                       onchange="updateBulkSelectionUI()">
                                            ` : ''}
                                        </td>
                                        <td class="index-cell">${index + 1}</td>
                                        <td>
                                            <div style="font-weight: 600;">${booking.bookingDate || 'Unknown'}</div>
                                            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                                                ${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                        </td>
                                        <td>${booking.userName}</td>
                                        <td>
                                            <span style="font-weight: 600; color: var(--gold);">${booking.seat}</span>
                                        </td>
                                        <td>
                                            <span style="color: rgba(255,255,255,0.8);">${booking.userTeam || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <span class="admin-status-badge ${booking.status === 'active' ? 'admin-status-active' : 'admin-status-cancelled'}">
                                                ${booking.status === 'active' ? 'Active' : 'Cancelled'}
                                            </span>
                                        </td>
                                        <td style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                                            ${timeDisplay}
                                        </td>
                                        <td>
                                            <div class="admin-action-buttons">
                                                ${canCancel ? `
                                                    <button class="admin-btn-action admin-btn-danger" 
                                                            onclick="cancelSingleBooking('${booking.id}', '${booking.userName}', '${booking.seat}', '${booking.bookingDate}')"
                                                            title="Cancel">
                                                        ❌
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="admin-btn-group">
                    <button class="admin-btn admin-btn-secondary" onclick="hideAdminModal()">
                        ← Close
                    </button>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('adminModal');
    if (existingModal) existingModal.remove();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'adminModal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    setupModalClose();

    window.currentBookingsData = bookings;
    window.bulkSelections = { selectedBookings: [] };
    
    // Attach event listeners
    setTimeout(() => {
        const searchInput = document.getElementById('bookingSearch');
        const filterSelect = document.getElementById('bookingFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', performBookingSearch);
            console.log('🎯 Search input event attached');
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', performBookingSearch);
            console.log('🎯 Filter select event attached');
        }
        
        // Juga attach event untuk select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllBookings');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', toggleAllBookingsSelection);
        }
        
        // Set initial sort indicator
        updateBookingSortIndicators(bookingSortState.field, bookingSortState.direction);
        
        console.log('🔍 Search functionality initialized');
        console.log('📊 Total bookings:', window.currentBookingsData.length);
    }, 100);
}

// ==================== EVENT HANDLERS ====================
function attachAdminModalEvents() {
    document.querySelectorAll('.team-select').forEach(select => {
        select.addEventListener('change', function() {
            const userId = this.dataset.userid;
            const username = this.dataset.username;
            const newTeam = this.value;
            
            if (newTeam) {
                adminUpdateUserTeam(userId, username, newTeam);
            }
        });
    });

    document.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', function() {
            const userId = this.dataset.userid;
            const username = this.dataset.username;
            const newRole = this.value;
            
            adminUpdateUserRole(userId, username, newRole);
        });
    });
}

// ==================== USER ACTIONS ====================
async function adminUpdateUserTeam(userId, username, newTeam) {
    try {
        showAdminMessage(`⏳ Updating ${username}'s team...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.assignUserTeam(username, newTeam);
        
        if (result.success) {
            showAdminMessage(`✅ ${username}'s team updated to ${newTeam}`, 'success');
            setTimeout(() => {
                window.showUserManagement();
            }, 2000);
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

async function adminUpdateUserRole(userId, username, newRole) {
    try {
        showAdminMessage(`⏳ Updating ${username}'s role...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.changeUserRole(username, newRole);
        
        if (result.success) {
            showAdminMessage(`✅ ${username}'s role updated to ${newRole}`, 'success');
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

async function adminDeactivateUser(userId, username) {
    if (!confirm(`Deactivate user ${username}? They will not be able to login.`)) return;

    try {
        showAdminMessage(`⏳ Deactivating ${username}...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.updateUser(userId, { isActive: false, status: 'inactive' });
        
        if (result.success) {
            showAdminMessage(`✅ ${username} deactivated successfully`, 'success');
            setTimeout(() => {
                window.showUserManagement();
            }, 2000);
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

async function adminActivateUser(userId, username) {
    try {
        showAdminMessage(`⏳ Activating ${username}...`, 'info');
        
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.updateUser(userId, { isActive: true, status: 'active' });
        
        if (result.success) {
            showAdminMessage(`✅ ${username} activated successfully`, 'success');
            setTimeout(() => {
                window.showUserManagement();
            }, 2000);
        } else {
            showAdminMessage(`❌ Failed: ${result.message}`, 'error');
        }
    } catch (error) {
        showAdminMessage(`❌ Error: ${error.message}`, 'error');
    }
}

// ==================== MESSAGE DISPLAY ====================
function showAdminMessage(text, type) {
    const messageEl = document.getElementById('adminMessage');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `admin-message ${type}`;
        messageEl.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// ==================== GLOBAL EXPORTS ====================
window.adminUpdateUserTeam = adminUpdateUserTeam;
window.adminUpdateUserRole = adminUpdateUserRole;
window.adminResetPassword = adminResetPassword;
window.adminDeactivateUser = adminDeactivateUser;
window.adminActivateUser = adminActivateUser;
window.exportUserReport = exportUserReport;
window.exportBookingReport = exportBookingReport;
window.showPasswordGenerator = showPasswordGenerator;
window.confirmPasswordReset = confirmPasswordReset;
window.copyGeneratedPassword = copyGeneratedPassword;
window.generateNewPassword = generateNewPassword;

// Search & Sort Functions
window.sortUsers = sortUsers;
window.clearUserSearch = clearUserSearch;
window.sortBookings = sortBookings;
window.clearBookingSearch = clearBookingSearch;
window.cancelSingleBooking = cancelSingleBooking;

// Bulk Modal Functions
window.showBulkCancelModal = showBulkCancelModal;
window.cancelAllFutureBookings = cancelAllFutureBookings;

// Single Booking Cancel Function
window.executeSingleBookingCancel = executeSingleBookingCancel;

// Bulk Selection Functions
window.toggleAllBookingsSelection = toggleAllBookingsSelection;
window.updateBulkSelectionUI = updateBulkSelectionUI;
window.clearAllSelections = clearAllSelections;
window.quickBulkCancel = quickBulkCancel;
window.executeQuickBulkCancel = executeQuickBulkCancel;

// Sort Functions
window.updateUserSortIndicators = updateUserSortIndicators;
window.updateBookingSortIndicators = updateBookingSortIndicators;

// Delete User Modal
window.showDeleteUserModal = showDeleteUserModal;

console.log('✅ Admin Modals v4.0 - Complete Fixed Version with Delete User Modal Loaded');