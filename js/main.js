// js/main.js
import { initializeAuth } from './auth.js';
import { setupGlobalEventListeners } from './ui.js';

// Global function untuk HTML onclick attributes
window.logout = function() {
    import('./auth.js').then(module => module.logout());
};

window.changeDate = function(days) {
    import('./bookings.js').then(module => module.changeDate(days));
};

window.showGridView = function() {
    import('./bookings.js').then(module => module.showGridView());
};

window.showMapView = function() {
    import('./bookings.js').then(module => module.showMapView());
};

window.refreshBookings = function() {
    import('./utils.js').then(module => module.refreshBookings());
};

window.toggleHistorical = function() {
    import('./bookings.js').then(module => module.toggleHistorical());
};

window.showChangePasswordModal = function() {
    import('./user.js').then(module => module.showChangePasswordModal());
};

window.hideChangePasswordModal = function() {
    import('./user.js').then(module => module.hideChangePasswordModal());
};

window.showAddUserForm = function() {
    import('./admin.js').then(module => module.showAddUserForm());
};

window.hideAddUserForm = function() {
    import('./admin.js').then(module => module.hideAddUserForm());
};

window.showUserManagement = function() {
    import('./admin.js').then(module => module.showUserManagement());
};

window.showAllBookings = function() {
    import('./admin.js').then(module => module.showAllBookings());
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Bangku Kosong App Initializing...');
    
    // Setup global UI listeners
    setupGlobalEventListeners();
    
    // Initialize auth system
    initializeAuth();
    
    console.log('✅ App initialized successfully!');
});