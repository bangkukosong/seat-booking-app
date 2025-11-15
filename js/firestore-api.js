// js/firestore-api.js
import { db } from './firebase-config.js';

export class FirestoreAPI {
    
    // ==================== AUTHENTICATION ====================
    static async login(username, password) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .where('password', '==', password)
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
                        role: userData.role || 'user'
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
            const snapshot = await db.collection('bookings')
                .where('day', '==', day)
                .orderBy('timestamp', 'asc')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date()
            }));
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetBookings Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    static async getAllBookings(userName) {
        try {
            const snapshot = await db.collection('bookings')
                .where('userName', '==', userName)
                .orderBy('day', 'desc')
                .orderBy('timestamp', 'desc')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date()
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
        
        // ✅ CEK 1: Seat sudah dibooking orang lain hari ini
        const seatSnapshot = await db.collection('bookings')
            .where('day', '==', day)
            .where('seat', '==', seat)
            .get();
        
        if (!seatSnapshot.empty) {
            const existingBooking = seatSnapshot.docs[0].data();
            console.log('❌ Seat already booked by:', existingBooking.userName);
            return { 
                success: false, 
                message: `Kursi ${seat} sudah dibooking oleh ${existingBooking.userName}` 
            };
        }

        // ✅ CEK 2: User sudah booking seat lain hari ini
        const userSnapshot = await db.collection('bookings')
            .where('day', '==', day)
            .where('userName', '==', userName)
            .get();
            
        if (!userSnapshot.empty) {
            const userBooking = userSnapshot.docs[0].data();
            console.log('❌ User already booked:', userBooking.seat);
            return { 
                success: false, 
                message: `Anda sudah booking kursi ${userBooking.seat} untuk hari ini` 
            };
        }

        console.log('✅ No duplicates, creating booking...');
        
        // ✅ CREATE NEW BOOKING
        await db.collection('bookings').add({
            seat,
            userName,
            day,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, message: 'Booking successful' };
        
    } catch (error) {
        console.error('Firestore SubmitBooking Error:', error);
        return { success: false, message: 'Booking failed: ' + error.message };
    }
}

    static async cancelBooking(seat, userName, day) {
        try {
            // Find the booking to cancel
            const snapshot = await db.collection('bookings')
                .where('day', '==', day)
                .where('seat', '==', seat)
                .where('userName', '==', userName)
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'Booking not found' };
            }

            // Delete the booking
            const bookingDoc = snapshot.docs[0];
            await db.collection('bookings').doc(bookingDoc.id).delete();
            
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

            // Create new user
            await db.collection('users').add({
                username,
                password,
                name,
                role,
                createdAt: firebase.firestore.Timestamp.now()
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

            // Update password
            const userDoc = snapshot.docs[0];
            await db.collection('users').doc(userDoc.id).update({
                password: newPassword
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
                .orderBy('day', 'desc')
                .orderBy('timestamp', 'desc')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date()
            }));
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetAllBookingsAdmin Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }
}