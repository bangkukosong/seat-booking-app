// js/firestore-api.js - COMPAT VERSION (PASTI WORK)
//ver1.0.4
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
                        role: userData.role || 'user',
                        email: userData.email,
                        team: userData.teamId,
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

            // Create booking
            await db.collection('bookings').add({
                seat: seat,
                userName: userName,
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

    // ==================== ADVANCED ADMIN FEATURES ====================
    static async changeUserRole(username, newRole) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .get();
            
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

            await db.collection('users').doc(userDoc.id).update({
                role: newRole,
                permissions: permissions,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, message: 'User role updated successfully' };
        } catch (error) {
            console.error('Firestore ChangeUserRole Error:', error);
            return { success: false, message: error.message };
        }
    }

    static async resetUserPassword(username, newPassword) {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username)
                .get();
            
            if (snapshot.empty) {
                return { success: false, message: 'User not found' };
            }

            const userDoc = snapshot.docs[0];
            
            await db.collection('users').doc(userDoc.id).update({ 
                password: newPassword,
                lastPasswordReset: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
            const bookingsSnapshot = await db.collection('bookings')
                .where('userName', '==', username)
                .get();
            
            if (!bookingsSnapshot.empty) {
                return { success: false, message: 'Cannot delete user with existing bookings' };
            }

            // Find and delete user
            const userSnapshot = await db.collection('users')
                .where('username', '==', username)
                .get();
            
            if (userSnapshot.empty) {
                return { success: false, message: 'User not found' };
            }

            const userDoc = userSnapshot.docs[0];
            
            // Prevent deletion of super_admin
            if (userDoc.data().role === 'super_admin') {
                return { success: false, message: 'Cannot delete super admin user' };
            }

            await db.collection('users').doc(userDoc.id).delete();
            
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            console.error('Firestore DeleteUser Error:', error);
            return { success: false, message: error.message };
        }
    }
	
	// ==================== EXPORT FUNCTIONS ====================
	static async exportUserReport() {
		try {
			const result = await this.getAllUsers();
			if (!result.success) {
				return { success: false, message: 'Failed to fetch users for export' };
			}
	
			const reportData = result.users.map(user => {
				// Format dates properly
				const createdDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
				const lastLoginDate = user.lastLogin?.toDate ? user.lastLogin.toDate() : (user.lastLogin ? new Date(user.lastLogin) : null);
				
				const createdDisplay = createdDate instanceof Date && !isNaN(createdDate) 
					? createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
					: 'Unknown';
					
				const lastLoginDisplay = lastLoginDate instanceof Date && !isNaN(lastLoginDate)
					? lastLoginDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
					: 'Never';
	
				// Determine active status
				const isActive = lastLoginDate ? 
					(Date.now() - lastLoginDate.getTime() < 30 * 24 * 60 * 60 * 1000) : false;
	
				return {
					'Username': user.username,
					'Full Name': user.name,
					'Role': user.role,
					'Team': user.teamName,
					'Status': isActive ? 'Active' : 'Inactive',
					'Last Login': lastLoginDisplay,
					'Created Date': createdDisplay,
					'Permissions': user.permissions?.join(', ') || 'None'
					// ✅ REMOVED SENSITIVE FIELDS: password, email, preferences, etc.
				};
			});
	
			return { success: true, data: reportData, filename: 'user_access_report' };
		} catch (error) {
			console.error('Firestore ExportUserReport Error:', error);
			return { success: false, message: error.message };
		}
	}
	
	static async exportBookingReport() {
		try {
			const result = await this.getAllBookingsAdmin();
			if (!result.success) {
				return { success: false, message: 'Failed to fetch bookings for export' };
			}
	
			const reportData = result.bookings.map(booking => {
				const bookingDate = booking.bookingTime?.toDate ? booking.bookingTime.toDate() : new Date(booking.timestamp);
				const bookingTimeDisplay = bookingDate instanceof Date && !isNaN(bookingDate)
					? bookingDate.toLocaleString('en-US', { 
						year: 'numeric', month: 'short', day: 'numeric',
						hour: '2-digit', minute: '2-digit' 
					})
					: 'Unknown';
	
				return {
					'Date': booking.bookingDate,
					'Seat': booking.seat,
					'User': booking.userName,
					'Department': booking.seat?.split('-')[0] || 'Unknown',
					'Booking Time': bookingTimeDisplay,
					'Status': booking.status,
					'Created': booking.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Unknown'
				};
			});
	
			return { success: true, data: reportData, filename: 'booking_report' };
		} catch (error) {
			console.error('Firestore ExportBookingReport Error:', error);
			return { success: false, message: error.message };
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