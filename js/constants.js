// js/constants.js - SIMPLE WINDOW OBJECT
// Just export the window object directly
export const state = window.bangkuKosongState = window.bangkuKosongState || {
    currentUser: null,
    currentDate: new Date(),
    currentBookings: [],
    historicalBookings: [],
    currentView: 'grid'
};

// EKSPORT currentDate secara terpisah
export const currentDate = state.currentDate;

// Team and Seat Configuration - TETAP SAMA SEPERTI SEBELUMNYA
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