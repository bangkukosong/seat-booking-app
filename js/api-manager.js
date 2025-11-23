// js/api-manager.js
import { FirestoreAPI } from './firestore-api.js';

// Configuration - TRUE untuk pakai Firestore, FALSE untuk Google Apps Script
const USE_FIRESTORE = true; // 🔥 UBAH KE TRUE - PAKAI FIRESTORE!

const API_URL = "https://script.google.com/macros/s/AKfycbzqcu9ZSgpR5iGm4dMKC-S6GeG4lbYlsxMt_kBJBeHW7vEYcJpJHh1-CsunO5uOsYt6YQ/exec";
const CACHE_DURATION = 120000;
const API_CACHE = {};

export class APIManager {
    
    // ==================== CORE API METHODS ====================
    static async fetch(action, params = {}, useCache = false) {
        if (USE_FIRESTORE) {
            return await this.firestoreFetch(action, params);
        } else {
            return await this.legacyFetch(action, params, useCache);
        }
    }

    static async post(action, params = {}) {
        if (USE_FIRESTORE) {
            return await this.firestorePost(action, params);
        } else {
            return await this.legacyPost(action, params);
        }
    }

    // ==================== FIRESTORE METHODS ====================
    static async firestoreFetch(action, params = {}) {
        try {
            console.log(`🔥 Firestore FETCH: ${action}`, params);
            
            switch (action) {
                case 'getBookings':
                    return await FirestoreAPI.getBookings(params.day);
                
                case 'getAllBookings':
                    return await FirestoreAPI.getAllBookings(params.userName);
                
                case 'getAllUsers':
                    return await FirestoreAPI.getAllUsers();
                
                case 'getAllBookingsAdmin':
                    return await FirestoreAPI.getAllBookingsAdmin();
                
                default:
                    throw new Error(`Unknown Firestore action: ${action}`);
            }
        } catch (error) {
            console.error(`Firestore Fetch Error (${action}):`, error);
            return { success: false, message: error.message };
        }
    }

    static async firestorePost(action, params = {}) {
        try {
            console.log(`🔥 Firestore POST: ${action}`, { ...params, password: '***' }); // Hide password in logs
            
            switch (action) {
                case 'login':
                    return await FirestoreAPI.login(params.username, params.password);
                
                case 'submitBooking':
                    return await FirestoreAPI.submitBooking(params.seat, params.userName, params.day);
                
                case 'cancelBooking':
                    return await FirestoreAPI.cancelBooking(params.seat, params.userName, params.day);
                
                case 'addUser':
                    return await FirestoreAPI.addUser(params.username, params.password, params.name, params.role);
                
                case 'changePassword':
                    return await FirestoreAPI.changePassword(params.username, params.currentPassword, params.newPassword);
                
                default:
                    throw new Error(`Unknown Firestore action: ${action}`);
            }
        } catch (error) {
            console.error(`Firestore Post Error (${action}):`, error);
            return { success: false, message: error.message };
        }
    }

    // ==================== LEGACY GOOGLE APPS SCRIPT METHODS ====================
    static async legacyFetch(action, params = {}, useCache = false) {
        const key = `${action}_${JSON.stringify(params)}`;
        const now = Date.now();
        
        if (useCache && API_CACHE[key] && (now - API_CACHE[key].timestamp < CACHE_DURATION)) {
            return API_CACHE[key].data;
        }
        
        const url = new URL(API_URL);
        url.searchParams.append('action', action);
        
        for (const [paramKey, paramValue] of Object.entries(params)) {
            url.searchParams.append(paramKey, paramValue);
        }
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (useCache) {
                API_CACHE[key] = {
                    data: data,
                    timestamp: now
                };
            }
            
            return data;
        } catch (error) {
            console.error('Legacy API Fetch Error:', error);
            throw new Error('Failed to fetch data from server');
        }
    }

    static async legacyPost(action, params = {}) {
        const formData = new URLSearchParams();
        formData.append('action', action);
        
        for (const [key, value] of Object.entries(params)) {
            formData.append(key, value);
        }
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('Legacy API Post Error:', error);
            throw new Error('Failed to post data to server');
        }
    }

    // ==================== UTILITY METHODS ====================
    static clearCache() {
        Object.keys(API_CACHE).forEach(key => delete API_CACHE[key]);
        console.log('🧹 API cache cleared');
    }

    static getCurrentMode() {
        return USE_FIRESTORE ? 'Firestore' : 'Google Apps Script';
    }
}

// Export simplified functions for backward compatibility
export const optimizedFetch = APIManager.fetch.bind(APIManager);
export const optimizedPost = APIManager.post.bind(APIManager);
export const clearCache = APIManager.clearCache.bind(APIManager);

console.log(`🎯 API Manager initialized - Using: ${APIManager.getCurrentMode()}`);