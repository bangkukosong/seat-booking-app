// js/constants.js
// Hapus API_URL dan CACHE_DURATION karena sudah pindah ke api-manager.js

// Application State
export let currentUser = null;
export let currentDate = new Date();
export let currentBookings = [];
export let historicalBookings = [];
export let currentView = 'grid';

// Team and Seat Configuration
export const TEAMS_CONFIG = [
    { name: "ITPM", seats: 4 },
    { name: "CM", seats: 4 },
    { name: "R&C", seats: 2 },
    { name: "CTM", seats: 4 },
    { name: "CISO", seats: 1 },
    { name: "OTS", seats: 3 },
    { name: "CTOO", seats: 2 },
    { name: "NFRR", seats: 4 },
    { name: "Resilience", seats: 1 },
    { name: "PSS", seats: 3 },
    { name: "BIFAST", seats: 1 },
    { name: "ET", seats: 2 },
    { name: "EUS", seats: 1 }
];