import type { Task, Project, Section, ProjectTask, Habit } from './types';

const STORAGE_KEY = 'cutasks_tasks';
const PROJECTS_KEY = 'cutasks_projects';
const SECTIONS_KEY = 'cutasks_sections';
const PROJECT_TASKS_KEY = 'cutasks_project_tasks';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: Task) => ({
      ...t,
      deadline: t.deadline || '',
      tags: t.tags || [],
      completedAt: t.completedAt ?? null,
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
      icon: p.icon || 'Folder',
      color: p.color || '#ed9b6d',
      status: p.status || 'active',
    }));
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadSections(): Section[] {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSections(sections: Section[]) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

export function loadProjectTasks(): ProjectTask[] {
  try {
    const raw = localStorage.getItem(PROJECT_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: ProjectTask) => ({
      ...t,
      deadline: t.deadline || '',
      tags: t.tags || [],
      completedAt: t.completedAt ?? null,
      parentId: t.parentId ?? null,
      sectionId: t.sectionId ?? null,
    }));
  } catch {
    return [];
  }
}

export function saveProjectTasks(tasks: ProjectTask[]) {
  localStorage.setItem(PROJECT_TASKS_KEY, JSON.stringify(tasks));
}

const HABITS_KEY = 'cutasks_habits';

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((h: Habit) => ({
      ...h,
      icon: h.icon || 'Book',
      color: h.color || '#ed9b6d',
      streak: h.streak || 0,
      weekdays: h.weekdays || [0, 1, 2, 3, 4, 5, 6],
      completions: h.completions || {},
      createdAt: h.createdAt || Date.now(),
      updatedAt: h.updatedAt || Date.now(),
    }));
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}
