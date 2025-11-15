// js/ui.js
import { showMessage } from './utils.js';

// Form Management
export function showFormMessage(text, type) {
    const messageEl = document.getElementById("message");
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.style.background = type === "error" ? "rgba(255,85,85,0.3)" : 
                                type === "info" ? "rgba(255,215,0,0.3)" : "rgba(0,255,128,0.3)";
        messageEl.style.color = type === "error" ? "#ff5555" : 
                           type === "info" ? "#ffd700" : "#00ff80";
        messageEl.style.padding = "12px";
        messageEl.style.borderRadius = "8px";
        messageEl.style.textAlign = "center";
        messageEl.style.marginTop = "15px";
        messageEl.style.border = type === "error" ? "1px solid rgba(255,85,85,0.5)" : 
                             type === "info" ? "1px solid rgba(255,215,0,0.5)" : "1px solid rgba(0,255,128,0.5)";
    }
}

export function hideBookingForm() {
    const formContainer = document.getElementById("bookingFormContainer");
    if (formContainer) {
        formContainer.style.display = "none";
    }
}

// Modal Management
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// UI Components
export function setupGlobalEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });

    // Close buttons
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}