// js/main.js - FIXED VERSION (With Working Change Password)
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
    window.showUserManagement = function() {
        showMessage('👥 User management - Firebase version coming soon...', 'info');
    };
    
    window.showAllBookings = function() {
        showMessage('📊 All bookings - Firebase version coming soon...', 'info');
    };
    
    window.showAddUserForm = function() {
        showMessage('➕ Add user - Firebase version coming soon...', 'info');
    };
    
    window.hideAddUserForm = function() {
        const form = document.getElementById('addUserFormContainer');
        if (form) form.style.display = 'none';
    };
    
    // ==================== PASSWORD CHANGE ====================
	window.showChangePasswordModal = async function() {
		console.log('🎯 showChangePasswordModal CALLED!');
		
		try {
			const { state } = await import('./constants.js');
			
			if (!state.currentUser) {
				showMessage('❌ Please login first', 'error');
				return;
			}
			
			const modal = document.getElementById('changePasswordModal');
			const usernameField = document.getElementById('changePasswordUsername');
			
			if (modal && usernameField) {
				// ✅ SOLUTION: PAKAI requestAnimationFrame UNTUK PASTIKAN DOM READY
				requestAnimationFrame(() => {
					usernameField.value = state.currentUser.username;
					console.log('✅ Username set to:', usernameField.value);
				});
				
				modal.style.display = 'block';
				
				// Reset form
				const form = document.getElementById('changePasswordForm');
				if (form) form.reset();
				
				const messageEl = document.getElementById('changePasswordMessage');
				if (messageEl) messageEl.innerHTML = '';
				
				console.log('🔐 Change password modal shown for:', state.currentUser.username);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	};

    window.hideChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('🔐 Change password modal hidden');
        }
    };

    // Setup change password form event listener
    function setupChangePasswordForm() {
        const form = document.getElementById('changePasswordForm');
        if (form) {
            // Remove existing event listener to avoid duplicates
            form.replaceWith(form.cloneNode(true));
            const newForm = document.getElementById('changePasswordForm');
            
            newForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await handleChangePassword();
            });
            
            console.log('✅ Change password form event listener setup');
        } else {
            console.log('⏳ Change password form not found, will retry later');
            // Retry after a delay if form not ready yet
            setTimeout(setupChangePasswordForm, 500);
        }
    }

    // Handle change password
		async function handleChangePassword() {
		try {
        // Import state
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
        
        try {
            showChangePasswordMessage('⏳ Updating password...', 'info');
            
            // Temporarily disable button
            const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';
            }
            
            // Import FirestoreAPI for changePassword function
            const { FirestoreAPI } = await import('./firestore-api.js');
            const result = await FirestoreAPI.changePassword(
                state.currentUser.username,
                currentPassword,
                newPassword
            );
            
            console.log('Change Password API Response:', result);
            
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
                // Re-enable button on error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Password';
                }
            }
            
        } catch (error) {
            console.error('Change Password Error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                // REAL NETWORK ERROR - no internet connection
                showChangePasswordMessage('❌ Network error: Please check your internet connection and try again.', 'error');
            } else {
                // OTHER ERRORS
                showChangePasswordMessage(`❌ Error: ${error.message}`, 'error');
            }
            
            // Re-enable button on error
            const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Password';
            }
        }
     } catch (error) {
        // Error di outer try (import state)
        console.error('Error in handleChangePassword:', error);
        showChangePasswordMessage('❌ Error processing request', 'error');
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

    // Initialize change password form after a short delay
    setTimeout(setupChangePasswordForm, 1000);
    
// ==================== EXPORT FUNCTIONS ====================
window.exportBookings = async function() {
    try {
        showMessage('⏳ Preparing export data...', 'info');
        
        // Create export modal
        showExportModal();
        
    } catch (error) {
        console.error('Export Error:', error);
        showMessage('❌ Export failed: ' + error.message, 'error');
    }
};

function showExportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">📤 Export Bookings Data</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div style="padding: 20px;">
                <div class="form-group">
                    <label>📅 Date Range</label>
                    <select id="exportRange" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.9); color: #000;">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Data</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                
                <div id="customRangeFields" style="display: none; gap: 10px; grid-template-columns: 1fr 1fr;">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="exportStartDate" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.9); color: #000;">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="date" id="exportEndDate" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.9); color: #000;">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>📊 Export Format</label>
                    <select id="exportFormat" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.9); color: #000;">
                        <option value="csv">CSV (Excel)</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
                
                <div class="btn-group" style="margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="generateExport()">
                        📥 Generate Export
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners
    const rangeSelect = document.getElementById('exportRange');
    const customRangeFields = document.getElementById('customRangeFields');
    
    rangeSelect.addEventListener('change', function() {
        customRangeFields.style.display = this.value === 'custom' ? 'grid' : 'none';
        
        // Set default dates for custom range
        if (this.value === 'custom') {
            const today = new Date();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            
            document.getElementById('exportStartDate').value = oneWeekAgo.toISOString().split('T')[0];
            document.getElementById('exportEndDate').value = today.toISOString().split('T')[0];
        }
    });
}

async function generateExport() {
    try {
        const range = document.getElementById('exportRange').value;
        const format = document.getElementById('exportFormat').value;
        let startDate, endDate;
        
        // Calculate date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(range) {
            case 'today':
                startDate = today;
                endDate = new Date(today);
                break;
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                endDate = new Date(today);
                break;
            case 'month':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 30);
                endDate = new Date(today);
                break;
            case 'custom':
                startDate = new Date(document.getElementById('exportStartDate').value);
                endDate = new Date(document.getElementById('exportEndDate').value);
                break;
            case 'all':
            default:
                startDate = null;
                endDate = null;
        }
        
        showMessage('⏳ Loading booking data...', 'info');
        
        // Import FirestoreAPI
        const { FirestoreAPI } = await import('./firestore-api.js');
        const result = await FirestoreAPI.getAllBookingsAdmin();
        
        if (!result.success || !result.bookings || result.bookings.length === 0) {
            showMessage('❌ No booking data found for selected period', 'error');
            return;
        }
        
        // Filter by date range if needed
        let filteredBookings = result.bookings;
        if (startDate && endDate) {
            filteredBookings = result.bookings.filter(booking => {
                const bookingDate = new Date(booking.day);
                return bookingDate >= startDate && bookingDate <= endDate;
            });
        }
        
        if (filteredBookings.length === 0) {
            showMessage('❌ No bookings found for selected period', 'error');
            return;
        }
        
        // Generate export file
        if (format === 'csv') {
            exportToCSV(filteredBookings, startDate, endDate, range);
        } else {
            exportToJSON(filteredBookings, startDate, endDate, range);
        }
        
        // Close modal
        document.querySelector('.modal-overlay').remove();
        showMessage('✅ Export completed successfully!', 'success');
        
    } catch (error) {
        console.error('Export Generation Error:', error);
        showMessage('❌ Export failed: ' + error.message, 'error');
    }
}

function exportToCSV(bookings, startDate, endDate, range) {
    const headers = ['Date', 'Seat', 'Username', 'Booking Time', 'Team'];
    
    const csvData = bookings.map(booking => {
        const team = booking.seat ? booking.seat.split('-')[0] : 'Unknown';
        return [
            booking.day,
            booking.seat,
            booking.userName,
            booking.timestamp ? new Date(booking.timestamp).toLocaleString('en-US') : 'N/A',
            team
        ];
    });
    
    // Add header info
    let csvContent = `Seat Booking System Export\n`;
    csvContent += `Period: ${getRangeDisplayName(range, startDate, endDate)}\n`;
    csvContent += `Generated: ${new Date().toLocaleString('en-US')}\n`;
    csvContent += `Total Records: ${bookings.length}\n\n`;
    
    // Add headers and data
    csvContent += headers.join(',') + '\n';
    csvContent += csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `seat-bookings-${getRangeDisplayName(range, startDate, endDate).toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToJSON(bookings, startDate, endDate, range) {
    const exportData = {
        metadata: {
            title: "Seat Booking System Export",
            period: getRangeDisplayName(range, startDate, endDate),
            generated: new Date().toISOString(),
            totalRecords: bookings.length
        },
        bookings: bookings.map(booking => ({
            date: booking.day,
            seat: booking.seat,
            username: booking.userName,
            bookingTime: booking.timestamp,
            team: booking.seat ? booking.seat.split('-')[0] : 'Unknown'
        }))
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `seat-bookings-${getRangeDisplayName(range, startDate, endDate).toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getRangeDisplayName(range, startDate, endDate) {
    switch(range) {
        case 'today':
            return 'Today';
        case 'week':
            return 'Last 7 Days';
        case 'month':
            return 'Last 30 Days';
        case 'custom':
            return `Custom ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;
        case 'all':
        default:
            return 'All Data';
    }
}
}