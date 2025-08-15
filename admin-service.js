const admin = require('firebase-admin');

// Parse the service account credentials from environment variable
// Make sure you added FIREBASE_SERVICE_ACCOUNT in Render as a single-line JSON string
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

const deleteAdminUser = async (adminId) => {
  try {
    // First, get the admin document to find the UID
    const adminDoc = await db.collection('admins').doc(adminId).get();
    
    if (!adminDoc.exists) {
      throw new Error('Admin not found in Firestore');
    }
    
    const adminData = adminDoc.data();
    console.log('Admin data:', adminData);
    
    // Delete from Firebase Authentication if UID exists
    if (adminData.uid) {
      try {
        await auth.deleteUser(adminData.uid);
        console.log('Successfully deleted user from Firebase Auth:', adminData.uid);
      } catch (authError) {
        console.log('User may not exist in Firebase Auth or already deleted:', authError.message);
        // Continue with Firestore deletion even if Auth deletion fails
      }
    }
    
    // Delete from Firestore
    await db.collection('admins').doc(adminId).delete();
    console.log('Successfully deleted admin from Firestore:', adminId);
    
    return { success: true, message: 'Admin deleted successfully' };
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

module.exports = { deleteAdminUser };
