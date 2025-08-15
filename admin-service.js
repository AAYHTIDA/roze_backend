
const admin = require('firebase-admin');

// Get individual service account fields from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

// Validate required environment variables
const requiredFields = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
for (const field of requiredFields) {
  if (!process.env[field]) {
    throw new Error(`${field} environment variable is required`);
  }
}

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
