import { auth, db } from './firebase-config.js';
import { 
  showSection, 
  showLoading, 
  hideLoading, 
  showMessage,
  STATE 
} from './utils.js';

export function initUser() {
  setupUserEventListeners();
  checkUserAuth();
  loadCandidatesForVoting();
}

function setupUserEventListeners() {
  document.getElementById('userRegisterBtn').addEventListener('click', userRegister);
  document.getElementById('userLoginBtn').addEventListener('click', userLogin);
  document.getElementById('userLogoutBtn').addEventListener('click', userLogout);
}

function checkUserAuth() {
  auth.onAuthStateChanged((user) => {
    if (user && user.email !== STATE.adminEmail) {
      STATE.currentUser = user;
      showUserDashboard();
      loadCandidatesForVoting();
    } else {
      showUserAuth();
    }
  });
}

async function userRegister() {
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  
  if (!email || !password) {
    showMessage('Please fill all fields', 'error');
    return;
  }

  showLoading();
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    
    // Save user data to Firestore
    await db.collection('users').doc(email).set({
      email: email,
      hasVoted: false,
      createdAt: new Date()
    });
    
    showMessage('Registration successful!', 'success');
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('Registration failed: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function userLogin() {
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  
  if (!email || !password) {
    showMessage('Please fill all fields', 'error');
    return;
  }

  showLoading();
  try {
    await auth.signInWithEmailAndPassword(email, password);
    STATE.currentUser = auth.currentUser;
    showMessage('Login successful!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Login failed: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function userLogout() {
  showLoading();
  try {
    await auth.signOut();
    STATE.currentUser = null;
    showMessage('Logged out successfully', 'success');
    showUserAuth();
  } catch (error) {
    showMessage('Logout error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

function showUserAuth() {
  showSection('userAuth');
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
}

function showUserDashboard() {
  showSection('userDashboard');
  checkVoteStatus();
}

async function checkVoteStatus() {
  if (!STATE.currentUser) return;

  try {
    const userDoc = await db.collection('users').doc(STATE.currentUser.email).get();
    if (userDoc.exists) {
      STATE.hasVoted = userDoc.data().hasVoted || false;
      
      if (STATE.hasVoted) {
        document.getElementById('votingSection').style.display = 'none';
        document.getElementById('alreadyVotedMsg').style.display = 'block';
      } else {
        document.getElementById('votingSection').style.display = 'block';
        document.getElementById('alreadyVotedMsg').style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error checking vote status:', error);
  }
}

async function loadCandidatesForVoting() {
  try {
    const snapshot = await db.collection('candidates').get();
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    displayCandidatesForVoting(candidates);
  } catch (error) {
    console.error('Error loading candidates:', error);
  }
}

function displayCandidatesForVoting(candidates) {
  const container = document.getElementById('candidatesVotingList');
  container.innerHTML = '';

  candidates.forEach(candidate => {
    const candidateDiv = document.createElement('div');
    candidateDiv.className = 'candidate-vote-item';
    candidateDiv.innerHTML = `
      <img src="${candidate.photo}" alt="${candidate.name}" width="80">
      <h4>${candidate.name}</h4>
      <button onclick="voteForCandidate('${candidate.id}')" class="btn-primary">Vote</button>
    `;
    container.appendChild(candidateDiv);
  });
}

// Make voteForCandidate available globally
window.voteForCandidate = async function(candidateId) {
  if (!STATE.currentUser) {
    showMessage('Please login first', 'error');
    return;
  }

  if (STATE.hasVoted) {
    showMessage('You have already voted!', 'error');
    return;
  }

  if (!confirm('Are you sure you want to vote for this candidate?')) return;

  showLoading();
  try {
    // Update candidate votes
    const candidateRef = db.collection('candidates').doc(candidateId);
    await db.runTransaction(async (transaction) => {
      const candidateDoc = await transaction.get(candidateRef);
      if (!candidateDoc.exists) {
        throw new Error('Candidate does not exist');
      }
      
      const newVotes = (candidateDoc.data().votes || 0) + 1;
      transaction.update(candidateRef, { votes: newVotes });
    });

    // Update user vote status
    await db.collection('users').doc(STATE.currentUser.email).update({
      hasVoted: true,
      votedAt: new Date(),
      votedFor: candidateId
    });

    STATE.hasVoted = true;
    showMessage('Vote submitted successfully!', 'success');
    checkVoteStatus();
    loadCandidatesForVoting();
  } catch (error) {
    showMessage('Error submitting vote: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
};