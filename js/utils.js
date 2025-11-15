// js/utils.js
import { currentDate } from './constants.js';

export function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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