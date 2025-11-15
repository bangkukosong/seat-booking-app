// js/main.js - FIREBASE SEAT BOOKING MAIN
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
    
    // View Toggles
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
    
    // Date Navigation
    window.changeDate = function(days) {
        console.log(`📅 Changing date by ${days} days`);
        // Akan dihandle oleh bookings.js
        showMessage('Date change feature loading...', 'info');
    };
    
    // Admin Functions
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
    
    // Password Change
    window.showChangePasswordModal = function() {
        showMessage('🔐 Change password - Firebase version coming soon...', 'info');
    };
    
    window.hideChangePasswordModal = function() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) modal.style.display = 'none';
    };
    
    // Refresh Bookings
    window.refreshBookings = function() {
        showMessage('🔄 Refresh - Firebase real-time updates active', 'info');
    };
    
    window.toggleHistorical = function() {
        showMessage('📚 History - Firebase version coming soon...', 'info');
    };
    
    window.exportBookings = function() {
        showMessage('📤 Export data - Firebase version coming soon...', 'info');
    };
    
    console.log('✅ Global functions setup completed');
}