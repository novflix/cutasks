import { useCallback, useEffect } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';

export type DeletionDelay = 'immediate' | '24h' | '3d';

// localStorage accessors kept for backward compatibility / initial read
const KEY = 'cutasks-deletion-delay';

export function getDeletionDelay(): DeletionDelay {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'immediate' || v === '24h' || v === '3d') return v;
  } catch { /* ignore */ }
  return '24h';
}

export function setDeletionDelay(v: DeletionDelay): void {
  try {
    localStorage.setItem(KEY, v);
  } catch { /* ignore */ }
}

function delayMs(delay: DeletionDelay): number | null {
  if (delay === 'immediate') return 0;
  if (delay === '24h') return 24 * 60 * 60 * 1000;
  if (delay === '3d') return 3 * 24 * 60 * 60 * 1000;
  return null;
}

/**
 * Runs a background cleanup pass.
 * Now accepts deletionDelay as a parameter so it uses the synced value.
 */
export function useTaskDeletionCleanup(deletionDelay?: DeletionDelay) {
  const { user } = useAuth();

  const runCleanup = useCallback(async () => {
    if (!user) return;
    const delay = deletionDelay ?? getDeletionDelay();
    const ms = delayMs(delay);
    if (ms === null) return;

    const now = Date.now();

    // ── Standalone tasks ──────────────────────────────────────────────────
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const tasksSnap = await getDocs(query(tasksRef, orderBy('createdAt', 'desc')));

    for (const taskDoc of tasksSnap.docs) {
      const data = taskDoc.data();
      if (!data.completed) continue;

      const completedAt: number | null =
        typeof data.completedAt === 'number'
          ? data.completedAt
          : data.completedAt?.toMillis?.() ?? null;

      if (completedAt === null) {
        await updateDoc(doc(db, 'users', user.uid, 'tasks', taskDoc.id), {
          completedAt: now,
        });
        if (ms === 0) {
          await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskDoc.id));
        }
        continue;
      }

      if (now - completedAt >= ms) {
        await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskDoc.id));
      }
    }

    // ── Project tasks ────────────────────────────────────────────────────
    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const projectsSnap = await getDocs(projectsRef);

    for (const projectDoc of projectsSnap.docs) {
      const data = projectDoc.data() as Omit<Project, 'id'> & {
        completedCount?: number;
        tasks: Array<{
          id: string;
          completed: boolean;
          completedAt?: number | null;
        }>;
      };

      const tasks = data.tasks ?? [];
      let completedCount: number = data.completedCount ?? 0;
      let changed = false;
      const surviving: typeof tasks = [];

      for (const t of tasks) {
        if (!t.completed) {
          surviving.push(t);
          continue;
        }

        const completedAt: number | null =
          typeof t.completedAt === 'number' ? t.completedAt : null;

        if (completedAt === null) {
          if (ms === 0) {
            completedCount += 1;
            changed = true;
          } else {
            surviving.push({ ...t, completedAt: now });
            changed = true;
          }
          continue;
        }

        if (now - completedAt >= ms) {
          completedCount += 1;
          changed = true;
        } else {
          surviving.push(t);
        }
      }

      if (changed) {
        await updateDoc(doc(db, 'users', user.uid, 'projects', projectDoc.id), {
          tasks: surviving,
          completedCount,
        });
      }
    }
  }, [user, deletionDelay]);

  // Run on mount + every 5 minutes
  useEffect(() => {
    runCleanup();
    const id = setInterval(runCleanup, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [runCleanup]);

  return { runCleanup };
}