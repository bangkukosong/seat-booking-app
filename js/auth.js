// js/auth.js

// ==================== AUTHENTICATION ====================
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  
  if (!u || !p) {
    document.getElementById('loginMessage').innerText = '⚠️ User ID dan password harus diisi';
    return;
  }

  showLoader(true);
  const res = await optimizedPost('login', { username: u, password: p });
  showLoader(false);

  if (res.success && res.user) {
    currentUser = res.user;
    showMainApp();
  } else {
    document.getElementById('loginMessage').innerText = res.message || 'Login gagal';
  }
});

async function showMainApp() {
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('userInfo').innerHTML = `🧑‍💻 <strong>${currentUser.name}</strong>`;

  if (currentUser.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'block';
    });
  }

  setupDatePicker();
  showLoader(true);
  await Promise.all([loadBookings(), loadHistoricalBookings()]);
  showLoader(false);
  showGridView();
}

function logout() {
  currentUser = null;
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginFormContainer').style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  Object.keys(API_CACHE).forEach(key => delete API_CACHE[key]);
}
