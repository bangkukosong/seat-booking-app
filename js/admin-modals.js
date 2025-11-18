// admin-modals.js - Professional Admin Modal Functions v1.0.7
export function showUserManagementModal(users) {
    console.log('🧑‍💼 User Management - Users:', users);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000; overflow: hidden;
    `;
    
	// Di dalam showUserManagementModal - pastikan pakai class yang sama
	modal.innerHTML = `
		<div class="admin-modal-container">
			<!-- Header -->
			<div class="admin-modal-header">
				<h2 style="color: var(--gold) !important;">🧑‍💼 User Access Management</h2>
				<button onclick="this.closest('.modal-overlay').remove()" class="admin-close-btn">×</button>
			</div>
			
			<!-- Action Buttons -->
			<div class="admin-action-buttons">
				<button onclick="window.showAddUserForm()" class="btn btn-success">➕ Add New User</button>
				<button onclick="window.exportUserReport()" class="btn btn-primary">📊 Export User Report</button>
				<button onclick="window.refreshUserList()" class="btn btn-secondary">🔄 Refresh</button>
			</div>
			
			<!-- Grid Header -->
			<div class="grid-header">
				<div>User Information</div>
				<div>Role</div>
				<div>Status</div>
				<div>Actions</div>
			</div>
			
			<!-- Scrollable Content -->
			<div class="admin-modal-scroll">
				${renderUsersList(users)}
			</div>
			
			<!-- Footer -->
			<div class="admin-modal-footer">
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
        background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="admin-modal-container" style="max-width: 1200px !important;">
            <!-- Header -->
            <div class="admin-modal-header">
                <h2 style="color: var(--gold) !important;">📋 All Bookings Report</h2>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="admin-close-btn">×</button>
            </div>
            
            <!-- Action Buttons -->
            <div class="admin-action-buttons">
                <button onclick="window.exportBookingReport()" class="btn btn-success">
                    📤 Export CSV Report
                </button>
                <!--<button onclick="window.exportBookingPDF()" class="btn btn-primary">
                    📄 Export PDF
                </button>-->
                <button onclick="window.refreshAllBookings()" class="btn btn-secondary">
                    🔄 Refresh
                </button>
            </div>
            
            <!-- Scrollable Content -->
            <div class="admin-modal-scroll">
                ${renderBookingsTable(bookings)}
            </div>
            
            <!-- Footer -->
            <div class="admin-modal-footer">
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
    
    return users.map(user => {
        // Format dates properly
        const createdDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const lastLoginDate = user.lastLogin?.toDate ? user.lastLogin.toDate() : (user.lastLogin ? new Date(user.lastLogin) : null);
        
        const createdDisplay = createdDate instanceof Date && !isNaN(createdDate) 
            ? createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Unknown';
            
        const lastLoginDisplay = lastLoginDate instanceof Date && !isNaN(lastLoginDate)
            ? lastLoginDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Never';
            
        const isActive = user.lastLogin ? 
            (Date.now() - lastLoginDate.getTime() < 30 * 24 * 60 * 60 * 1000) : false; // Active if logged in within 30 days

        return `
            <div class="grid-row">
                <!-- User Information -->
                <div>
                    <div style="font-weight: bold; color: white; margin-bottom: 4px;">${user.name || 'N/A'}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">ID: ${user.username}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">
                        Created: ${createdDisplay}<br>
                        Last Login: ${lastLoginDisplay}
                    </div>
                </div>
                
                <!-- Role -->
                <div>
                    <span class="role-badge ${user.role || 'user'}">
                        ${user.role || 'user'}
                    </span>
                </div>
                
                <!-- Status -->
                <div>
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                        ${isActive ? '✅ Active' : '💤 Inactive'}
                    </span>
                </div>
                
                <!-- Actions -->
                <div class="action-buttons">
                    <button onclick="window.showRoleChangeModal('${user.username}', '${user.role}')" 
                            class="action-btn btn-role">
                        🔄 Role
                    </button>
                    <button onclick="window.showPasswordResetModal('${user.username}')" 
                            class="action-btn btn-password">
                        🔑 Reset PW
                    </button>
                    ${user.role !== 'super_admin' ? `
                        <button onclick="window.deleteUser('${user.username}')" 
                                class="action-btn btn-delete">
                            🗑️ Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ====================Role Change Modal (Elegant)====================
window.showRoleChangeModal = function(username, currentRole) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="
            background: rgba(255,255,255,0.25); 
            backdrop-filter: blur(20px);
            padding: 30px; border-radius: 20px; 
            width: 90%; max-width: 400px;
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            color: white;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="color: var(--gold); margin: 0;">🔄 Change User Role</h3>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="admin-close-btn">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 10px; color: rgba(255,255,255,0.9);">User: <strong>${username}</strong></p>
                <p style="color: rgba(255,255,255,0.8);">Current Role: <span class="role-badge ${currentRole}">${currentRole}</span></p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: rgba(255,255,255,0.9); font-weight: 600;">
                    Select New Role:
                </label>
                <select id="newRoleSelect" style="
                    width: 100%; padding: 12px; border-radius: 10px; 
                    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
                    color: white; font-size: 14px;
                ">
                    <option value="user" ${currentRole === 'user' ? 'selected' : ''}>🙍 User</option>
                    <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>👨‍💼 Admin</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button onclick="window.confirmRoleChange('${username}')" 
                        class="btn btn-success" style="flex: 1;">
                    ✅ Confirm Change
                </button>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="btn btn-secondary" style="flex: 1;">
                    ❌ Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.confirmRoleChange = async function(username) {
    const newRole = document.getElementById('newRoleSelect').value;
    
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.changeUserRole(username, newRole);
        
        if (result.success) {
            showMessage(`✅ Role changed to ${newRole} for ${username}`, 'success');
            // Close both modals
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
            setTimeout(() => window.refreshUserList(), 1000);
        } else {
            showMessage(`❌ Failed to change role: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Change role error:', error);
        showMessage('❌ Error changing role', 'error');
    }
};
// ======== Password Reset Modal (Elegant + Auto-generate) ===========
window.showPasswordResetModal = function(username) {
    // Generate secure password
    const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const newPassword = generateSecurePassword();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="
            background: rgba(255,255,255,0.25); 
            backdrop-filter: blur(20px);
            padding: 30px; border-radius: 20px; 
            width: 90%; max-width: 450px;
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            color: white;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="color: var(--gold); margin: 0;">🔑 Reset Password</h3>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="admin-close-btn">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="margin-bottom: 15px; color: rgba(255,255,255,0.9);">
                    User: <strong>${username}</strong>
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                        New Generated Password:
                    </label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="generatedPassword" value="${newPassword}" readonly 
                               style="flex: 1; padding: 10px; border-radius: 8px; 
                                      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
                                      color: var(--primary-green); font-family: monospace; font-weight: bold;">
                        <button onclick="copyGeneratedPassword()" 
                                class="btn btn-secondary" style="white-space: nowrap;">
                            📋 Copy
                        </button>
                    </div>
                </div>
                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7); text-align: center;">
                    🔒 Password will be automatically reset to this secure password
                </p>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button onclick="window.confirmPasswordReset('${username}', '${newPassword}')" 
                        class="btn btn-success" style="flex: 1;">
                    ✅ Reset Password
                </button>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="btn btn-secondary" style="flex: 1;">
                    ❌ Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.copyGeneratedPassword = function() {
    const passwordField = document.getElementById('generatedPassword');
    passwordField.select();
    document.execCommand('copy');
    showMessage('✅ Password copied to clipboard!', 'success');
};

window.confirmPasswordReset = async function(username, newPassword) {
    try {
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.resetUserPassword(username, newPassword);
        
        if (result.success) {
            showMessage(`✅ Password reset successfully for ${username}`, 'success');
            // Close modal
            document.querySelector('.modal-overlay').remove();
        } else {
            showMessage(`❌ Failed to reset password: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showMessage('❌ Error resetting password', 'error');
    }
};

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
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">Date</th>
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">Seat</th>
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">User</th>
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">Booking Time</th>
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">Department</th>
                        <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => {
                        // Fix date formatting
                        const bookingDate = booking.bookingTime?.toDate ? booking.bookingTime.toDate() : 
                                           booking.timestamp ? new Date(booking.timestamp) : 
                                           booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date();
                        
                        const bookingTimeDisplay = bookingDate instanceof Date && !isNaN(bookingDate)
                            ? bookingDate.toLocaleString('en-US', {
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                            })
                            : 'Unknown';

                        const dateDisplay = booking.bookingDate ? 
                            new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            }) : 'Unknown';

                        return `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 10px 12px; color: white; font-size: 0.85rem;">${dateDisplay}</td>
                                <td style="padding: 10px 12px; color: var(--primary-green); font-weight: bold; font-size: 0.85rem;">${booking.seat}</td>
                                <td style="padding: 10px 12px; color: white; font-size: 0.85rem;">${booking.userName}</td>
                                <td style="padding: 10px 12px; color: rgba(255,255,255,0.8); font-size: 0.85rem;">${bookingTimeDisplay}</td>
                                <td style="padding: 10px 12px; color: var(--gold); font-size: 0.85rem;">
                                    ${booking.seat ? booking.seat.split('-')[0] : 'Unknown'}
                                </td>
                                <td style="padding: 10px 12px; font-size: 0.85rem;">
                                    <span class="status-badge ${booking.status === 'active' ? 'status-active' : 'status-inactive'}">
                                        ${booking.status === 'active' ? '✅ Active' : '❌ Cancelled'}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
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

//window.exportBookingPDF = function() {
//    Simple PDF implementation using browser print
//    showMessage('📄 Preparing PDF export...', 'info');
    
//   setTimeout(() => {
//        const modal = document.querySelector('.admin-modal-container');
//        if (modal) {
//            const originalDisplay = modal.style.display;
//            modal.style.display = 'block';
            
            // Use browser print for simple PDF
 //           window.print();
            
 //           modal.style.display = originalDisplay;
 //           showMessage('✅ PDF ready! Use browser print to save as PDF.', 'success');
 //       } else {
 //           showMessage('❌ No booking data to export', 'error');
//        }
 //  }, 1000);
//};

// Atau disable PDF button dan kasih message
// window.exportBookingPDF = function() {
//     showMessage('📄 PDF export feature coming soon!', 'info');
// };

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