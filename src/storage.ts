import type { Task } from './types';

export function getAllTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) {
    for (const tag of t.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort();
}
