// main.js - FIXED VERSION (tanpa duplicate modal functions) v1.0.5
import { initializeAuth } from './auth.js';
import { showLoader, showMessage } from './utils.js';
import { state } from './constants.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Firebase Seat Booking App Loading...');

    try {
        initializeApp();
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showMessage('App initialization failed', 'error');
    }
});

function initializeApp() {
    console.log('🔧 Initializing Firebase seat booking app...');
    showLoader(true);
    
    // Setup global functions untuk HTML onclick
    setupGlobalFunctions();
    
    // Initialize authentication
    initializeAuth();
    
    showLoader(false);
    console.log('🎉 Firebase app initialized successfully');
}

function setupGlobalFunctions() {
    console.log('🔧 Setting up global functions...');
    
    // ==================== VIEW TOGGLES ====================
    window.showGridView = function() {
        const gridView = document.getElementById('gridView');
        const mapView = document.getElementById('mapView');
        const historicalPanel = document.getElementById('historicalPanel');
        
        if (gridView) gridView.style.display = 'block';
        if (mapView) mapView.style.display = 'none';
        if (historicalPanel) historicalPanel.style.display = 'none';
        
        // Update button states
        const gridBtn = document.getElementById('gridViewBtn');
        const mapBtn = document.getElementById('mapViewBtn');
        
        if (gridBtn) gridBtn.classList.add('active');
        if (mapBtn) mapBtn.classList.remove('active');
        
        console.log('📊 Grid view shown');
    };
    
    window.showMapView = function() {
        const gridView = document.getElementById('gridView');
        const mapView = document.getElementById('mapView');
        const historicalPanel = document.getElementById('historicalPanel');
        
        if (gridView) gridView.style.display = 'none';
        if (mapView) mapView.style.display = 'block';
        if (historicalPanel) historicalPanel.style.display = 'none';
        
        // Update button states
        const gridBtn = document.getElementById('gridViewBtn');
        const mapBtn = document.getElementById('mapViewBtn');
        
        if (gridBtn) gridBtn.classList.remove('active');
        if (mapBtn) mapBtn.classList.add('active');
        
        console.log('🗺️ Map view shown');
    };
    
    // ==================== DATE NAVIGATION ====================
    window.changeDate = function(days) {
        import('./bookings.js').then(module => {
            if (module.changeDate) {
                module.changeDate(days);
            }
        });
    };
    
    // ==================== BOOKING FUNCTIONS ====================
    window.processBooking = async function(seatCode) {
        const { processBooking } = await import('./bookings.js');
        processBooking(seatCode);
    };
    
    window.processCancelBooking = async function(seatCode) {
        const { processCancelBooking } = await import('./bookings.js');
        processCancelBooking(seatCode);
    };
    
    window.hideBookingForm = function() {
        const formContainer = document.getElementById("bookingFormContainer");
        if (formContainer) {
            formContainer.style.display = "none";
        }
    };
    
    // ==================== HISTORICAL & REFRESH ====================
    window.toggleHistorical = function() {
        import('./bookings.js').then(module => {
            if (module.toggleHistorical) {
                module.toggleHistorical();
            }
        });
    };
    
    window.refreshBookings = function() {
        import('./bookings.js').then(module => {
            if (module.loadBookings && module.loadHistoricalBookings) {
                module.loadBookings();
                module.loadHistoricalBookings();
                showMessage('🔄 Data refreshed!', 'success');
            }
        });
    };
    
    // ==================== ADMIN FUNCTIONS ====================
    window.showUserManagement = async function() {
        console.log('🎯 showUserManagement STARTED');
        
        try {
            const { state } = await import('./constants.js');
            
            // Check user role
            if (!state.currentUser || (state.currentUser.role !== 'admin' && state.currentUser.role !== 'super_admin')) {
                showMessage('❌ Admin access required', 'error');
                return;
            }

            const { FirestoreAPI } = await import('./firestore-api.js');
            const { showUserManagementModal } = await import('./admin-modals.js'); // ← IMPORT DARI FILE BARU
            
            const result = await FirestoreAPI.getAllUsers();
            
            if (result.success) {
                showUserManagementModal(result.users);
            } else {
                showMessage('❌ ' + (result.message || 'Failed to load users'), 'error');
            }

        } catch (error) {
            console.error('🔥 showUserManagement ERROR:', error);
            showMessage('❌ Error: ' + error.message, 'error');
        }
    };
    
    window.showAllBookings = async function() {
        console.log('🎯 showAllBookings STARTED');
        
        try {
            const { state } = await import('./constants.js');
            
            // Check admin access
            if (!state.currentUser || (state.currentUser.role !== 'admin' && state.currentUser.role !== 'super_admin')) {
                showMessage('❌ Admin access required', 'error');
                return;
            }

            const { FirestoreAPI } = await import('./firestore-api.js');
            const { showAllBookingsModal } = await import('./admin-modals.js'); // ← IMPORT DARI FILE BARU
            
            const result = await FirestoreAPI.getAllBookingsAdmin();
            
            if (result.success) {
                showAllBookingsModal(result.bookings);
            } else {
                showMessage('❌ ' + (result.message || 'Failed to load bookings'), 'error');
            }

        } catch (error) {
            console.error('🔥 showAllBookings ERROR:', error);
            showMessage('❌ Error: ' + error.message, 'error');
        }
    };
    
    window.showAddUserForm = function() {
        const form = document.getElementById('addUserFormContainer');
        if (form) {
            form.style.display = 'block';
            document.getElementById('newUserUsername').value = '';
            document.getElementById('newUserPassword').value = '';
            document.getElementById('newUserName').value = '';
            document.getElementById('newUserRole').value = 'user';
            
            const messageEl = document.getElementById('addUserMessage');
            if (messageEl) messageEl.innerHTML = '';
        }
    };
    
    window.hideAddUserForm = function() {
        const form = document.getElementById('addUserFormContainer');
        if (form) form.style.display = 'none';
    };
    
    // ==================== PASSWORD CHANGE ====================
    window.showChangePasswordModal = async function() {
        try {
            const { state } = await import('./constants.js');
            
            if (!state.currentUser) {
                showMessage('❌ Please login first', 'error');
                return;
            }
            
            const modal = document.getElementById('changePasswordModal');
            const usernameField = document.getElementById('changePasswordUsername');
            
            if (modal && usernameField) {
                // ✅ FIX: PAKAI setTimeout BIAR PASTI DOM READY
                setTimeout(() => {
                    usernameField.value = state.currentUser.username;
                    console.log('✅ Username set to:', usernameField.value);
                }, 100);
                
                modal.style.display = 'block';
                
                // Reset other fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
                const messageEl = document.getElementById('changePasswordMessage');
                if (messageEl) messageEl.innerHTML = '';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    window.hideChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.style.display = 'none';
    };
    
    // Handle change password
    async function handleChangePassword() {
        try {
            const { state } = await import('./constants.js');
            
            if (!state.currentUser) {
                showChangePasswordMessage('❌ Please login first', 'error');
                return;
            }

            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            
            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showChangePasswordMessage('❌ Please fill all fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showChangePasswordMessage('❌ New password and confirm password do not match', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showChangePasswordMessage('❌ New password must be at least 6 characters', 'error');
                return;
            }
            
            showChangePasswordMessage('⏳ Updating password...', 'info');
            
            const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';
            }
            
            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.changePassword(
                state.currentUser.username,
                currentPassword,
                newPassword
            );
            
            if (result.success) {
                showChangePasswordMessage('✅ Password successfully updated!', 'success');
                setTimeout(() => {
                    hideChangePasswordModal();
                    showMessage('✅ Password successfully changed', 'success');
                    const form = document.getElementById('changePasswordForm');
                    if (form) form.reset();
                }, 1500);
            } else {
                showChangePasswordMessage(`❌ ${result.message}`, 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Password';
                }
            }
            
        } catch (error) {
            console.error('Change Password Error:', error);
            showChangePasswordMessage('❌ Error: ' + error.message, 'error');
            const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
            if (submitBtn) {
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
    
    // ==================== EXPORT FUNCTIONS ====================
    window.showExportModal = function() {
        // ... (isi fungsi export modal yang lama)
        console.log('Export modal placeholder');
    };
    
    window.exportBookings = async function() {
        showExportModal();
    };
    
    // ==================== FORM INITIALIZATION ====================
    function initializeAllForms() {
        console.log('🔄 Initializing all forms...');
        
        // Change Password Form
        const cpForm = document.getElementById('changePasswordForm');
        if (cpForm) {
            cpForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await handleChangePassword();
            });
        }
        
        // Add User Form
        const auForm = document.getElementById('addUserForm');
        if (auForm) {
            auForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await handleAddUser();
            });
        }
    }
    
    // Handle Add User
    async function handleAddUser() {
        try {
            const username = document.getElementById('newUserUsername').value;
            const password = document.getElementById('newUserPassword').value;
            const name = document.getElementById('newUserName').value;
            const role = document.getElementById('newUserRole').value;

            if (!username || !password || !name) {
                showAddUserMessage('❌ Please fill all fields', 'error');
                return;
            }

            if (password.length < 6) {
                showAddUserMessage('❌ Password must be at least 6 characters', 'error');
                return;
            }

            showAddUserMessage('⏳ Adding user...', 'info');

            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.addUser(username, password, name, role);

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
            showAddUserMessage('❌ Error adding user', 'error');
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
    
    // Assign to window
    window.handleAddUser = handleAddUser;
    
    // Initialize forms setelah delay
    setTimeout(initializeAllForms, 1000);
}

console.log('✅ Main.js loaded successfully');