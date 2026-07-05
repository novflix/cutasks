import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, Project, Section, ProjectTask, Habit } from '../types';

function userCol(uid: string, name: string) {
  return collection(db, 'users', uid, name);
}

function userDoc(uid: string, name: string, id: string) {
  return doc(db, 'users', uid, name, id);
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function taskToDoc(t: Task): DocumentData {
  return stripUndefined({
    title: t.title,
    description: t.description,
    priority: t.priority,
    deadline: t.deadline || '',
    tags: t.tags || [],
    completed: t.completed,
    completedAt: t.completedAt || null,
    parentId: t.parentId || null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });
}

function projectToDoc(p: Project): DocumentData {
  return stripUndefined({
    name: p.name,
    description: p.description || '',
    icon: p.icon,
    color: p.color,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
}

function sectionToDoc(s: Section): DocumentData {
  return stripUndefined({
    projectId: s.projectId,
    name: s.name,
    order: s.order,
    createdAt: s.createdAt,
  });
}

function projectTaskToDoc(t: ProjectTask): DocumentData {
  return stripUndefined({
    projectId: t.projectId,
    sectionId: t.sectionId || null,
    title: t.title,
    description: t.description,
    priority: t.priority,
    deadline: t.deadline || '',
    tags: t.tags || [],
    completed: t.completed,
    completedAt: t.completedAt || null,
    parentId: t.parentId || null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });
}

function docToTask(id: string, data: DocumentData): Task {
  return {
    id,
    title: data.title ?? '',
    description: data.description ?? '',
    priority: data.priority ?? 'medium',
    deadline: data.deadline ?? '',
    tags: data.tags ?? [],
    completed: data.completed ?? false,
    completedAt: data.completedAt ?? null,
    parentId: data.parentId ?? null,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0,
  };
}

function docToProject(id: string, data: DocumentData): Project {
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    icon: data.icon ?? 'Folder',
    color: data.color ?? '#ed9b6d',
    status: data.status ?? 'active',
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0,
  };
}

function docToSection(id: string, data: DocumentData): Section {
  return {
    id,
    projectId: data.projectId ?? '',
    name: data.name ?? '',
    order: data.order ?? 0,
    createdAt: data.createdAt ?? 0,
  };
}

function docToProjectTask(id: string, data: DocumentData): ProjectTask {
  return {
    id,
    projectId: data.projectId ?? '',
    sectionId: data.sectionId ?? null,
    title: data.title ?? '',
    description: data.description ?? '',
    priority: data.priority ?? 'medium',
    deadline: data.deadline ?? '',
    tags: data.tags ?? [],
    completed: data.completed ?? false,
    completedAt: data.completedAt ?? null,
    parentId: data.parentId ?? null,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0,
  };
}

function habitToDoc(h: Habit): DocumentData {
  return stripUndefined({
    name: h.name,
    icon: h.icon,
    color: h.color,
    streak: h.streak,
    weekdays: h.weekdays || [0, 1, 2, 3, 4, 5, 6],
    completions: h.completions || {},
    targetReps: h.targetReps || 1,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  });
}

function docToHabit(id: string, data: DocumentData): Habit {
  return {
    id,
    name: data.name ?? '',
    icon: data.icon ?? 'Book',
    color: data.color ?? '#ed9b6d',
    streak: data.streak ?? 0,
    weekdays: data.weekdays ?? [0, 1, 2, 3, 4, 5, 6],
    completions: Object.fromEntries(
      Object.entries(data.completions ?? {}).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 1 : 0) : v])
    ) as Record<string, number>,
    targetReps: data.targetReps ?? 1,
    createdAt: data.createdAt ?? 0,
    updatedAt: data.updatedAt ?? 0,
  };
}

export async function loadAllData(uid: string) {
  const [taskSnap, projectSnap, sectionSnap, ptSnap, habitSnap] = await Promise.all([
    getDocs(userCol(uid, 'tasks')),
    getDocs(userCol(uid, 'projects')),
    getDocs(userCol(uid, 'sections')),
    getDocs(userCol(uid, 'projectTasks')),
    getDocs(userCol(uid, 'habits')),
  ]);

  return {
    tasks: taskSnap.docs.map((d) => docToTask(d.id, d.data())),
    projects: projectSnap.docs.map((d) => docToProject(d.id, d.data())),
    sections: sectionSnap.docs.map((d) => docToSection(d.id, d.data())),
    projectTasks: ptSnap.docs.map((d) => docToProjectTask(d.id, d.data())),
    habits: habitSnap.docs.map((d) => docToHabit(d.id, d.data())),
  };
}

export async function saveAllData(
  uid: string,
  data: {
    tasks: Task[];
    projects: Project[];
    sections: Section[];
    projectTasks: ProjectTask[];
    habits?: Habit[];
  }
) {
  const batch = writeBatch(db);

  const metaRef = doc(db, 'users', uid);
  batch.set(metaRef, { updatedAt: serverTimestamp() }, { merge: true });

  const syncCollection = async <T extends { id: string }>(
    colName: string,
    items: T[],
    toDoc: (item: T) => DocumentData
  ) => {
    const snap = await getDocs(userCol(uid, colName));
    const currentIds = new Set(snap.docs.map((d) => d.id));
    const newIds = new Set(items.map((i) => i.id));

    for (const item of items) {
      batch.set(userDoc(uid, colName, item.id), toDoc(item));
    }

    for (const id of currentIds) {
      if (!newIds.has(id)) {
        batch.delete(userDoc(uid, colName, id));
      }
    }
  };

  await syncCollection('tasks', data.tasks, taskToDoc);
  await syncCollection('projects', data.projects, projectToDoc);
  await syncCollection('sections', data.sections, sectionToDoc);
  await syncCollection('projectTasks', data.projectTasks, projectTaskToDoc);
  if (data.habits) {
    await syncCollection('habits', data.habits, habitToDoc);
  }

  await batch.commit();
}

export async function saveTasks(uid: string, tasks: Task[]) {
  const snap = await getDocs(userCol(uid, 'tasks'));
  const currentIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(tasks.map((t) => t.id));

  const batch = writeBatch(db);
  for (const t of tasks) {
    batch.set(userDoc(uid, 'tasks', t.id), taskToDoc(t));
  }
  for (const id of currentIds) {
    if (!newIds.has(id)) {
      batch.delete(userDoc(uid, 'tasks', id));
    }
  }
  await batch.commit();
}

export async function saveProjects(uid: string, projects: Project[]) {
  const snap = await getDocs(userCol(uid, 'projects'));
  const currentIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(projects.map((p) => p.id));

  const batch = writeBatch(db);
  for (const p of projects) {
    batch.set(userDoc(uid, 'projects', p.id), projectToDoc(p));
  }
  for (const id of currentIds) {
    if (!newIds.has(id)) {
      batch.delete(userDoc(uid, 'projects', id));
    }
  }
  await batch.commit();
}

export async function saveSections(uid: string, sections: Section[]) {
  const snap = await getDocs(userCol(uid, 'sections'));
  const currentIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(sections.map((s) => s.id));

  const batch = writeBatch(db);
  for (const s of sections) {
    batch.set(userDoc(uid, 'sections', s.id), sectionToDoc(s));
  }
  for (const id of currentIds) {
    if (!newIds.has(id)) {
      batch.delete(userDoc(uid, 'sections', id));
    }
  }
  await batch.commit();
}

export async function saveProjectTasks(uid: string, tasks: ProjectTask[]) {
  const snap = await getDocs(userCol(uid, 'projectTasks'));
  const currentIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(tasks.map((t) => t.id));

  const batch = writeBatch(db);
  for (const t of tasks) {
    batch.set(userDoc(uid, 'projectTasks', t.id), projectTaskToDoc(t));
  }
  for (const id of currentIds) {
    if (!newIds.has(id)) {
      batch.delete(userDoc(uid, 'projectTasks', id));
    }
  }
  await batch.commit();
}

export async function saveHabits(uid: string, habits: Habit[]) {
  const snap = await getDocs(userCol(uid, 'habits'));
  const currentIds = new Set(snap.docs.map((d) => d.id));
  const newIds = new Set(habits.map((h) => h.id));

  const batch = writeBatch(db);
  for (const h of habits) {
    batch.set(userDoc(uid, 'habits', h.id), habitToDoc(h));
  }
  for (const id of currentIds) {
    if (!newIds.has(id)) {
      batch.delete(userDoc(uid, 'habits', id));
    }
  }
  await batch.commit();
}

export async function saveTasksDirty(uid: string, tasks: Task[], dirtyIds: Set<string>) {
  if (dirtyIds.size === 0) return;
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const batch = writeBatch(db);
  for (const id of dirtyIds) {
    const task = taskMap.get(id);
    if (task) {
      batch.set(userDoc(uid, 'tasks', id), taskToDoc(task));
    } else {
      batch.delete(userDoc(uid, 'tasks', id));
    }
  }
  await batch.commit();
}

export async function saveProjectsDirty(uid: string, projects: Project[], dirtyIds: Set<string>) {
  if (dirtyIds.size === 0) return;
  const map = new Map(projects.map((p) => [p.id, p]));
  const batch = writeBatch(db);
  for (const id of dirtyIds) {
    const item = map.get(id);
    if (item) {
      batch.set(userDoc(uid, 'projects', id), projectToDoc(item));
    } else {
      batch.delete(userDoc(uid, 'projects', id));
    }
  }
  await batch.commit();
}

export async function saveSectionsDirty(uid: string, sections: Section[], dirtyIds: Set<string>) {
  if (dirtyIds.size === 0) return;
  const map = new Map(sections.map((s) => [s.id, s]));
  const batch = writeBatch(db);
  for (const id of dirtyIds) {
    const item = map.get(id);
    if (item) {
      batch.set(userDoc(uid, 'sections', id), sectionToDoc(item));
    } else {
      batch.delete(userDoc(uid, 'sections', id));
    }
  }
  await batch.commit();
}

export async function saveProjectTasksDirty(uid: string, tasks: ProjectTask[], dirtyIds: Set<string>) {
  if (dirtyIds.size === 0) return;
  const map = new Map(tasks.map((t) => [t.id, t]));
  const batch = writeBatch(db);
  for (const id of dirtyIds) {
    const item = map.get(id);
    if (item) {
      batch.set(userDoc(uid, 'projectTasks', id), projectTaskToDoc(item));
    } else {
      batch.delete(userDoc(uid, 'projectTasks', id));
    }
  }
  await batch.commit();
}

export async function saveHabitsDirty(uid: string, habits: Habit[], dirtyIds: Set<string>) {
  if (dirtyIds.size === 0) return;
  const map = new Map(habits.map((h) => [h.id, h]));
  const batch = writeBatch(db);
  for (const id of dirtyIds) {
    const item = map.get(id);
    if (item) {
      batch.set(userDoc(uid, 'habits', id), habitToDoc(item));
    } else {
      batch.delete(userDoc(uid, 'habits', id));
    }
  }
  await batch.commit();
}

export interface UserSettings {
  theme: string;
  deleteMode: string;
  weekStart: string;
  defaultPriority: string;
}

export async function loadSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'prefs'));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { theme: d.t || 'dark', deleteMode: d.d || 'instant', weekStart: d.w || 'monday', defaultPriority: d.p || 'medium' };
}

export async function saveSettings(uid: string, settings: UserSettings) {
  await setDoc(doc(db, 'users', uid, 'settings', 'prefs'), {
    t: settings.theme,
    d: settings.deleteMode,
    w: settings.weekStart,
    p: settings.defaultPriority,
  });
}

export interface RealtimeCallbacks {
  onTasks: (tasks: Task[]) => void;
  onProjects: (projects: Project[]) => void;
  onSections: (sections: Section[]) => void;
  onProjectTasks: (tasks: ProjectTask[]) => void;
  onHabits: (habits: Habit[]) => void;
}

export function subscribeToAllData(uid: string, callbacks: RealtimeCallbacks): Unsubscribe {
  const unsubTasks = onSnapshot(userCol(uid, 'tasks'), (snap) => {
    if (snap.docChanges().length === 0) return;
    callbacks.onTasks(snap.docs.map((d) => docToTask(d.id, d.data())));
  });
  const unsubProjects = onSnapshot(userCol(uid, 'projects'), (snap) => {
    if (snap.docChanges().length === 0) return;
    callbacks.onProjects(snap.docs.map((d) => docToProject(d.id, d.data())));
  });
  const unsubSections = onSnapshot(userCol(uid, 'sections'), (snap) => {
    if (snap.docChanges().length === 0) return;
    callbacks.onSections(snap.docs.map((d) => docToSection(d.id, d.data())));
  });
  const unsubProjectTasks = onSnapshot(userCol(uid, 'projectTasks'), (snap) => {
    if (snap.docChanges().length === 0) return;
    callbacks.onProjectTasks(snap.docs.map((d) => docToProjectTask(d.id, d.data())));
  });
  const unsubHabits = onSnapshot(userCol(uid, 'habits'), (snap) => {
    if (snap.docChanges().length === 0) return;
    callbacks.onHabits(snap.docs.map((d) => docToHabit(d.id, d.data())));
  });

  return () => {
    unsubTasks();
    unsubProjects();
    unsubSections();
    unsubProjectTasks();
    unsubHabits();
  };
}
