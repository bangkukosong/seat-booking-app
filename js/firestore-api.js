// firestore-api.js - COMPLETE FIXED VERSION
import { db } from './firebase-config.js';

export class FirestoreAPI {
    
    // ==================== AUTHENTICATION ====================
    static async login(username, password) {
        try {
            // ✅ FIX: QUERY YANG BENAR - CARI BY USERNAME
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .where('password', '==', password) // Note: Password masih plain text di Firestore
                .get();
            
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                const userData = userDoc.data();
                return { 
                    success: true, 
                    user: { 
                        id: userDoc.id,
                        username: userData.username,
                        name: userData.name,
                        role: userData.role || 'user',
                        email: userData.email,
                        team: userData.teamId
                    } 
                };
            }
            return { success: false, message: 'Invalid username or password' };
        } catch (error) {
            console.error('Firestore Login Error:', error);
            return { success: false, message: 'Login failed: ' + error.message };
        }
    }

    // ==================== BOOKINGS MANAGEMENT ====================
    static async getBookings(day) {
        try {
            // ✅ FIX: PAKAI bookingDate TAPI SUPPORT PARAMETER 'day'
            const snapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)  // ✅ bookingDate
                .where('status', '==', 'active')  // ✅ Only active bookings
                .orderBy('bookingTime', 'asc')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().bookingTime?.toDate?.() || new Date() // ✅ bookingTime
            }));
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetBookings Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    static async getAllBookings(userName) {
        try {
            // ✅ FIX: PAKAI bookingDate BUKAN day
            const snapshot = await db.collection('bookings')
                .where('userName', '==', userName)
                .orderBy('bookingDate', 'desc')      // ✅ bookingDate
                .orderBy('bookingTime', 'desc')      // ✅ bookingTime
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().bookingTime?.toDate?.() || new Date(),
                day: doc.data().bookingDate // ✅ BACKWARD COMPATIBILITY: tambah field 'day'
            }));
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetAllBookings Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    static async submitBooking(seat, userName, day) {
        try {
            console.log('🔍 Checking for duplicate bookings...', { seat, userName, day });
            
            // ✅ FIX: PAKAI bookingDate
            const seatSnapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)
                .where('seat', '==', seat)
                .where('status', '==', 'active')
                .get();
            
            if (!seatSnapshot.empty) {
                const existingBooking = seatSnapshot.docs[0].data();
                return { 
                    success: false, 
                    message: `Kursi ${seat} sudah dibooking oleh ${existingBooking.userName}` 
                };
            }

            const userSnapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)
                .where('userName', '==', userName)
                .where('status', '==', 'active')
                .get();
                
            if (!userSnapshot.empty) {
                const userBooking = userSnapshot.docs[0].data();
                return { 
                    success: false, 
                    message: `Anda sudah booking kursi ${userBooking.seat} untuk hari ini` 
                };
            }

            // ✅ DAPATKAN USER TEAM
            const userTeam = await this.getUserTeam(userName);

            // ✅ CREATE WITH NEW STRUCTURE
            await db.collection('bookings').add({
                seat: seat,
                userName: userName,
                userTeam: userTeam,
                bookingDate: day,         // ✅ bookingDate (dari parameter day)
                bookingTime: firebase.firestore.FieldValue.serverTimestamp(),
                status: "active",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'Booking successful' };
            
        } catch (error) {
            console.error('Firestore SubmitBooking Error:', error);
            return { success: false, message: 'Booking failed: ' + error.message };
        }
    }

    static async cancelBooking(seat, userName, day) {
        try {
            // ✅ FIX: PAKAI bookingDate
            const snapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)
                .where('seat', '==', seat)
                .where('userName', '==', userName)
                .where('status', '==', 'active')
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'Booking not found' };
            }

            // ✅ UPDATE STATUS JADI CANCELLED (soft delete)
            const bookingDoc = snapshot.docs[0];
            await db.collection('bookings').doc(bookingDoc.id).update({
                status: "cancelled",
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'Booking cancelled successfully' };
        } catch (error) {
            console.error('Firestore CancelBooking Error:', error);
            return { success: false, message: 'Cancellation failed: ' + error.message };
        }
    }

    // ==================== USER MANAGEMENT ====================
    static async addUser(username, password, name, role = 'user') {
        try {
            // Check if username already exists
            const existingSnapshot = await db.collection('users')
                .where('username', '==', username)
                .get();
            
            if (!existingSnapshot.empty) {
                return { success: false, message: 'Username already exists' };
            }

            // Note: Ini cuma bikin Firestore doc, gak bikin Firebase Auth user
            // Untuk Firebase Auth, perlu pake auth.createUserWithEmailAndPassword()
            await db.collection('users').add({
                username: username,
                password: password, // 🔐 Masih plain text - harus fix nanti
                name: name,
                role: role,
                teamId: 'UNASSIGNED',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'User created successfully' };
        } catch (error) {
            console.error('Firestore AddUser Error:', error);
            return { success: false, message: 'User creation failed: ' + error.message };
        }
    }

    static async changePassword(username, currentPassword, newPassword) {
        try {
            // Find user and verify current password
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .where('password', '==', currentPassword)
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'Current password is incorrect' };
            }

            // Update password di Firestore
            const userDoc = snapshot.docs[0];
            await db.collection('users').doc(userDoc.id).update({
                password: newPassword,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Firestore ChangePassword Error:', error);
            return { success: false, message: 'Password update failed: ' + error.message };
        }
    }

    // ==================== ADMIN FUNCTIONS ====================
    static async getAllUsers() {
        try {
            const snapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .get();
                
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            
            return { success: true, users };
        } catch (error) {
            console.error('Firestore GetAllUsers Error:', error);
            return { success: false, users: [], message: error.message };
        }
    }

    static async getAllBookingsAdmin() {
        try {
            const snapshot = await db.collection('bookings')
                .orderBy('bookingDate', 'desc')      // ✅ bookingDate
                .orderBy('bookingTime', 'desc')      // ✅ bookingTime
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().bookingTime?.toDate?.() || new Date(),
                day: doc.data().bookingDate // ✅ BACKWARD COMPATIBILITY
            }));
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetAllBookingsAdmin Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    // ==================== HELPER FUNCTIONS ====================
    static async getUserTeam(username) {
        try {
            const userSnapshot = await db.collection('users')
                .where('username', '==', username)
                .limit(1)
                .get();
                
            if (!userSnapshot.empty) {
                return userSnapshot.docs[0].data().teamId || 'UNASSIGNED';
            }
            return 'UNASSIGNED';
        } catch (error) {
            return 'UNASSIGNED';
        }
    }
}