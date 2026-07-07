import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sanitizeInput } from '../utils';

export async function register(email: string, password: string, displayName: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: sanitizeInput(displayName) });
  return credential.user;
}

export async function login(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function deleteAccount(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  const BATCH_LIMIT = 500;
  const collections = ['tasks', 'projects', 'sections', 'projectTasks', 'habits', 'settings'];
  for (const col of collections) {
    const snap = await getDocs(collection(db, 'users', user.uid, col));
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      const chunk = docs.slice(i, i + BATCH_LIMIT);
      for (const d of chunk) {
        batch.delete(doc(db, 'users', user.uid, col, d.id));
      }
      await batch.commit();
    }
  }

  await deleteUser(user);
}

export async function updateDisplayName(name: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await updateProfile(user, { displayName: sanitizeInput(name) });
}
