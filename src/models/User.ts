import firebaseAdmin from '../services/firebaseAdmin'

export interface UserProfile {
  uid: string
  firstName: string
  lastName?: string
  age?: number
  email: string
  createdAt?: FirebaseFirestore.Timestamp
}

const collectionName = 'users'

function getDb() {
  return firebaseAdmin.init().firestore()
}

export async function createUserProfile(uid: string, profile: Partial<UserProfile>) {
  const db = getDb()
  const admin = firebaseAdmin.init()
  const now = admin.firestore.FieldValue.serverTimestamp()
  await db.collection(collectionName).doc(uid).set({ uid, ...profile, createdAt: now })
  const snap = await db.collection(collectionName).doc(uid).get()
  return snap.exists ? (snap.data() as UserProfile) : null
}

export async function getUserProfile(uid: string) {
  const db = getDb()
  const snap = await db.collection(collectionName).doc(uid).get()
  return snap.exists ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>) {
  const db = getDb()
  await db.collection(collectionName).doc(uid).set(patch, { merge: true })
  return getUserProfile(uid)
}

export async function deleteUserProfile(uid: string) {
  const db = getDb()
  await db.collection(collectionName).doc(uid).delete()
  return true
}

export async function getUserByEmail(email: any) {
  const db = getDb()
  const snapshot = await db.collection(collectionName)
    .where('email', '==', email)
    .limit(1)
    .get()
  
  if (snapshot.empty) {
    return null
  }
  
  return snapshot.docs[0].data() as UserProfile
}

export default { createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile, getUserByEmail }
