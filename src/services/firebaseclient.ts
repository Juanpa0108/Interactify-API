/**
 * Firebase client initialization for server-side usage.
 *
 * NOTE: This file lives in the API project. The browser-specific pattern
 * `import.meta.env` is provided by Vite and won't be available when running
 * Node directly. Use `process.env` on the server and ensure env vars are set
 * (for local development, place them in a `.env` or use your host's env config).
 *
 * If this code is intended to run as a backend service, consider using the
 * `firebase-admin` SDK instead (recommended) because it provides higher
 * privileges and uses service account credentials.
 */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Validate presence of required config to avoid confusing runtime errors.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.error('Missing Firebase configuration in environment variables.');
  // Throwing helps crash fast in server environments so the problem is visible.
  throw new Error('Firebase configuration missing. Set FIREBASE_* or VITE_FIREBASE_* env vars.');
}

// Initialize the Firebase app and export Firestore client
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Export the raw app for other modules that may need it
export default app;
