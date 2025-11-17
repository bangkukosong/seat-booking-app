// constants.js - COMPLETE FIXED VERSION
export const TEAMS_CONFIG = [
    { id: "ITPM", name: "ITPM", displayName: "IT Project Management", totalSeats: 4, color: "#00ff80" },
    { id: "CM", name: "CM", displayName: "Change Management", totalSeats: 4, color: "#ff6b6b" },
    { id: "R&C", name: "R&C", displayName: "Risk & Compliance", totalSeats: 2, color: "#4ecdc4" },
    { id: "CTM", name: "CTM", displayName: "Country Technology Management", totalSeats: 4, color: "#45b7d1" },
    { id: "CISO", name: "CISO", displayName: "Chief Information Security Office", totalSeats: 1, color: "#96ceb4" },
    { id: "OTS", name: "OTS", displayName: "Operations Technology Support", totalSeats: 3, color: "#feca57" },
    { id: "CTOO", name: "CTOO", displayName: "Chief Technology Office Operations", totalSeats: 2, color: "#ff9ff3" },
    { id: "NFRR", name: "NFRR", displayName: "Non-financial regulatory reporting", totalSeats: 4, color: "#54a0ff" },
    { id: "Resilience", name: "Resilience", displayName: "Resilience Team", totalSeats: 1, color: "#5f27cd" },
    { id: "PSS", name: "PSS", displayName: "Product Support Services", totalSeats: 3, color: "#00d2d3" },
    { id: "BIFAST", name: "BIFAST", displayName: "BI Fast Team", totalSeats: 1, color: "#ff9f43" },
    { id: "ET", name: "ET", displayName: "Enterprise Technology", totalSeats: 2, color: "#10ac84" },
    { id: "EUS", name: "EUS", displayName: "End User Services", totalSeats: 1, color: "#ee5a24" }
];

export const state = {
    currentUser: null,
    currentBookings: [],
    historicalBookings: [],
    currentDate: new Date(),
    currentView: 'grid'
};

console.log('✅ Constants loaded with new teams configuration');