import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, Project, Section, ProjectTask } from '../types';

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

export async function loadAllData(uid: string) {
  const [taskSnap, projectSnap, sectionSnap, ptSnap] = await Promise.all([
    getDocs(userCol(uid, 'tasks')),
    getDocs(userCol(uid, 'projects')),
    getDocs(userCol(uid, 'sections')),
    getDocs(userCol(uid, 'projectTasks')),
  ]);

  return {
    tasks: taskSnap.docs.map((d) => docToTask(d.id, d.data())),
    projects: projectSnap.docs.map((d) => docToProject(d.id, d.data())),
    sections: sectionSnap.docs.map((d) => docToSection(d.id, d.data())),
    projectTasks: ptSnap.docs.map((d) => docToProjectTask(d.id, d.data())),
  };
}

export async function saveAllData(
  uid: string,
  data: {
    tasks: Task[];
    projects: Project[];
    sections: Section[];
    projectTasks: ProjectTask[];
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

export interface UserSettings {
  theme: string;
  deleteMode: string;
}

export async function loadSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'prefs'));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { theme: d.t || 'dark', deleteMode: d.d || 'instant' };
}

export async function saveSettings(uid: string, settings: UserSettings) {
  await setDoc(doc(db, 'users', uid, 'settings', 'prefs'), {
    t: settings.theme,
    d: settings.deleteMode,
  });
}
