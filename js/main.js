// js/main.js - FULL VERSION WITH ERROR HANDLING
import { initAdmin } from './admin.js';
import { initUser } from './user.js';
import { showMessage, showLoader } from './utils.js';

// Global error handlers
window.addEventListener('error', function(e) {
    console.error('🎯 Global Error:', e.error);
    showMessage('Application error occurred', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🎯 Unhandled Promise Rejection:', e.reason);
    showMessage('Something went wrong', 'error');
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Loaded - Initializing app...');
    
    try {
        initializeApp();
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showMessage('App initialization failed: ' + error.message, 'error');
    }
});

async function initializeApp() {
    console.log('🔧 Starting app initialization...');
    showLoader(true);
    
    // Initialize modules with error handling
    try {
        await initAdmin();
        console.log('✅ Admin module initialized');
    } catch (error) {
        console.log('⚠️ Admin init skipped or failed:', error.message);
    }
    
    try {
        await initUser();
        console.log('✅ User module initialized');
    } catch (error) {
        console.log('⚠️ User init skipped or failed:', error.message);
    }
    
    // Setup navigation
    try {
        setupNavigation();
        console.log('✅ Navigation setup completed');
    } catch (error) {
        console.error('❌ Navigation setup failed:', error);
    }
    
    // Show home section by default
    showSection('home');
    
    showLoader(false);
    console.log('🎉 App initialization completed');
}

function setupNavigation() {
    console.log('🔧 Setting up navigation...');
    
    const navButtons = [
        { id: 'homeNav', section: 'home' },
        { id: 'userNav', section: 'userAuth' },
        { id: 'adminNav', section: 'adminLogin' },
        { id: 'resultsNav', section: 'publicResults' }
    ];
    
    navButtons.forEach(({ id, section }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => showSection(section));
            console.log(`✅ Navigation button ${id} registered`);
        } else {
            console.log(`⚠️ Navigation button ${id} not found`);
        }
    });
}

// Safe section display function
function showSection(sectionId) {
    console.log(`🔄 Showing section: ${sectionId}`);
    
    // Hide all sections safely
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log(`✅ Section ${sectionId} displayed`);
    } else {
        console.log(`❌ Section ${sectionId} not found`);
        // Fallback to home if section not found
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.style.display = 'block';
            console.log('✅ Fallback to home section');
        }
    }
}

// Public results function
async function showPublicResults() {
    try {
        showSection('publicResults');
        showLoader(true);
        
        // Import dynamically to avoid circular dependencies
        const { db } = await import('./firebase-config.js');
        const snapshot = await db.collection('candidates').get();
        const candidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        displayPublicResults(candidates);
        showLoader(false);
    } catch (error) {
        console.error('Error loading results:', error);
        showMessage('Error loading results: ' + error.message, 'error');
        showLoader(false);
    }
}

function displayPublicResults(candidates) {
    const container = document.getElementById('publicResultsList');
    if (!container) {
        console.log('❌ publicResultsList container not found');
        return;
    }
    
    container.innerHTML = '';
    
    const sortedCandidates = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
    
    sortedCandidates.forEach((candidate, index) => {
        const votes = candidate.votes || 0;
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'public-result-item';
        resultDiv.innerHTML = `
            <div class="result-rank">${index + 1}</div>
            <img src="${candidate.photo || '/api/placeholder/60/60'}" alt="${candidate.name}" width="60">
            <div class="result-info">
                <h4>${candidate.name}</h4>
                <div class="vote-bar">
                    <div class="vote-progress" style="width: ${percentage}%"></div>
                </div>
                <div class="vote-stats">
                    <span>${votes} votes</span>
                    <span>${percentage}%</span>
                </div>
            </div>
        `;
        container.appendChild(resultDiv);
    });
    
    // Update total votes
    const totalVotesElement = document.getElementById('totalVotes');
    if (totalVotesElement) {
        totalVotesElement.textContent = totalVotes;
    }
}

// Make functions available globally
window.showSection = showSection;
window.showPublicResults = showPublicResults;