import {
  collection,
  doc,
  getDocs,
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

  const writeCollection = <T>(colName: string, items: T[], toDoc: (item: T) => DocumentData) => {
    for (const item of items) {
      const id = (item as { id: string }).id;
      batch.set(userDoc(uid, colName, id), toDoc(item));
    }
  };

  writeCollection('tasks', data.tasks, taskToDoc);
  writeCollection('projects', data.projects, projectToDoc);
  writeCollection('sections', data.sections, sectionToDoc);
  writeCollection('projectTasks', data.projectTasks, projectTaskToDoc);

  await batch.commit();
}

export async function saveTasks(uid: string, tasks: Task[]) {
  const batch = writeBatch(db);
  for (const t of tasks) {
    batch.set(userDoc(uid, 'tasks', t.id), taskToDoc(t));
  }
  await batch.commit();
}

export async function saveProjects(uid: string, projects: Project[]) {
  const batch = writeBatch(db);
  for (const p of projects) {
    batch.set(userDoc(uid, 'projects', p.id), projectToDoc(p));
  }
  await batch.commit();
}

export async function saveSections(uid: string, sections: Section[]) {
  const batch = writeBatch(db);
  for (const s of sections) {
    batch.set(userDoc(uid, 'sections', s.id), sectionToDoc(s));
  }
  await batch.commit();
}

export async function saveProjectTasks(uid: string, tasks: ProjectTask[]) {
  const batch = writeBatch(db);
  for (const t of tasks) {
    batch.set(userDoc(uid, 'projectTasks', t.id), projectTaskToDoc(t));
  }
  await batch.commit();
}
