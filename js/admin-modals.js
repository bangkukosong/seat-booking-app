// admin-modals.js - Professional Admin Modal Functions v1.0.2
export function showUserManagementModal(users) {
    console.log('👥 User Management - Users:', users);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); padding: 25px; border-radius: 15px; 
                   width: 95%; max-width: 1000px; max-height: 85vh; overflow-y: auto;
                   border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--admin-purple); margin: 0;">👥 User Access Management</h2>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="background: none; border: none; color: #ff5555; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="window.showAddUserForm()" class="btn btn-success" style="padding: 10px 15px;">
                    ➕ Add New User
                </button>
                <button onclick="window.exportUserReport()" class="btn btn-primary" style="padding: 10px 15px;">
                    📊 Export User Report
                </button>
                <button onclick="window.refreshUserList()" class="btn btn-secondary" style="padding: 10px 15px;">
                    🔄 Refresh
                </button>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 15px; font-weight: bold; color: var(--gold);">
                    <div>User Information</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>
            </div>
            
            <div style="max-height: 500px; overflow-y: auto;">
                ${renderUsersList(users)}
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: rgba(255,255,255,0.7);">
                Total Users: <strong>${users?.length || 0}</strong>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

export function showAllBookingsModal(bookings) {
    console.log('📋 All Bookings - Bookings:', bookings);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); padding: 25px; border-radius: 15px; 
                   width: 95%; max-width: 1200px; max-height: 85vh; overflow-y: auto;
                   border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-blue); margin: 0;">📋 All Bookings Report</h2>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="background: none; border: none; color: #ff5555; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="window.exportBookingReport()" class="btn btn-success" style="padding: 10px 15px;">
                    📤 Export CSV Report
                </button>
                <button onclick="window.exportBookingPDF()" class="btn btn-primary" style="padding: 10px 15px;">
                    📄 Export PDF Report
                </button>
                <button onclick="window.refreshAllBookings()" class="btn btn-secondary" style="padding: 10px 15px;">
                    🔄 Refresh
                </button>
            </div>
            
            <div style="max-height: 500px; overflow-y: auto;">
                ${renderBookingsTable(bookings)}
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: rgba(255,255,255,0.7);">
                Total Bookings: <strong>${bookings?.length || 0}</strong>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ==================== USER MANAGEMENT FUNCTIONS ====================
function renderUsersList(users) {
    if (!users || users.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.7); padding: 40px;">No users found</p>';
    }
    
    return users.map(user => `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 15px; 
                    padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); 
                    align-items: center; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;">
            
            <!-- User Information -->
            <div>
                <div style="font-weight: bold; color: white; margin-bottom: 4px;">${user.name || 'N/A'}</div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">ID: ${user.username}</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">
                    Created: ${user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                </div>
            </div>
            
            <!-- Role -->
            <div>
                <span class="role-badge ${user.role || 'user'}" 
                      style="padding: 6px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: 600;
                             background: ${getRoleColor(user.role).background}; 
                             color: ${getRoleColor(user.role).color};
                             border: 1px solid ${getRoleColor(user.role).border};">
                    ${user.role || 'user'}
                </span>
            </div>
            
            <!-- Status -->
            <div>
                <span style="padding: 4px 8px; border-radius: 10px; font-size: 0.75rem; 
                            background: rgba(0,255,128,0.2); color: #00ff80; border: 1px solid rgba(0,255,128,0.3);">
                    ✅ Active
                </span>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="window.changeUserRole('${user.username}', '${user.role}')" 
                        class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;">
                    🔄 Role
                </button>
                <button onclick="window.resetUserPassword('${user.username}')" 
                        class="btn btn-primary" style="padding: 6px 10px; font-size: 0.8rem;">
                    🔑 Reset PW
                </button>
                ${user.role !== 'super_admin' ? `
                    <button onclick="window.deleteUser('${user.username}')" 
                            class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8rem;">
                        🗑️ Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ==================== BOOKINGS REPORT FUNCTIONS ====================
function renderBookingsTable(bookings) {
    if (!bookings || bookings.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.7); padding: 40px;">No bookings found</p>';
    }
    
    return `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(255,215,0,0.2);">
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Date</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Seat</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">User</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Booking Time</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1);">Department</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 12px; color: white;">
                                ${booking.day ? new Date(booking.day).toLocaleDateString('en-US', { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                }) : 'Unknown'}
                            </td>
                            <td style="padding: 12px; color: var(--primary-green); font-weight: bold;">${booking.seat}</td>
                            <td style="padding: 12px; color: white;">${booking.userName}</td>
                            <td style="padding: 12px; color: rgba(255,255,255,0.8);">
                                ${booking.bookingTime ? 
                                    new Date(booking.bookingTime.seconds * 1000).toLocaleString('en-US', {
                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                    }) : 
                                    'Unknown'
                                }
                            </td>
                            <td style="padding: 12px; color: var(--gold);">
                                ${booking.seat ? booking.seat.split('-')[0] : 'Unknown'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ==================== HELPER FUNCTIONS ====================
function getRoleColor(role) {
    const colors = {
        'super_admin': { background: 'rgba(255,0,0,0.3)', color: '#ff5555', border: 'rgba(255,0,0,0.5)' },
        'admin': { background: 'rgba(255,215,0,0.3)', color: '#ffd700', border: 'rgba(255,215,0,0.5)' },
        'user': { background: 'rgba(0,255,128,0.3)', color: '#00ff80', border: 'rgba(0,255,128,0.5)' }
    };
    return colors[role] || colors.user;
}

// ==================== WINDOW FUNCTIONS ====================
window.refreshUserList = async function() {
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.getAllUsers();
        
        if (result.success) {
            // Close current modal and open new one
            document.querySelector('.admin-modal')?.remove();
            showUserManagementModal(result.users);
            showMessage('✅ User list refreshed', 'success');
        } else {
            showMessage('❌ Failed to refresh users', 'error');
        }
    } catch (error) {
        console.error('Refresh users error:', error);
        showMessage('❌ Error refreshing users', 'error');
    }
};

window.refreshAllBookings = async function() {
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.getAllBookingsAdmin();
        
        if (result.success) {
            // Close current modal and open new one
            document.querySelector('.admin-modal')?.remove();
            showAllBookingsModal(result.bookings);
            showMessage('✅ Bookings refreshed', 'success');
        } else {
            showMessage('❌ Failed to refresh bookings', 'error');
        }
    } catch (error) {
        console.error('Refresh bookings error:', error);
        showMessage('❌ Error refreshing bookings', 'error');
    }
};

window.changeUserRole = async function(username, currentRole) {
    const newRole = prompt(`Change role for ${username}\nCurrent: ${currentRole}\n\nEnter new role (user/admin):`, currentRole);
    
    if (newRole && ['user', 'admin'].includes(newRole.toLowerCase())) {
        try {
            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.changeUserRole(username, newRole.toLowerCase());
            
            if (result.success) {
                showMessage(`✅ Role changed to ${newRole} for ${username}`, 'success');
                setTimeout(() => window.refreshUserList(), 1000);
            } else {
                showMessage(`❌ Failed to change role: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Change role error:', error);
            showMessage('❌ Error changing role', 'error');
        }
    } else if (newRole) {
        showMessage('❌ Invalid role. Use "user" or "admin"', 'error');
    }
};

window.resetUserPassword = async function(username) {
    const confirmReset = confirm(`Reset password for ${username}?\n\nNew password will be: "password123"`);
    
    if (confirmReset) {
        try {
            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.resetUserPassword(username, 'password123');
            
            if (result.success) {
                showMessage(`✅ Password reset to "password123" for ${username}`, 'success');
            } else {
                showMessage(`❌ Failed to reset password: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showMessage('❌ Error resetting password', 'error');
        }
    }
};

window.deleteUser = async function(username) {
    const confirmDelete = confirm(`⚠️ DELETE USER: ${username}\n\nThis action cannot be undone!`);
    
    if (confirmDelete) {
        try {
            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.deleteUser(username);
            
            if (result.success) {
                showMessage(`✅ User ${username} deleted`, 'success');
                setTimeout(() => window.refreshUserList(), 1000);
            } else {
                showMessage(`❌ Failed to delete user: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            showMessage('❌ Error deleting user', 'error');
        }
    }
};

window.exportUserReport = async function() {
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.getAllUsers();
        
        if (result.success) {
            exportToCSV(result.users, 'user_access_report');
            showMessage('✅ User report exported as CSV', 'success');
        } else {
            showMessage('❌ Failed to export user report', 'error');
        }
    } catch (error) {
        console.error('Export user report error:', error);
        showMessage('❌ Error exporting user report', 'error');
    }
};

window.exportBookingReport = async function() {
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.getAllBookingsAdmin();
        
        if (result.success) {
            exportToCSV(result.bookings, 'booking_report');
            showMessage('✅ Booking report exported as CSV', 'success');
        } else {
            showMessage('❌ Failed to export booking report', 'error');
        }
    } catch (error) {
        console.error('Export booking report error:', error);
        showMessage('❌ Error exporting booking report', 'error');
    }
};

window.exportBookingPDF = function() {
    showMessage('📄 PDF export feature coming soon!', 'info');
};

// ==================== EXPORT UTILITIES ====================
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showMessage('❌ No data to export', 'error');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Handle nested objects (like Firebase timestamps)
                if (value && typeof value === 'object') {
                    if (value.seconds) {
                        return new Date(value.seconds * 1000).toISOString();
                    }
                    return JSON.stringify(value);
                }
                return `"${String(value || '').replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}