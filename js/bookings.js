// js/bookings.js
import { currentUser, currentDate, currentBookings, historicalBookings, TEAMS_CONFIG } from './constants.js';
import { optimizedFetch, optimizedPost } from './api-manager.js';
import { showLoader, showMessage, formatLocalDate, updateLastUpdate } from './utils.js';
import { showFormMessage, hideBookingForm } from './ui.js';

export function initializeBookings() {
    setupDatePicker();
    setupViewToggle();
    loadBookings();
    loadHistoricalBookings();
}

// Date Management
export function setupDatePicker() {
    const datePicker = document.getElementById('datePicker');
    const todayStr = formatLocalDate(new Date());
    datePicker.min = todayStr;
    datePicker.value = todayStr;
    currentDate = new Date(todayStr + 'T00:00:00');
    updateDateDisplay();
    updateNavigationButtons();
    
    datePicker.addEventListener('change', function(e) {
        currentDate = new Date(e.target.value + 'T00:00:00');
        updateDateDisplay();
        updateNavigationButtons();
        loadBookings();
    });
}

export function updateDateDisplay() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    
    const dateString = currentDate.toLocaleDateString('en-US', options);
    document.getElementById('selectedDateDisplay').textContent = dateString;
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US');
    updateNavigationButtons();
}

export function updateNavigationButtons() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const prevDayBtn = document.getElementById('prevDayBtn');
    const isToday = currentDate.getTime() === today.getTime();
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
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate >= today) {
        currentDate = newDate;
        document.getElementById('datePicker').value = formatLocalDate(currentDate);
        updateDateDisplay();
        updateNavigationButtons();
        loadBookings();
    } else {
        showMessage("❌ Tidak bisa memilih tanggal yang sudah lewat", "error");
    }
}

// Bookings Data Management
export async function loadBookings() {
    const day = formatLocalDate(currentDate);
    try {
        const result = await optimizedFetch('getBookings', { day }, true);
        currentBookings = result.bookings || [];
        renderSeatGrid();
        updateLastUpdate();
    } catch (error) {
        showMessage('❌ Failed to load bookings', 'error');
    }
}

export async function loadHistoricalBookings() {
    try {
        const result = await optimizedFetch('getAllBookings', { userName: currentUser.name }, true);
        historicalBookings = result.bookings || [];
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
            const booking = currentBookings.find(b => b.seat === seatCode);
            
            if (booking) {
                const isMyBooking = booking.userName === currentUser.name;
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
    const existingBooking = currentBookings.find(b => b.seat === seatCode);
    if (existingBooking) {
        showMessage(`❌ Maaf, kursi ${seatCode} sudah dibooking oleh ${existingBooking.userName || 'orang lain'}`, "error");
        loadBookings();
        return;
    }

    const dateDisplay = currentDate.toLocaleDateString('en-US', { 
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
            <input type="text" value="${currentUser.name}" readonly style="background: rgba(255,255,255,0.3); color: #fff;">
        </div>
        
        <div class="form-group">
            <label>User ID</label>
            <input type="text" value="${currentUser.username}" readonly style="background: rgba(255,255,255,0.3); color: #fff;">
        </div>
        
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="import('./bookings.js').then(m => m.processBooking('${seatCode}'))">
                ✅ Booking Confirmation
            </button>
            <button type="button" class="btn btn-secondary" onclick="import('./ui.js').then(m => m.hideBookingForm())">
                ❌ Batal
            </button>
        </div>
        
        <div id="message" class="message"></div>
    `;
}

export function showCancelBookingForm(seatCode) {
    const booking = currentBookings.find(b => b.seat === seatCode && b.userName === currentUser.name);
    if (!booking) {
        showMessage("❌ Booking is not found", "error");
        loadBookings();
        return;
    }

    const dateDisplay = currentDate.toLocaleDateString('en-US', { 
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
            <p><strong>Pemesan:</strong> ${currentUser.name}</p>
            <p><strong>User ID:</strong> ${currentUser.username}</p>
        </div>
        <p style="text-align: center; margin-bottom: 20px; color: #ff8888;">
            ⚠️ Are you sure want to cancel this booking?
        </p>
        <div class="btn-group">
            <button type="button" class="btn btn-danger" onclick="import('./bookings.js').then(m => m.processCancelBooking('${seatCode}'))">
                ✅ Yes, Cancel
            </button>
            <button type="button" class="btn btn-secondary" onclick="import('./ui.js').then(m => m.hideBookingForm())">
                ❌ No
            </button>
        </div>
        <div id="message" class="message"></div>
    `;
}

export async function processBooking(seatCode) {
    const day = formatLocalDate(currentDate);
    
    try {
        showFormMessage("⏳ Processing booking...", "info");
        const result = await optimizedPost('submitBooking', { 
            seat: seatCode, 
            userName: currentUser.name, 
            day 
        });
        
        if (result.success) {
            showFormMessage("✅ Success Booking!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully saved!", "success");
                
                // Clear cache and reload data
                import('./api-manager.js').then(({ clearCache }) => clearCache());
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
    const day = formatLocalDate(currentDate);
    
    try {
        showFormMessage("⏳ Cancelling booking...", "info");
        const result = await optimizedPost('cancelBooking', { 
            seat: seatCode, 
            userName: currentUser.name, 
            day 
        });
        
        if (result.success) {
            showFormMessage("✅ Booking has been successfully cancelled!", "success");
            
            setTimeout(async () => {
                hideBookingForm();
                showMessage("✅ Booking has been successfully cancelled!", "success");
                
                // Clear cache and reload data
                import('./api-manager.js').then(({ clearCache }) => clearCache());
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
        if (currentView === 'grid') {
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
    
    if (!historicalBookings || historicalBookings.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
                <p>📭 You don't have any booking history yet.</p>
            </div>
        `;
        return;
    }
    
    const bookingsByDate = {};
    historicalBookings.forEach(booking => {
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
    currentView = 'grid';
}

export function showMapView() {
    document.getElementById('gridView').style.display = 'none';
    document.getElementById('mapView').style.display = 'block';
    document.getElementById('historicalPanel').style.display = 'none';
    
    document.getElementById('mapViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    currentView = 'map';
}