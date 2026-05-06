import { useState, useCallback } from 'react';
import type { Task } from '../types';

export type SortField = 'createdAt' | 'priority' | 'deadline';

export interface SortConfig {
  field: SortField;
}

const STORAGE_KEY = 'cutasks_sort';

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  high:   0,
  medium: 1,
  low:    2,
};

function load(): SortConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SortConfig>;
      if (parsed.field) return { field: parsed.field };
    }
  } catch {
    // ignore parse errors
  }
  return { field: 'createdAt' };
}

function save(cfg: SortConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore storage errors
  }
}

export function sortTasks(tasks: Task[], cfg: SortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    if (cfg.field === 'createdAt') {
      // newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (cfg.field === 'priority') {
      // high → medium → low
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    if (cfg.field === 'deadline') {
      // closest to today first; no deadline goes to bottom
      const now = Date.now();
      const aTime = a.deadline ? new Date(a.deadline).getTime() - now : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() - now : Infinity;
      return aTime - bTime;
    }
    return 0;
  });
}

export function useTaskSort() {
  const [sort, setSort] = useState<SortConfig>(load);

  const setField = useCallback((field: SortField) => {
    const next: SortConfig = { field };
    setSort(next);
    save(next);
  }, []);

  const update = useCallback((cfg: SortConfig) => {
    setSort(cfg);
    save(cfg);
  }, []);

  return { sort, setField, update };
}