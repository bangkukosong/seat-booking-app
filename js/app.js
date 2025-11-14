// js/app.js
// ==================== CORE APP VARIABLES ====================
const API_URL = "https://script.google.com/macros/s/AKfycbzqcu9ZSgpR5iGm4dMKC-S6GeG4lbYlsxMt_kBJBeHW7vEYcJpJHh1-CsunO5uOsYt6YQ/exec";
const CACHE_DURATION = 120000;

let currentUser = null;
let currentDate = new Date();
let currentBookings = [];
let historicalBookings = [];
let currentView = 'grid';
const API_CACHE = {};

// ==================== UTILITY FUNCTIONS ====================
function showLoader(show = true) {
  document.getElementById('globalLoader').style.display = show ? 'block' : 'none';
}

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

async function optimizedFetch(action, params = {}, useCache = false) {
  const key = `${action}_${JSON.stringify(params)}`;
  const now = Date.now();
  if (useCache && API_CACHE[key] && (now - API_CACHE[key].t < CACHE_DURATION)) {
    return API_CACHE[key].d;
  }
  const url = new URL(API_URL);
  url.searchParams.append('action', action);
  for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v);
  const r = await fetch(url);
  const j = await r.json();
  if (useCache) API_CACHE[key] = { d: j, t: now };
  return j;
}

async function optimizedPost(action, params = {}) {
  const fd = new URLSearchParams({ action, ...params });
  const r = await fetch(API_URL, { method: 'POST', body: fd });
  return await r.json();
}

function showMessage(text, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "error" ? "rgba(255,85,85,0.95)" : 
                type === "success" ? "rgba(0,255,128,0.95)" : "rgba(255,215,0,0.95)"};
    color: ${type === "info" ? "black" : "white"};
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  messageDiv.textContent = text;
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 4000);
}

function updateLastUpdate() {
  document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

function refreshBookings() {
  Object.keys(API_CACHE).forEach(key => delete API_CACHE[key]);
  loadBookings();
  loadHistoricalBookings();
  showMessage("🔄 Data Refreshed!", "success");

}

