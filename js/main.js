// js/main.js - FIXED VERSION (Global Functions Added)
import { initializeAuth } from './auth.js';
import { showLoader, showMessage } from './utils.js';

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
    window.showChangePasswordModal = function() {
        showMessage('🔐 Change password - Firebase version coming soon...', 'info');
    };
    
    window.hideChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.style.display = 'none';
    };
    
    // ==================== EXPORT ====================
    window.exportBookings = function() {
        showMessage('📤 Export data - Firebase version coming soon...', 'info');
    };
    
    console.log('✅ Global functions setup completed');
}