// admin-modals.js - Professional Admin Modal Functions v1.0.0
export function showUserManagementModal(users) {
    console.log('👥 User Management - Users:', users);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); padding: 25px; border-radius: 15px; 
                   width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;
                   border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--admin-purple); margin: 0;">👥 User Management</h2>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="background: none; border: none; color: #ff5555; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>Total Users: <strong>${users?.length || 0}</strong></p>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                ${renderUsersList(users)}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="btn btn-secondary" style="padding: 10px 20px;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

export function showAllBookingsModal(bookings) {
    console.log('📋 All Bookings - Bookings:', bookings);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); padding: 25px; border-radius: 15px; 
                   width: 90%; max-width: 1000px; max-height: 80vh; overflow-y: auto;
                   border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-blue); margin: 0;">📋 All Bookings</h2>
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="background: none; border: none; color: #ff5555; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>Total Bookings: <strong>${bookings?.length || 0}</strong></p>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                ${renderBookingsList(bookings)}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.closest('.modal-overlay').remove()" 
                        class="btn btn-secondary" style="padding: 10px 20px;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Helper functions
function renderUsersList(users) {
    if (!users || users.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.7);">No users found</p>';
    }
    
    return `
        <div style="display: grid; gap: 10px;">
            ${users.map(user => `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary-green);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: white;">${user.name || 'N/A'}</strong>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">${user.username}</div>
                        </div>
                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; 
                              background: ${user.role === 'admin' ? 'rgba(255,215,0,0.3)' : 
                                         user.role === 'super_admin' ? 'rgba(255,0,0,0.3)' : 
                                         'rgba(0,255,128,0.3)'};
                              color: ${user.role === 'admin' ? '#ffd700' : 
                                     user.role === 'super_admin' ? '#ff5555' : 
                                     '#00ff80'};">
                            ${user.role || 'user'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBookingsList(bookings) {
    if (!bookings || bookings.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.7);">No bookings found</p>';
    }
    
    // Group by date
    const bookingsByDate = {};
    bookings.forEach(booking => {
        const date = booking.day || booking.bookingDate || 'Unknown';
        if (!bookingsByDate[date]) {
            bookingsByDate[date] = [];
        }
        bookingsByDate[date].push(booking);
    });
    
    return Object.entries(bookingsByDate).map(([date, dateBookings]) => `
        <div style="margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
            <h3 style="color: var(--gold); margin: 0 0 10px 0; font-size: 1.1rem;">
                📅 ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                ${dateBookings.map(booking => `
                    <div style="background: rgba(0,255,128,0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(0,255,128,0.3);">
                        <div style="font-weight: bold; color: var(--primary-green);">${booking.seat}</div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">${booking.userName}</div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                            ${booking.bookingTime ? new Date(booking.bookingTime.seconds * 1000).toLocaleTimeString() : 'Today'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}