// js/user.js - FULL VERSION WITH NULL CHECKS
import { auth, db } from './firebase-config.js';
import { 
    showLoader, 
    showMessage,
    showSection,
    STATE 
} from './utils.js';

let userInitialized = false;

export async function initUser() {
    if (userInitialized) {
        console.log('⚠️ User already initialized');
        return;
    }
    
    // Check if user sections exist on this page
    const userAuthSection = document.getElementById('userAuth');
    const userDashboardSection = document.getElementById('userDashboard');
    
    if (!userAuthSection && !userDashboardSection) {
        console.log('❌ User sections not found - skipping user initialization');
        return;
    }
    
    console.log('🔧 Initializing user module...');
    
    try {
        setupUserEventListeners();
        await checkUserAuth();
        userInitialized = true;
        console.log('✅ User module initialized successfully');
    } catch (error) {
        console.error('❌ User initialization failed:', error);
        showMessage('User module failed to initialize', 'error');
    }
}

function setupUserEventListeners() {
    console.log('🔧 Setting up user event listeners...');
    
    const registerBtn = document.getElementById('userRegisterBtn');
    const loginBtn = document.getElementById('userLoginBtn');
    const logoutBtn = document.getElementById('userLogoutBtn');
    
    // Add event listeners only if elements exist
    if (registerBtn) {
        registerBtn.addEventListener('click', userRegister);
        console.log('✅ userRegisterBtn listener added');
    } else {
        console.log('⚠️ userRegisterBtn not found');
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', userLogin);
        console.log('✅ userLoginBtn listener added');
    } else {
        console.log('⚠️ userLoginBtn not found');
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', userLogout);
        console.log('✅ userLogoutBtn listener added');
    }
}

async function checkUserAuth() {
    return new Promise((resolve) => {
        // Delay auth state listener to ensure DOM is ready
        setTimeout(() => {
            auth.onAuthStateChanged((user) => {
                console.log('🔐 User auth state changed:', user?.email);
                
                if (user && user.email !== STATE.adminEmail) {
                    STATE.currentUser = user;
                    showUserDashboard();
                    checkVoteStatus();
                    loadCandidatesForVoting();
                } else {
                    showUserAuth();
                }
                resolve();
            });
        }, 100);
    });
}

async function userRegister() {
    const emailInput = document.getElementById('userEmail');
    const passwordInput = document.getElementById('userPassword');
    
    if (!emailInput || !passwordInput) {
        showMessage('User registration form not found', 'error');
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
        await auth.createUserWithEmailAndPassword(email, password);
        
        // Save user data to Firestore
        await db.collection('users').doc(email).set({
            email: email,
            hasVoted: false,
            createdAt: new Date()
        });
        
        showMessage('Registration successful!', 'success');
        console.log('✅ User registered:', email);
    } catch (error) {
        console.error('❌ User registration error:', error);
        showMessage('Registration failed: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

async function userLogin() {
    const emailInput = document.getElementById('userEmail');
    const passwordInput = document.getElementById('userPassword');
    
    if (!emailInput || !passwordInput) {
        showMessage('User login form not found', 'error');
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
        STATE.currentUser = auth.currentUser;
        showMessage('Login successful!', 'success');
        console.log('✅ User logged in:', email);
    } catch (error) {
        console.error('❌ User login error:', error);
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

async function userLogout() {
    showLoader(true);
    try {
        await auth.signOut();
        STATE.currentUser = null;
        showMessage('Logged out successfully', 'success');
        showUserAuth();
        console.log('✅ User logged out');
    } catch (error) {
        console.error('❌ User logout error:', error);
        showMessage('Logout error: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
}

function showUserAuth() {
    const userAuthSection = document.getElementById('userAuth');
    const userDashboardSection = document.getElementById('userDashboard');
    
    if (userAuthSection) {
        userAuthSection.style.display = 'block';
    }
    
    if (userDashboardSection) {
        userDashboardSection.style.display = 'none';
    }
    
    // Clear form fields
    const emailInput = document.getElementById('userEmail');
    const passwordInput = document.getElementById('userPassword');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    console.log('🔐 Showing user auth');
}

function showUserDashboard() {
    const userAuthSection = document.getElementById('userAuth');
    const userDashboardSection = document.getElementById('userDashboard');
    
    if (userAuthSection) {
        userAuthSection.style.display = 'none';
    }
    
    if (userDashboardSection) {
        userDashboardSection.style.display = 'block';
    }
    
    console.log('📊 Showing user dashboard');
}

async function checkVoteStatus() {
    if (!STATE.currentUser) {
        console.log('⚠️ No current user for vote status check');
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(STATE.currentUser.email).get();
        if (userDoc.exists) {
            STATE.hasVoted = userDoc.data().hasVoted || false;
            
            const votingSection = document.getElementById('votingSection');
            const alreadyVotedMsg = document.getElementById('alreadyVotedMsg');
            
            if (votingSection) {
                votingSection.style.display = STATE.hasVoted ? 'none' : 'block';
            }
            
            if (alreadyVotedMsg) {
                alreadyVotedMsg.style.display = STATE.hasVoted ? 'block' : 'none';
            }
            
            console.log('✅ Vote status checked:', STATE.hasVoted ? 'has voted' : 'can vote');
        }
    } catch (error) {
        console.error('❌ Error checking vote status:', error);
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
        console.log('✅ Loaded candidates for voting:', candidates.length);
    } catch (error) {
        console.error('❌ Error loading candidates for voting:', error);
    }
}

function displayCandidatesForVoting(candidates) {
    const container = document.getElementById('candidatesVotingList');
    if (!container) {
        console.log('⚠️ candidatesVotingList container not found');
        return;
    }
    
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

// Global function for voting
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

    showLoader(true);
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
        await checkVoteStatus();
        await loadCandidatesForVoting();
        console.log('✅ Vote submitted for candidate:', candidateId);
    } catch (error) {
        console.error('❌ Error submitting vote:', error);
        showMessage('Error submitting vote: ' + error.message, 'error');
    } finally {
        showLoader(false);
    }
};