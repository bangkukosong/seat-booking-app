// js/auth.js - Firebase Authentication Version

// Login with Firebase Auth
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showLoginMessage('⚠️ User ID dan password harus diisi', 'error');
    return;
  }

  try {
    showLoader(true);
    
    // Convert username to internal email format
    const email = `${username}@bangkukosong.internal`;
    
    console.log('🔐 Attempting login:', email);
    
    // Firebase Auth login
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Get additional user data from Firestore
    const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      currentUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        username: username,
        name: userData.name,
        role: userData.role
      };
      
      console.log('✅ Login successful:', currentUser);
      showMainApp();
    } else {
      throw new Error('User data not found in database');
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    let errorMessage = 'Login gagal. Silakan coba lagi.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'User tidak ditemukan.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Password salah.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format user ID tidak valid.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Terlalu banyak percobaan login. Coba lagi nanti.';
        break;
    }
    
    showLoginMessage(errorMessage, 'error');
  } finally {
    showLoader(false);
  }
});

// Auto login check
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('🔄 User already logged in:', user.email);
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        currentUser = {
          uid: user.uid,
          email: user.email,
          username: userData.username,
          name: userData.name,
          role: userData.role
        };
        showMainApp();
      } else {
        await auth.signOut();
        showLoginMessage('Data user tidak lengkap. Silakan login kembali.', 'error');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await auth.signOut();
    }
  } else {
    console.log('👤 No user logged in');
    showLoginForm();
  }
});

function showMainApp() {
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('userInfo').innerHTML = `🧑‍💻 <strong>${currentUser.name}</strong>`;

  if (currentUser.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'inline-block';
    });
  }

  setupDatePicker();
  showLoader(true);
  loadBookings();
  showLoader(false);
  showGridView();
}

function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginMessage').innerText = '';
    console.log('✅ Logout successful');
  }).catch(error => {
    console.error('❌ Logout error:', error);
  });
}

function showLoginForm() {
  document.getElementById('loginFormContainer').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showLoginMessage(message, type = 'error') {
  const color = type === 'error' ? '#ff6b6b' : '#51cf66';
  document.getElementById('loginMessage').innerHTML = 
    `<div style="color: ${color}; text-align: center; font-size: 0.8rem; margin-top: 10px;">${message}</div>`;
}

function showLoader(show) {
  document.getElementById('globalLoader').style.display = show ? 'flex' : 'none';
}
