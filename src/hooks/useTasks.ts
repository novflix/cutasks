import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/useAuth';
import type { Task, Priority } from '../types';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [initialized, setInitialized] = useState(false);

  const tasksRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [user]);

  useEffect(() => {
    if (!user) {
      return () => {
        setTasks([]);
        setInitialized(false);
      };
    }

    const ref = tasksRef();
    if (!ref) return;

    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          description: data.description,
          priority: data.priority ?? 'medium',
          deadline: data.deadline,
          completed: data.completed ?? false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        } as Task;
      });
      setTasks(loaded);
      setInitialized(true);
    });

    return unsubscribe;
  }, [user, tasksRef]);

  const addTask = useCallback(async (
    title: string,
    priority: Priority,
    deadline?: string,
    description?: string,
  ) => {
    const ref = tasksRef();
    if (!ref) return;

    await addDoc(ref, {
      title: title.trim(),
      description: description?.trim() ?? null,
      priority,
      deadline: deadline ?? null,
      completed: false,
      createdAt: serverTimestamp(),
    });
  }, [tasksRef]);

  const editTask = useCallback(async (
    id: string,
    fields: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline'>>,
  ) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'tasks', id);
    await updateDoc(ref, {
      ...fields,
      description: fields.description?.trim() ?? null,
    });
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'tasks', id);
    await deleteDoc(ref);
  }, [user]);

  const toggleTask = useCallback(async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const ref = doc(db, 'users', user.uid, 'tasks', id);
    await updateDoc(ref, { completed: !task.completed });
  }, [user, tasks]);

  return { tasks, addTask, editTask, deleteTask, toggleTask, initialized };
}