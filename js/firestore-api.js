// js/firestore-api.js
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export class FirestoreAPI {
    
    // ==================== AUTHENTICATION ====================
    static async login(username, password) {
        try {
            const q = query(
                collection(db, 'users'),
                where('username', '==', username),
                where('password', '==', password)
            );
            const snapshot = await getDocs(q);
            
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
            const q = query(
                collection(db, 'bookings'),
                where('day', '==', day),
                orderBy('timestamp', 'asc')
            );
            const snapshot = await getDocs(q);
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
            const q = query(
                collection(db, 'bookings'),
                where('userName', '==', userName),
                orderBy('day', 'desc'),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);
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
            // Check if seat already booked for this day
            const existingQuery = query(
                collection(db, 'bookings'),
                where('day', '==', day),
                where('seat', '==', seat)
            );
            const existingSnapshot = await getDocs(existingQuery);
            
            if (!existingSnapshot.empty) {
                const existingBooking = existingSnapshot.docs[0].data();
                return { 
                    success: false, 
                    message: `Seat ${seat} already booked by ${existingBooking.userName}` 
                };
            }

            // Create new booking
            const bookingData = {
                seat,
                userName,
                day,
                timestamp: Timestamp.now()
            };

            await addDoc(collection(db, 'bookings'), bookingData);
            
            return { success: true, message: 'Booking successful' };
        } catch (error) {
            console.error('Firestore SubmitBooking Error:', error);
            return { success: false, message: 'Booking failed: ' + error.message };
        }
    }

    static async cancelBooking(seat, userName, day) {
        try {
            // Find the booking to cancel
            const q = query(
                collection(db, 'bookings'),
                where('day', '==', day),
                where('seat', '==', seat),
                where('userName', '==', userName)
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'Booking not found' };
            }

            // Delete the booking
            const bookingDoc = snapshot.docs[0];
            await deleteDoc(doc(db, 'bookings', bookingDoc.id));
            
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
            const existingQuery = query(
                collection(db, 'users'),
                where('username', '==', username)
            );
            const existingSnapshot = await getDocs(existingQuery);
            
            if (!existingSnapshot.empty) {
                return { success: false, message: 'Username already exists' };
            }

            // Create new user
            const userData = {
                username,
                password, // Note: In production, hash this password!
                name,
                role,
                createdAt: Timestamp.now()
            };

            await addDoc(collection(db, 'users'), userData);
            
            return { success: true, message: 'User created successfully' };
        } catch (error) {
            console.error('Firestore AddUser Error:', error);
            return { success: false, message: 'User creation failed: ' + error.message };
        }
    }

    static async changePassword(username, currentPassword, newPassword) {
        try {
            // Find user and verify current password
            const q = query(
                collection(db, 'users'),
                where('username', '==', username),
                where('password', '==', currentPassword)
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'Current password is incorrect' };
            }

            // Update password
            const userDoc = snapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
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
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
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
            const q = query(collection(db, 'bookings'), orderBy('day', 'desc'), orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
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