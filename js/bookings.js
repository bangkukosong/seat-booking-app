// js/bookings.js

// ==================== BOOKINGS MANAGEMENT ====================
function setupDatePicker() {
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

function updateDateDisplay() {
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

function updateNavigationButtons() {
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

function changeDate(days) {
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

async function loadBookings() {
  const day = formatLocalDate(currentDate);
  const res = await optimizedFetch('getBookings', { day }, true);
  currentBookings = res.bookings || [];
  renderSeatGrid();
  updateLastUpdate();
}

async function loadHistoricalBookings() {
  const res = await optimizedFetch('getAllBookings', { userName: currentUser.name }, true);
  historicalBookings = res.bookings || [];
}

// LANJUTKAN DENGAN FUNGSI renderSeatGrid, showBookingForm, dll...
// Copy dari file index.html yang asli