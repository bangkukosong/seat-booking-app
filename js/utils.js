// js/utils.js - VERSI DIPERBAIKI
import { state } from './constants.js';

// ✅ STATE object untuk kompatibilitas dengan admin.js dan user.js
export const STATE = {
    currentUser: null,
    adminEmail: 'admin@voting.com',
    hasVoted: false,
    candidates: []
};

export function formatLocalDate(date) {
    if (!date) return '';
    
    // ✅ FIX: Ensure we're using the correct date
    const targetDate = date instanceof Date ? date : new Date(date);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}`;
    console.log('📅 Formatting date:', date, '→', formatted);
    return formatted;
}

export function showLoader(show = true) {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

export function showMessage(text, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === "error" ? "rgba(255,85,85,0.95)" : 
                    type === "success" ? "rgba(0,255,128,0.95)" : "rgba(255,215,0,0.95)"};
        color: ${type === "info" ? "black" : "white"};
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 4000);
}

export function updateLastUpdate() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = new Date().toLocaleTimeString();
    }
}

export function refreshBookings() {
    import('./api-manager.js').then(({ clearCache }) => {
        clearCache();
    });
    import('./bookings.js').then(({ loadBookings, loadHistoricalBookings }) => {
        loadBookings();
        loadHistoricalBookings();
    });
    showMessage("🔄 Data Refreshed!", "success");
}

// ✅ Fungsi tambahan untuk kompatibilitas
export function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

export function showLoading() {
    showLoader(true);
}

export function hideLoading() {
    showLoader(false);
}