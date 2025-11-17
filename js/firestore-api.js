// firestore-api.js - COMPLETE FIXED VERSION
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
                
                // ✅ FIXED: RETURN NEW STRUCTURE
                return { 
                    success: true, 
                    user: { 
                        id: userDoc.id,
                        username: userData.username,
                        name: userData.name,
                        role: userData.role || 'user',
                        email: userData.email,
                        team: userData.teamId, // ✅ teamId dari structure baru
                        teamName: userData.teamName,
                        permissions: userData.permissions || ["read", "write"],
                        profile: userData.profile || { displayName: userData.name },
                        preferences: userData.preferences || {}
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
            // ✅ SIMPLIFIED - tanpa index dulu
            const snapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)
                .where('status', '==', 'active')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort manually di client
            bookings.sort((a, b) => {
                const timeA = a.bookingTime?.toDate?.() || new Date(0);
                const timeB = b.bookingTime?.toDate?.() || new Date(0);
                return timeA - timeB;
            });
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetBookings Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    static async getAllBookings(userName) {
        try {
            // ✅ SIMPLIFIED - tanpa index dulu
            const snapshot = await db.collection('bookings')
                .where('userName', '==', userName)
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort manually di client
            bookings.sort((a, b) => {
                const dateA = new Date(a.bookingDate || 0);
                const dateB = new Date(b.bookingDate || 0);
                if (dateB - dateA !== 0) return dateB - dateA;
                
                const timeA = a.bookingTime?.toDate?.() || new Date(0);
                const timeB = b.bookingTime?.toDate?.() || new Date(0);
                return timeB - timeA;
            });
            
            return { success: true, bookings };
        } catch (error) {
            console.error('Firestore GetAllBookings Error:', error);
            return { success: false, bookings: [], message: error.message };
        }
    }

    static async submitBooking(seat, userName, day) {
        try {
            console.log('🔍 Checking for duplicate bookings...', { seat, userName, day });
            
            // Check seat availability
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

            // Check user existing booking
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

            // ✅ DAPATKAN USER TEAM DARI STRUCTURE BARU
            const userTeam = await this.getUserTeam(userName);

            // Create booking
            await db.collection('bookings').add({
                seat: seat,
                userName: userName,
                userTeam: userTeam,
                bookingDate: day,
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
            const snapshot = await db.collection('bookings')
                .where('bookingDate', '==', day)
                .where('seat', '==', seat)
                .where('userName', '==', userName)
                .where('status', '==', 'active')
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'Booking not found' };
            }

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
            const existingSnapshot = await db.collection('users')
                .where('username', '==', username)
                .get();
            
            if (!existingSnapshot.empty) {
                return { success: false, message: 'Username already exists' };
            }

            await db.collection('users').add({
                username: username,
                password: password,
                name: name,
                role: role,
                teamId: 'UNASSIGNED',
                teamName: 'Unassigned Team',
                permissions: role === 'admin' ? ["read", "write", "delete", "user_management"] : ["read", "write"],
                loginMethod: "username",
                status: "active",
                isActive: true,
                profile: {
                    displayName: name,
                    department: "General",
                    avatar: null
                },
                preferences: {
                    notifications: true,
                    emailUpdates: false,
                    defaultView: "grid",
                    theme: "default"
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'User created successfully' };
        } catch (error) {
            console.error('Firestore AddUser Error:', error);
            return { success: false, message: 'User creation failed: ' + error.message };
        }
    }

    static async changePassword(username, currentPassword, newPassword) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .where('password', '==', currentPassword)
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'Current password is incorrect' };
            }

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
                .orderBy('bookingDate', 'desc')
                .orderBy('bookingTime', 'desc')
                .get();
                
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().bookingTime?.toDate?.() || new Date()
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
                const userData = userSnapshot.docs[0].data();
                return userData.teamId || 'UNASSIGNED';
            }
            return 'UNASSIGNED';
        } catch (error) {
            return 'UNASSIGNED';
        }
    }
}