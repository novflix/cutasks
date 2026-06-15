import type { Task, Project } from './types';

const STORAGE_KEY = 'cutasks_tasks';
const PROJECTS_KEY = 'cutasks_projects';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: Task) => ({
      ...t,
      deadline: t.deadline || '',
      tags: t.tags || [],
      parentId: t.parentId ?? null,
    }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getAllTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) {
    for (const tag of t.tags) {
      set.add(tag);
    }
  }
  return Array.from(set).sort();
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((p: Project) => ({
      ...p,
      description: p.description || '',
      icon: p.icon || 'FolderMinimalistic',
      color: p.color || '#ed9b6d',
    }));
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
