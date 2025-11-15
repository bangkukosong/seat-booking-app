// js/bookings.js - COMPLETE FIXED VERSION
import { state, TEAMS_CONFIG } from './constants.js';
import { optimizedFetch, optimizedPost } from './api-manager.js';
import { showLoader, showMessage, formatLocalDate, updateLastUpdate } from './utils.js';

export function initializeBookings() {
    setupDatePicker();
    setupViewToggle();
    loadBookings();
    loadHistoricalBookings();
}

// Date Management
export function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    
    // ✅ FIX: Always use today's date
    const today = new Date();
    const todayStr = formatLocalDate(today);
    
    datePicker.min = todayStr;
    datePicker.value = todayStr;
    
    // ✅ FIX: Reset to today, not cached wrong date
    state.currentDate = new Date(todayStr + 'T00:00:00');
    
    updateDateDisplay();
    updateNavigationButtons();
    
    console.log('✅ Date initialized to TODAY:', todayStr);
}

export function updateDateDisplay() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    
    const dateString = state.currentDate.toLocaleDateString('en-US', options);
    document.getElementById('selectedDateDisplay').textContent = dateString;
    document.getElementById('currentDate').textContent = state.currentDate.toLocaleDateString('en-US');
    updateNavigationButtons();
}

export function updateNavigationButtons() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const prevDayBtn = document.getElementById('prevDayBtn');
    const isToday = state.currentDate.getTime() === today.getTime();
    prevDayBtn.disabled = isToday;
    
    if (isToday) {
        prevDayBtn.style.opacity = '0.5';
        prevDayBtn.style.cursor = 'not-allowed';
    } else {
        prevDayBtn.style.opacity = '1';
        prevDayBtn.style.cursor = 'pointer';
    }
}

export function changeDate(days) {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + days);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate >= today) {
        state.currentDate = newDate;
        document.getElementById('datePicker').value = formatLocalDate(state.currentDate);
        updateDateDisplay();
        updateNavigationButtons();
        loadBookings();
    } else {
        showMessage("❌ Cannot select past dates", "error");
    }
}

// Bookings Data Management
export async function loadBookings() {
    const day = formatLocalDate(state.currentDate);
    try {
        showLoader(true);
        const result = await optimizedFetch('getBookings', { day }, true);
        state.currentBookings = result.bookings || [];
        renderSeatGrid();
        updateLastUpdate();
    } catch (error) {
        showMessage('❌ Failed to load bookings', 'error');
    } finally {
        showLoader(false);
    }
}

export async function loadHistoricalBookings() {
    try {
        const result = await optimizedFetch('getAllBookings', { userName: state.currentUser.username }, true);
        state.historicalBookings = result.bookings || [];
    } catch (error) {
        console.error('Failed to load historical bookings:', error);
    }
}

// Seat Grid Rendering
export function renderSeatGrid() {
    const grid = document.getElementById('seatGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    let totalAvailable = 0;
    const totalSeats = TEAMS_CONFIG.reduce((sum, team) => sum + team.seats, 0);

    TEAMS_CONFIG.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'seat-grid';
        
        let teamAvailable = 0;
        
        for (let i = 1; i <= team.seats; i++) {
            const seatCode = `${team.name}-${String(i).padStart(2, '0')}`;
            const seat = document.createElement('div');
            const booking = state.currentBookings.find(b => b.seat === seatCode);
            
            if (booking) {
                const isMyBooking = booking.userName === state.currentUser.username;
                seat.className = isMyBooking ? 'seat my-booking' : 'seat booked';
                seat.innerHTML = `
                    ${seatCode}
                    <span class="tooltip">
                        <strong>${isMyBooking ? '📌 Booking Anda' : 'Dibooking oleh:'}</strong><br>
                        ${booking.userName || 'Unknown'}<br>
                        ${booking.timestamp ? new Date(booking.timestamp).toLocaleString('en-US') : 'Today'}
                    </span>
                `;
                seat.onclick = isMyBooking ? () => showCancelBookingForm(seatCode) : null;
                if (!isMyBooking) seat.style.cursor = 'not-allowed';
            } else {
                seat.className = 'seat available';
                seat.textContent = seatCode;
                seat.onclick = () => showBookingForm(seatCode);
                teamAvailable++;
                totalAvailable++;
            }
            gridDiv.appendChild(seat);
        }
        
        teamDiv.innerHTML = `
            <div class="team-title">
                ${team.name} 
                <span style="float: right; font-size: 0.9rem; opacity: 0.8;">
                    (${teamAvailable}/${team.seats})
                </span>
            </div>
        `;
        teamDiv.appendChild(gridDiv);
        grid.appendChild(teamDiv);
    });

    document.getElementById('availableCount').textContent = totalAvailable;
    document.getElementById('totalSeats').textContent = totalSeats;
}

// Booking Forms and Processing
export function showBookingForm(seatCode) {
    const existingBooking = state.currentBookings.find(b => b.seat === seatCode);
    if (existingBooking) {
        showMessage(`❌ Maaf, kursi ${seatCode} sudah dibooking oleh ${existingBooking.userName || 'orang lain'}`, "error");
        loadBookings();
        return;
    }

    const dateDisplay = state.currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const formContainer = document.getElementById("bookingFormContainer");
    formContainer.style.display = "block";
    formContainer.innerHTML = `
        <h2 style="color: var(--primary-green); text-align: center;">💺 Booking ${seatCode}</h2>
        <p style="text-align: center; margin-bottom: 15px; color: var(--gold);">
            📅 ${dateDisplay}
        </p>
        
        <div style="background: rgba(0, 255, 128, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(0, 255, 128, 0.3);">
            <p style="margin: 0; font-size: 0.9rem; color: var(--primary-green);">
                ✅ <strong>Available Seats</strong> - Your Booking Confirmation
            </p>
        </div>
        
        <div class="form-group">
            <label>Order Name</label>
            <input type="text" value="${state.currentUser.name}" readonly style="background: rgba(255,255,255,0.3); color: #fff;">
        </div>
        
        <div class="form-group">
            <label>User ID</label>
            <input type="text" value="${state.currentUser.username}" readonly style="background: rgba(255,255,255,0.3); color: #fff;">
        </div>
        
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="window.processBooking('${seatCode}')">
                ✅ Booking Confirmation
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.hideBookingForm()">
                ❌ Batal
            </button>
        </div>
        
        <div id="message" class="message"></div>
    `;
}

export function showCancelBookingForm(seatCode) {
    const booking = state.currentBookings.find(b => b.seat === seatCode && b.userName === state.currentUser.username);
    if (!booking) {
        showMessage("❌ Booking is not found", "error");
        loadBookings();
        return;
    }

    const dateDisplay = state.currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const formContainer = document.getElementById("bookingFormContainer");
    formContainer.style.display = "block";
    formContainer.innerHTML = `
        <h2 style="color: var(--gold); text-align: center;">❌ Cancel Booking</h2>
        <p style="text-align: center; margin-bottom: 15px; color: var(--gold);">
            📅 ${dateDisplay}
        </p>
        <div style="background: rgba(255, 85, 85, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 85, 85, 0.3);">
            <h3 style="color: #ff5555; margin-bottom: 10px; text-align: center;">${seatCode}</h3>
            <p><strong>Pemesan:</strong> ${state.currentUser.name}</p>
            <p><strong>User ID:</strong> ${state.currentUser.username}</p>
        </div>
        <p style="text-align: center; margin-bottom: 20px; color: #ff8888;">
            ⚠️ Are you sure want to cancel this booking?
        </p>
        <div class="btn-group">
            <button type="button" class="btn btn-danger" onclick="window.processCancelBooking('${seatCode}')">
                ✅ Yes, Cancel
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.hideBookingForm()">
                ❌ No
            </button>
        </div>
        <div id="message" class="message"></div>
    `;
}

export async function processBooking(seatCode) {
    const day = formatLocalDate(state.currentDate);
    
    try {
        showFormMessage("⏳ Processing booking...", "info");
        const result = await optimizedPost('submitBooking', { 
            seat: seatCode, 
            userName: state.currentUser.username, 
            day 
        });
        
        if (result.success) {
            showFormMessage("✅ Success Booking!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully saved!", "success");
                
                // FIX: Direct import tanpa dynamic
                const { clearCache } = await import('./api-manager.js');
                clearCache();
                await loadBookings();
                await loadHistoricalBookings();
            }, 1000);
            
        } else {
            showFormMessage(`❌ ${result.message}`, "error");
        }
    } catch (error) {
        showFormMessage("❌ Error: Gagal terhubung ke server", "error");
    }
}

export async function processCancelBooking(seatCode) {
    const day = formatLocalDate(state.currentDate);
    
    try {
        showFormMessage("⏳ Cancelling booking...", "info");
        const result = await optimizedPost('cancelBooking', { 
            seat: seatCode, 
            userName: state.currentUser.username, 
            day 
        });
        
        if (result.success) {
            showFormMessage("✅ Booking has been successfully cancelled!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully cancelled!", "success");
                
                // FIX: Direct import tanpa dynamic
                const { clearCache } = await import('./api-manager.js');
                clearCache();
                await loadBookings();
                await loadHistoricalBookings();
            }, 1000);
            
        } else {
            showFormMessage(`❌ ${result.message}`, "error");
        }
    } catch (error) {
        showFormMessage("❌ Error: Gagal terhubung ke server", "error");
    }
}

// Helper function untuk form messages
function showFormMessage(text, type) {
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

function hideBookingForm() {
    const formContainer = document.getElementById("bookingFormContainer");
    if (formContainer) {
        formContainer.style.display = "none";
    }
}

// Historical Bookings
export function toggleHistorical() {
    const panel = document.getElementById('historicalPanel');
    const gridView = document.getElementById('gridView');
    const mapView = document.getElementById('mapView');
    
    if (panel.style.display === 'none') {
        renderHistoricalBookings();
        panel.style.display = 'block';
        gridView.style.display = 'none';
        mapView.style.display = 'none';
        
        document.getElementById('gridViewBtn').classList.remove('active');
        document.getElementById('mapViewBtn').classList.remove('active');
    } else {
        panel.style.display = 'none';
        if (state.currentView === 'grid') {
            gridView.style.display = 'block';
            document.getElementById('gridViewBtn').classList.add('active');
        } else {
            mapView.style.display = 'block';
            document.getElementById('mapViewBtn').classList.add('active');
        }
    }
}

export function renderHistoricalBookings() {
    const content = document.getElementById('historicalContent');
    
    if (!state.historicalBookings || state.historicalBookings.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
                <p>📭 You don't have any booking history yet.</p>
            </div>
        `;
        return;
    }
    
    const bookingsByDate = {};
    state.historicalBookings.forEach(booking => {
        if (booking && booking.day) {
            if (!bookingsByDate[booking.day]) {
                bookingsByDate[booking.day] = [];
            }
            bookingsByDate[booking.day].push(booking);
        }
    });
    
    const sortedDates = Object.keys(bookingsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    content.innerHTML = sortedDates.map(date => {
        const bookings = bookingsByDate[date];
        const dateObj = new Date(date);
        const dateDisplay = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `
            <div class="historical-item">
                <div class="historical-date">${dateDisplay}</div>
                <div class="historical-seats">
                    ${bookings.map(booking => `
                        <span class="historical-seat">${booking.seat || 'Unknown'}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// View Management
function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', showGridView);
    }
    if (mapViewBtn) {
        mapViewBtn.addEventListener('click', showMapView);
    }
}

export function showGridView() {
    document.getElementById('gridView').style.display = 'block';
    document.getElementById('mapView').style.display = 'none';
    document.getElementById('historicalPanel').style.display = 'none';
    
    document.getElementById('gridViewBtn').classList.add('active');
    document.getElementById('mapViewBtn').classList.remove('active');
    state.currentView = 'grid';
}

function showMapView() {
    document.getElementById('gridView').style.display = 'none';
    document.getElementById('mapView').style.display = 'block';
    document.getElementById('historicalPanel').style.display = 'none';
    
    document.getElementById('mapViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    state.currentView = 'map';
}

// Export semua functions
export {
    initializeBookings,
    setupDatePicker,
    updateDateDisplay,
    changeDate,
    loadBookings,
    loadHistoricalBookings,
    renderSeatGrid,
    showBookingForm,
    showCancelBookingForm,
    processBooking,
    processCancelBooking,
    toggleHistorical,
    renderHistoricalBookings,
    showGridView,
    showMapView

};
