import type { Task } from '../types';

export type SortField = 'createdAt' | 'priority' | 'deadline';

export interface SortConfig {
  field: SortField;
}

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  high:   0,
  medium: 1,
  low:    2,
};

export function sortTasks(tasks: Task[], cfg: SortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    if (cfg.field === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (cfg.field === 'priority') {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    if (cfg.field === 'deadline') {
      const now = Date.now();
      const aTime = a.deadline ? new Date(a.deadline).getTime() - now : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() - now : Infinity;
      return aTime - bTime;
    }
    return 0;
  });
}

/**
 * useTaskSort has been simplified: it no longer owns state.
 * The sort config is now managed by AppSettings and passed down via props.
 * This hook is kept for the sortTasks utility and type exports.
 */