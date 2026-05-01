import { useState, useCallback } from 'react';
import type { Task, Priority } from '../types';

function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const STORAGE_KEY = 'cutasks-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const update = useCallback((updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev);
      saveTasks(next);
      return next;
    });
  }, []);

  const addTask = useCallback((title: string, priority: Priority, deadline?: string, description?: string) => {
    const task: Task = {
      id: generateId(),
      title: title.trim(),
      description: description?.trim(),
      priority,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    update(prev => [task, ...prev]);
  }, [update]);

  const editTask = useCallback((id: string, fields: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline'>>) => {
    update(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
  }, [update]);

  const deleteTask = useCallback((id: string) => {
    update(prev => prev.filter(t => t.id !== id));
  }, [update]);

  const toggleTask = useCallback((id: string) => {
    update(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [update]);

  return { tasks, addTask, editTask, deleteTask, toggleTask };
}
