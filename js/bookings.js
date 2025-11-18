// Seat Grid Rendering - ✅ FIXED VERSION with Date Display
export function renderSeatGrid() {
    const grid = document.getElementById('seatGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    let totalAvailable = 0;
    const totalSeats = TEAMS_CONFIG.reduce((sum, team) => sum + team.totalSeats, 0);

    TEAMS_CONFIG.forEach(team => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        const gridDiv = document.createElement('div');
        gridDiv.className = 'seat-grid';
        
        let teamAvailable = 0;
        
        for (let i = 1; i <= team.totalSeats; i++) {
            const seatCode = `${team.name}-${String(i).padStart(2, '0')}`;
            const seat = document.createElement('div');
            const booking = state.currentBookings.find(b => b.seat === seatCode);
            
            if (booking) {
                const isMyBooking = booking.userName === state.currentUser.username;
                seat.className = isMyBooking ? 'seat my-booking' : 'seat booked';
                
                // ✅ FIXED: Date handling dengan error prevention - TAMPILKAN TANGGAL DAN JAM
                let bookingTimeDisplay = 'Today';
                let bookingDateDisplay = '';
                
                if (booking.bookingTime) {
                    try {
                        const bookingDate = booking.bookingTime?.toDate?.() || new Date(booking.bookingTime);
                        if (!isNaN(bookingDate.getTime())) {
                            // Format tanggal
                            bookingDateDisplay = bookingDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                            
                            // Format waktu
                            bookingTimeDisplay = bookingDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        }
                    } catch (error) {
                        console.log('Date formatting error:', error);
                    }
                }
                
                seat.innerHTML = `
                    ${seatCode}
                    <span class="tooltip">
                        <strong>${isMyBooking ? '📌 Your Booking' : 'Booked by:'}</strong><br>
                        ${booking.userName || 'Unknown'}<br>
                        📅 ${bookingDateDisplay}<br>
                        ⏰ ${bookingTimeDisplay}
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
                ${team.displayName} 
                <span style="float: right; font-size: 0.9rem; opacity: 0.8;">
                    (${teamAvailable}/${team.totalSeats})
                </span>
            </div>
        `;
        teamDiv.appendChild(gridDiv);
        grid.appendChild(teamDiv);
    });

    document.getElementById('availableCount').textContent = totalAvailable;
    document.getElementById('totalSeats').textContent = totalSeats;
}