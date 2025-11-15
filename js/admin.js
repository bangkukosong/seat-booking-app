// js/admin.js - FULL VERSION WITH NULL CHECKS
import { auth, db } from './firebase-config.js';
import { 
    showLoader, 
    showMessage,
    showSection,
    STATE 
} from './utils.js';

let adminInitialized = false;

export async function initAdmin() {
    if (adminInitialized) {
        console.log('⚠️ Admin already initialized');
        return;
    }
    
    // Check if admin sections exist on this page
    const adminLoginSection = document.getElementById('adminLogin');
    const adminDashboardSection = document.getElementById('adminDashboard');
    
    if (!adminLoginSection && !adminDashboardSection) {
        console.log('❌ Admin sections not found - skipping admin initialization');
        return;
    }
    
    console.log('🔧 Initializing admin module...');
    
    try {
        setupAdminEventListeners();
        await checkAdminAuth();
        adminInitialized = true;
        console.log('✅ Admin module initialized successfully');
    } catch (error) {
        console.error('❌ Admin initialization failed:', error);
        showMessage('Admin module failed to initialize', 'error');
    }
}

function setupAdminEventListeners() {
    console.log('🔧 Setting up admin event listeners...');
    
    const loginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const saveCandidateBtn = document.getElementById('saveCandidateBtn');
    const cancelCandidateBtn = document.getElementById('cancelCandidateBtn');
    
    // Add event listeners only if elements exist
    if (loginBtn) {
        loginBtn.addEventListener('click', adminLogin);
        console.log('✅ adminLoginBtn listener added');
    } else {
        console.log('⚠️ adminLoginBtn not found');
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', adminLogout);
        console.log('✅ adminLogoutBtn listener added');
    }
    
    if (addCandidateBtn) {
        addCandidateBtn.addEventListener('click', showAddCandidateForm);
        console.log('✅ addCandidateBtn listener added');
    }
    
    if (saveCandidateBtn) {
        saveCandidateBtn.addEventListener('click', saveCandidate);
        console.log('✅ saveCandidateBtn listener added');
    }
    
    if (cancelCandidateBtn) {
        cancelCandidateBtn.addEventListener('click', hideAddCandidateForm);
        console.log('✅ cancelCandidateBtn listener added');
    }
}

async function checkAdminAuth() {
    return new Promise((resolve) => {
        // Delay auth state listener to ensure DOM is ready
        setTimeout(() => {
            auth.onAuthStateChanged((user) => {
                console.log('🔐 Auth state changed:', user?.email);
                
                if (user && user.email === STATE.adminEmail) {
                    showAdminDashboard();
                    loadCandidates();
                } else {
                    showAdminLogin();
                }
                resolve();
            });
        }, 100);
    });
}

async function adminLogin() {
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    
    if (!emailInput || !passwordInput) {
        showMessage('Admin login form not found', 'error');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    showLoader(true);
    try {
        await auth.signInWithEmailAndPassword(email, password);
        STATE.adminEmail = email;
        showMessage('Admin login successful!', 'success');
        console.log('✅ Admin logged in:', email);
    } catch (error) {
        console.error('❌ Admin login error:', error);
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

async function adminLogout() {
    showLoader(true);
    try {
        await auth.signOut();
        STATE.adminEmail = null;
        showMessage('Logged out successfully', 'success');
        showAdminLogin();
        console.log('✅ Admin logged out');
    } catch (error) {
        console.error('❌ Admin logout error:', error);
        showMessage('Logout error: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

function showAdminLogin() {
    const adminLoginSection = document.getElementById('adminLogin');
    const adminDashboardSection = document.getElementById('adminDashboard');
    
    if (adminLoginSection) {
        adminLoginSection.style.display = 'block';
    }
    
    if (adminDashboardSection) {
        adminDashboardSection.style.display = 'none';
    }
    
    // Clear form fields
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    console.log('🔐 Showing admin login');
}

function showAdminDashboard() {
    const adminLoginSection = document.getElementById('adminLogin');
    const adminDashboardSection = document.getElementById('adminDashboard');
    
    if (adminLoginSection) {
        adminLoginSection.style.display = 'none';
    }
    
    if (adminDashboardSection) {
        adminDashboardSection.style.display = 'block';
    }
    
    console.log('📊 Showing admin dashboard');
}

function showAddCandidateForm() {
    const form = document.getElementById('addCandidateForm');
    const nameInput = document.getElementById('candidateName');
    const photoInput = document.getElementById('candidatePhoto');
    
    if (form) {
        form.style.display = 'block';
    }
    
    if (nameInput) nameInput.value = '';
    if (photoInput) photoInput.value = '';
    
    console.log('👤 Showing add candidate form');
}

function hideAddCandidateForm() {
    const form = document.getElementById('addCandidateForm');
    if (form) {
        form.style.display = 'none';
    }
    console.log('❌ Hiding add candidate form');
}

async function saveCandidate() {
    const nameInput = document.getElementById('candidateName');
    const photoInput = document.getElementById('candidatePhoto');
    
    if (!nameInput) {
        showMessage('Candidate name input not found', 'error');
        return;
    }
    
    const name = nameInput.value;
    const photo = photoInput?.value || '';

    if (!name) {
        showMessage('Please enter candidate name', 'error');
        return;
    }

    showLoader(true);
    try {
        await db.collection('candidates').add({
            name: name,
            photo: photo || '/api/placeholder/100/100',
            votes: 0,
            createdAt: new Date()
        });
        
        showMessage('Candidate added successfully!', 'success');
        hideAddCandidateForm();
        await loadCandidates();
        console.log('✅ Candidate added:', name);
    } catch (error) {
        console.error('❌ Error adding candidate:', error);
        showMessage('Error adding candidate: ' + error.message, 'error');
    } finally {
        showLoader(false);
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
        console.log('✅ Loaded candidates:', candidates.length);
    } catch (error) {
        console.error('❌ Error loading candidates:', error);
        showMessage('Error loading candidates', 'error');
    }
}

function displayCandidates(candidates) {
    const container = document.getElementById('candidatesList');
    if (!container) {
        console.log('⚠️ candidatesList container not found');
        return;
    }
    
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
    if (!container) {
        console.log('⚠️ resultsList container not found');
        return;
    }
    
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

// Global function for candidate deletion
window.deleteCandidate = async function(candidateId) {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    showLoader(true);
    try {
        await db.collection('candidates').doc(candidateId).delete();
        showMessage('Candidate deleted successfully!', 'success');
        await loadCandidates();
        console.log('✅ Candidate deleted:', candidateId);
    } catch (error) {
        console.error('❌ Error deleting candidate:', error);
        showMessage('Error deleting candidate: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
};