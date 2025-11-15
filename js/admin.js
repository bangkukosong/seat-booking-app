import { auth, db } from './firebase.js';
import { 
  showSection, 
  showLoading, 
  hideLoading, 
  showMessage,
  STATE 
} from './utils.js';

export function initAdmin() {
  setupAdminEventListeners();
  checkAdminAuth();
}

function setupAdminEventListeners() {
  document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
  document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);
  document.getElementById('addCandidateBtn').addEventListener('click', showAddCandidateForm);
  document.getElementById('saveCandidateBtn').addEventListener('click', saveCandidate);
  document.getElementById('cancelCandidateBtn').addEventListener('click', hideAddCandidateForm);
}

function checkAdminAuth() {
  auth.onAuthStateChanged((user) => {
    if (user && user.email === STATE.adminEmail) {
      showAdminDashboard();
      loadCandidates();
    } else {
      showAdminLogin();
    }
  });
}

async function adminLogin() {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  
  if (!email || !password) {
    showMessage('Please fill all fields', 'error');
    return;
  }

  showLoading();
  try {
    await auth.signInWithEmailAndPassword(email, password);
    STATE.adminEmail = email;
    showMessage('Admin login successful!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Login failed: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function adminLogout() {
  showLoading();
  try {
    await auth.signOut();
    STATE.adminEmail = null;
    showMessage('Logged out successfully', 'success');
    showAdminLogin();
  } catch (error) {
    showMessage('Logout error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

function showAdminLogin() {
  showSection('adminLogin');
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPassword').value = '';
}

function showAdminDashboard() {
  showSection('adminDashboard');
}

function showAddCandidateForm() {
  document.getElementById('addCandidateForm').style.display = 'block';
  document.getElementById('candidateName').value = '';
  document.getElementById('candidatePhoto').value = '';
}

function hideAddCandidateForm() {
  document.getElementById('addCandidateForm').style.display = 'none';
}

async function saveCandidate() {
  const name = document.getElementById('candidateName').value;
  const photo = document.getElementById('candidatePhoto').value;

  if (!name) {
    showMessage('Please enter candidate name', 'error');
    return;
  }

  showLoading();
  try {
    await db.collection('candidates').add({
      name: name,
      photo: photo || '/api/placeholder/100/100',
      votes: 0,
      createdAt: new Date()
    });
    
    showMessage('Candidate added successfully!', 'success');
    hideAddCandidateForm();
    loadCandidates();
  } catch (error) {
    showMessage('Error adding candidate: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function loadCandidates() {
  try {
    const snapshot = await db.collection('candidates').get();
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    displayCandidates(candidates);
    displayResults(candidates);
  } catch (error) {
    console.error('Error loading candidates:', error);
  }
}

function displayCandidates(candidates) {
  const container = document.getElementById('candidatesList');
  container.innerHTML = '';

  candidates.forEach(candidate => {
    const candidateDiv = document.createElement('div');
    candidateDiv.className = 'candidate-item';
    candidateDiv.innerHTML = `
      <img src="${candidate.photo}" alt="${candidate.name}" width="50">
      <span>${candidate.name}</span>
      <span>Votes: ${candidate.votes || 0}</span>
      <button onclick="deleteCandidate('${candidate.id}')" class="btn-danger">Delete</button>
    `;
    container.appendChild(candidateDiv);
  });
}

function displayResults(candidates) {
  const container = document.getElementById('resultsList');
  container.innerHTML = '';

  const sortedCandidates = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0));

  sortedCandidates.forEach((candidate, index) => {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    resultDiv.innerHTML = `
      <span>${index + 1}. ${candidate.name}</span>
      <span>${candidate.votes || 0} votes</span>
    `;
    container.appendChild(resultDiv);
  });
}

// Make deleteCandidate available globally
window.deleteCandidate = async function(candidateId) {
  if (!confirm('Are you sure you want to delete this candidate?')) return;

  showLoading();
  try {
    await db.collection('candidates').doc(candidateId).delete();
    showMessage('Candidate deleted successfully!', 'success');
    loadCandidates();
  } catch (error) {
    showMessage('Error deleting candidate: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
};