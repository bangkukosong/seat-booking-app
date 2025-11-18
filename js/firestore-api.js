// firestore-api.js - COMPLETE FIXED VERSION dengan Admin Features
import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from './firebase-config.js';

export class FirestoreAPI {
    
    // ==================== AUTHENTICATION ====================
    static async login(username, password) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, 
                where('username', '==', username), 
                where('password', '==', password)
            );
            
            const snapshot = await getDocs(q);
            
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
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef, 
                where('bookingDate', '==', day),
                where('status', '==', 'active')
            );
            
            const snapshot = await getDocs(q);
                
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
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef, 
                where('userName', '==', userName)
            );
            
            const snapshot = await getDocs(q);
                
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
            
            const bookingsRef = collection(db, 'bookings');
            
            // Check seat availability
            const seatQuery = query(
                bookingsRef,
                where('bookingDate', '==', day),
                where('seat', '==', seat),
                where('status', '==', 'active')
            );
            
            const seatSnapshot = await getDocs(seatQuery);
            
            if (!seatSnapshot.empty) {
                const existingBooking = seatSnapshot.docs[0].data();
                return { 
                    success: false, 
                    message: `Kursi ${seat} sudah dibooking oleh ${existingBooking.userName}` 
                };
            }

            // Check user existing booking
            const userQuery = query(
                bookingsRef,
                where('bookingDate', '==', day),
                where('userName', '==', userName),
                where('status', '==', 'active')
            );
            
            const userSnapshot = await getDocs(userQuery);
                
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
            await addDoc(collection(db, 'bookings'), {
                seat: seat,
                userName: userName,
                userTeam: userTeam,
                bookingDate: day,
                bookingTime: serverTimestamp(),
                status: "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, message: 'Booking successful' };
            
        } catch (error) {
            console.error('Firestore SubmitBooking Error:', error);
            return { success: false, message: 'Booking failed: ' + error.message };
        }
    }

    static async cancelBooking(seat, userName, day) {
        try {
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('bookingDate', '==', day),
                where('seat', '==', seat),
                where('userName', '==', userName),
                where('status', '==', 'active')
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'Booking not found' };
            }

            const bookingDoc = snapshot.docs[0];
            await updateDoc(doc(db, 'bookings', bookingDoc.id), {
                status: "cancelled",
                updatedAt: serverTimestamp(),
                cancelledAt: serverTimestamp()
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
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const existingSnapshot = await getDocs(q);
            
            if (!existingSnapshot.empty) {
                return { success: false, message: 'Username already exists' };
            }

            await addDoc(collection(db, 'users'), {
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, message: 'User created successfully' };
        } catch (error) {
            console.error('Firestore AddUser Error:', error);
            return { success: false, message: 'User creation failed: ' + error.message };
        }
    }

    static async changePassword(username, currentPassword, newPassword) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef, 
                where('username', '==', username), 
                where('password', '==', currentPassword)
            );
            
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'Current password is incorrect' };
            }

            const userDoc = snapshot.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
                password: newPassword,
                updatedAt: serverTimestamp()
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
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));
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
            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef, 
                orderBy('bookingDate', 'desc'), 
                orderBy('bookingTime', 'desc')
            );
            
            const snapshot = await getDocs(q);
                
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

    // ==================== ADVANCED ADMIN FEATURES ====================
    static async changeUserRole(username, newRole) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'User not found' };
            }

            const userDoc = snapshot.docs[0];
            
            // Update permissions based on role
            let permissions = ["read", "write"];
            if (newRole === 'admin') {
                permissions = ["read", "write", "delete", "user_management"];
            } else if (newRole === 'super_admin') {
                permissions = ["read", "write", "delete", "user_management", "system_config"];
            }

            await updateDoc(doc(db, 'users', userDoc.id), {
                role: newRole,
                permissions: permissions,
                updatedAt: serverTimestamp()
            });
            
            return { success: true, message: 'User role updated successfully' };
        } catch (error) {
            console.error('Firestore ChangeUserRole Error:', error);
            return { success: false, message: error.message };
        }
    }

    static async resetUserPassword(username, newPassword) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return { success: false, message: 'User not found' };
            }

            const userDoc = snapshot.docs[0];
            
            await updateDoc(doc(db, 'users', userDoc.id), { 
                password: newPassword,
                lastPasswordReset: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, message: 'Password reset successfully' };
        } catch (error) {
            console.error('Firestore ResetUserPassword Error:', error);
            return { success: false, message: error.message };
        }
    }

    static async deleteUser(username) {
        try {
            // Check if user has any bookings
            const bookingsRef = collection(db, 'bookings');
            const bookingsQuery = query(bookingsRef, where('userName', '==', username));
            const bookingsSnap = await getDocs(bookingsQuery);
            
            if (!bookingsSnap.empty) {
                return { success: false, message: 'Cannot delete user with existing bookings' };
            }

            // Find and delete user
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('username', '==', username));
            const userSnap = await getDocs(userQuery);
            
            if (userSnap.empty) {
                return { success: false, message: 'User not found' };
            }

            const userDoc = userSnap.docs[0];
            
            // Prevent deletion of super_admin
            if (userDoc.data().role === 'super_admin') {
                return { success: false, message: 'Cannot delete super admin user' };
            }

            await deleteDoc(doc(db, 'users', userDoc.id));
            
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            console.error('Firestore DeleteUser Error:', error);
            return { success: false, message: error.message };
        }
    }

    static async exportUserReport() {
        try {
            const users = await this.getAllUsers();
            if (!users.success) {
                return { success: false, message: 'Failed to fetch users for export' };
            }

            const reportData = users.users.map(user => ({
                Username: user.username,
                Name: user.name,
                Role: user.role,
                Team: user.teamName,
                Status: user.status,
                Created: user.createdAt?.toLocaleDateString?.() || 'Unknown',
                LastLogin: user.lastLogin?.toDate?.()?.toLocaleDateString?.() || 'Never',
                Permissions: user.permissions?.join(', ') || 'None'
            }));

            return { success: true, data: reportData, filename: 'user_access_report' };
        } catch (error) {
            console.error('Firestore ExportUserReport Error:', error);
            return { success: false, message: error.message };
        }
    }

    static async exportBookingReport() {
        try {
            const bookings = await this.getAllBookingsAdmin();
            if (!bookings.success) {
                return { success: false, message: 'Failed to fetch bookings for export' };
            }

            const reportData = bookings.bookings.map(booking => ({
                Date: booking.bookingDate,
                Seat: booking.seat,
                User: booking.userName,
                Department: booking.seat?.split('-')[0] || 'Unknown',
                BookingTime: booking.bookingTime?.toDate?.()?.toLocaleString?.() || 'Unknown',
                Status: booking.status,
                Created: booking.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Unknown'
            }));

            return { success: true, data: reportData, filename: 'booking_report' };
        } catch (error) {
            console.error('Firestore ExportBookingReport Error:', error);
            return { success: false, message: error.message };
        }
    }

    // ==================== HELPER FUNCTIONS ====================
    static async getUserTeam(username) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', username));
            const userSnapshot = await getDocs(q);
                
            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                return userData.teamId || 'UNASSIGNED';
            }
            return 'UNASSIGNED';
        } catch (error) {
            return 'UNASSIGNED';
        }
    }

    // ==================== SYSTEM STATISTICS ====================
    static async getSystemStats() {
        try {
            const [usersSnapshot, bookingsSnapshot, activeBookingsSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'bookings')),
                getDocs(query(collection(db, 'bookings'), where('status', '==', 'active')))
            ]);

            const stats = {
                totalUsers: usersSnapshot.size,
                totalBookings: bookingsSnapshot.size,
                activeBookings: activeBookingsSnapshot.size,
                userRoles: {},
                bookingTrends: {}
            };

            // Calculate user roles distribution
            usersSnapshot.forEach(doc => {
                const role = doc.data().role || 'user';
                stats.userRoles[role] = (stats.userRoles[role] || 0) + 1;
            });

            return { success: true, stats };
        } catch (error) {
            console.error('Firestore GetSystemStats Error:', error);
            return { success: false, message: error.message };
        }
    }
}