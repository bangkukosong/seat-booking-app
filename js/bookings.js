// js/bookings.js - COMPLETE FIXED VERSION (ENGLISH)
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
    if (!datePicker) {
        console.error('❌ Date picker element not found!');
        return;
    }
    
    console.log('🔧 Setting up date picker...');
    
    // ✅ FIX: CLEAN SLATE - REMOVE EXISTING & CREATE NEW
    const newDatePicker = datePicker.cloneNode(true);
    datePicker.parentNode.replaceChild(newDatePicker, datePicker);
    
    // Set initial date
    const todayStr = formatLocalDate(new Date());
    newDatePicker.min = todayStr;
    newDatePicker.value = todayStr;
    state.currentDate = new Date(todayStr + 'T00:00:00');
    
    updateDateDisplay();
    updateNavigationButtons();
    
    // ✅ FIX: ADD PROPER EVENT LISTENER
    newDatePicker.addEventListener('change', async function(e) {
        console.log('🎯 DATE PICKER CHANGE:', e.target.value);
        
        // UPDATE STATE
        state.currentDate = new Date(e.target.value + 'T00:00:00');
        console.log('📅 State updated to:', state.currentDate);
        
        // UPDATE UI AND LOAD DATA
        try {
            updateDateDisplay();
            updateNavigationButtons();
            await loadBookings();
            console.log('✅ Date change completed successfully!');
        } catch (error) {
            console.error('❌ Date change failed:', error);
        }
    });
    
    console.log('✅ Date picker setup completed with working event listener');
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
                        <strong>${isMyBooking ? '📌 Your Booking' : 'Booked by:'}</strong><br>
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
    // ✅ CHECK 1: Seat already booked by someone else (CLIENT-SIDE)
    const existingBooking = state.currentBookings.find(b => b.seat === seatCode);
    if (existingBooking) {
        showMessage(`❌ Sorry, seat ${seatCode} is already booked by ${existingBooking.userName || 'someone else'}`, "error");
        loadBookings(); // Refresh to show current status
        return;
    }

    // ✅ CHECK 2: User already booked another seat today (CLIENT-SIDE)
    const userExistingBooking = state.currentBookings.find(b => b.userName === state.currentUser.username);
    if (userExistingBooking) {
        // ✅ SHOW INFORMATIVE FORM INSTEAD OF SIMPLE MESSAGE
        const dateDisplay = state.currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const formContainer = document.getElementById("bookingFormContainer");
        formContainer.style.display = "block";
        formContainer.innerHTML = `
            <h2 style="color: #ff5555; text-align: center;">⚠️ Already Have Booking</h2>
            <p style="text-align: center; margin-bottom: 15px; color: var(--gold);">
                📅 ${dateDisplay}
            </p>
            
            <div style="background: rgba(255, 85, 85, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(255, 85, 85, 0.3);">
                <h3 style="color: #ff5555; margin-bottom: 10px; text-align: center;">${userExistingBooking.seat}</h3>
                <p><strong>Booked by:</strong> ${state.currentUser.name}</p>
                <p><strong>User ID:</strong> ${state.currentUser.username}</p>
                <p><strong>Status:</strong> <span style="color: #ff5555;">❌ Already Booked</span></p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 215, 0, 0.3);">
                <p style="margin: 0; font-size: 0.9rem; color: var(--gold); text-align: center;">
                    ⚠️ <strong>Booking Policy:</strong> Each user can only book 1 seat per day
                </p>
            </div>
            
            <p style="text-align: center; margin-bottom: 20px; color: #ff8888;">
                Please cancel your existing booking first to make a new booking.
            </p>
            
            <div class="btn-group">
                <button type="button" class="btn btn-danger" onclick="window.showCancelBookingForm('${userExistingBooking.seat}')">
                    🗑️ Cancel Existing Booking
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.hideBookingForm()">
                    ✅ Close
                </button>
            </div>
            
            <div id="message" class="message"></div>
        `;
        return;
    }

    // ✅ CONTINUE TO NORMAL BOOKING FORM IF ALL CHECKS PASS
    const dateDisplay = state.currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const formContainer = document.getElementById("bookingFormContainer");
    formContainer.style.display = "block";
    formContainer.innerHTML = `
        <h2 style="color: var(--primary-green); text-align: center;">💺 Book ${seatCode}</h2>
        <p style="text-align: center; margin-bottom: 15px; color: var(--gold);">
            📅 ${dateDisplay}
        </p>
        
        <div style="background: rgba(0, 255, 128, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid rgba(0, 255, 128, 0.3);">
            <h3 style="color: var(--primary-green); margin-bottom: 10px; text-align: center;">${seatCode}</h3>
            <p><strong>Booked by:</strong> ${state.currentUser.name}</p>
            <p><strong>User ID:</strong> ${state.currentUser.username}</p>
            <p><strong>Status:</strong> <span style="color: var(--primary-green);">✅ Available</span></p>
        </div>
        
        <div style="background: rgba(255, 215, 0, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 215, 0, 0.3);">
            <p style="margin: 0; font-size: 0.9rem; color: var(--gold); text-align: center;">
                ⚠️ <strong>Note:</strong> You can only book 1 seat per day
            </p>
        </div>
        
        <p style="text-align: center; margin-bottom: 20px; color: #88ff88;">
            ✅ Confirm booking for this seat?
        </p>
        
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="window.processBooking('${seatCode}')">
                ✅ Confirm Booking
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.hideBookingForm()">
                ❌ Cancel
            </button>
        </div>
        
        <div id="message" class="message"></div>
    `;
}

export function showCancelBookingForm(seatCode) {
    const booking = state.currentBookings.find(b => b.seat === seatCode && b.userName === state.currentUser.username);
    if (!booking) {
        showMessage("❌ Booking not found", "error");
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
            <p><strong>Booked by:</strong> ${state.currentUser.name}</p>
            <p><strong>User ID:</strong> ${state.currentUser.username}</p>
        </div>
        <p style="text-align: center; margin-bottom: 20px; color: #ff8888;">
            ⚠️ Are you sure you want to cancel this booking?
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
            showFormMessage("✅ Booking Successful!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully saved!", "success");
                
                // Clear cache and refresh data
                const { clearCache } = await import('./api-manager.js');
                clearCache();
                await loadBookings();
                await loadHistoricalBookings();
            }, 1000);
            
        } else {
            // ✅ HANDLE DOUBLE BOOKING ERRORS FROM SERVER
            showFormMessage(`❌ ${result.message}`, "error");
            
            // Refresh data to show current status
            setTimeout(async () => {
                const { clearCache } = await import('./api-manager.js');
                clearCache();
                await loadBookings();
            }, 1500);
        }
    } catch (error) {
        showFormMessage("❌ Error: Failed to connect to server", "error");
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
            showFormMessage("✅ Booking successfully cancelled!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully cancelled!", "success");
                
                const { clearCache } = await import('./api-manager.js');
                clearCache();
                await loadBookings();
                await loadHistoricalBookings();
            }, 1000);
            
        } else {
            showFormMessage(`❌ ${result.message}`, "error");
        }
    } catch (error) {
        showFormMessage("❌ Error: Failed to connect to server", "error");
    }
}

// Helper function for form messages
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

export function showMapView() {
    document.getElementById('gridView').style.display = 'none';
    document.getElementById('mapView').style.display = 'block';
    document.getElementById('historicalPanel').style.display = 'none';
    
    document.getElementById('mapViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    state.currentView = 'map';
}

// ✅ EXPORT FUNCTIONS TO WINDOW OBJECT
window.showBookingForm = showBookingForm;
window.hideBookingForm = hideBookingForm;
window.processBooking = processBooking;
window.processCancelBooking = processCancelBooking;
window.showCancelBookingForm = showCancelBookingForm;
window.changeDate = changeDate;
window.toggleHistorical = toggleHistorical;
window.showGridView = showGridView;
window.showMapView = showMapView;