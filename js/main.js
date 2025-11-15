import { initAdmin } from './admin.js';
import { initUser } from './user.js';
import { showSection, showMessage } from './utils.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupNavigation();
  initAdmin();
  initUser();
  
  // Show home section by default
  showSection('home');
}

function setupNavigation() {
  // Navigation event listeners
  document.getElementById('homeNav').addEventListener('click', () => showSection('home'));
  document.getElementById('userNav').addEventListener('click', () => showSection('userAuth'));
  document.getElementById('adminNav').addEventListener('click', () => showSection('adminLogin'));
  document.getElementById('resultsNav').addEventListener('click', showPublicResults);
}

async function showPublicResults() {
  showSection('publicResults');
  
  try {
    const db = (await import('./firebase.js')).db;
    const snapshot = await db.collection('candidates').get();
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    displayPublicResults(candidates);
  } catch (error) {
    console.error('Error loading results:', error);
    showMessage('Error loading results', 'error');
  }
}

function displayPublicResults(candidates) {
  const container = document.getElementById('publicResultsList');
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
      <img src="${candidate.photo}" alt="${candidate.name}" width="60">
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
  document.getElementById('totalVotes').textContent = totalVotes;
}

// Make functions available globally for HTML onclick attributes
window.showSection = showSection;
window.showPublicResults = showPublicResults;