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
import type { Project, ProjectTask, ProjectSection, ProjectColor, Priority } from '../types';

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const projectsRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [user]);

  const projectDoc = useCallback((id: string) => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'projects', id);
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const ref = projectsRef();
    if (!ref) return;

    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Project[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? '',
          description: data.description,
          color: data.color ?? 'sky',
          emoji: data.emoji,
          sections: data.sections ?? [],
          tasks: data.tasks ?? [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        } as Project;
      });
      setProjects(loaded);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, projectsRef]);

  const updateProject = useCallback(async (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    const ref = projectDoc(id);
    if (!ref) return;
    await updateDoc(ref, data as Record<string, unknown>);
  }, [projectDoc]);

  // ── Project CRUD ────────────────────────────────────
  const createProject = useCallback(async (
    name: string,
    color: ProjectColor,
    emoji?: string,
    description?: string,
  ): Promise<string> => {
    const ref = projectsRef();
    if (!ref) return '';
    const docRef = await addDoc(ref, {
      name: name.trim(),
      description: description?.trim() ?? null,
      color,
      emoji: emoji ?? null,
      sections: [],
      tasks: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }, [projectsRef]);

  const editProject = useCallback(async (
    id: string,
    fields: Partial<Pick<Project, 'name' | 'description' | 'color' | 'emoji'>>,
  ) => {
    await updateProject(id, fields);
  }, [updateProject]);

  const deleteProject = useCallback(async (id: string) => {
    const ref = projectDoc(id);
    if (!ref) return;
    await deleteDoc(ref);
  }, [projectDoc]);

  // ── Section CRUD ────────────────────────────────────
  const addSection = useCallback(async (projectId: string, title: string, icon?: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const section: ProjectSection = {
      id: generateId('sec'),
      title: title.trim(),
      order: project.sections.length,
      icon: icon ?? null,
    };
    await updateProject(projectId, { sections: [...project.sections, section] });
  }, [projects, updateProject]);

  const editSection = useCallback(async (projectId: string, sectionId: string, title: string, icon?: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const sections = project.sections.map(s =>
      s.id === sectionId ? { ...s, title, icon: icon ?? null } : s
    );
    await updateProject(projectId, { sections });
  }, [projects, updateProject]);

  const deleteSection = useCallback(async (projectId: string, sectionId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const sections = project.sections.filter(s => s.id !== sectionId);
    const tasks = project.tasks.map(t =>
      t.sectionId === sectionId ? { ...t, sectionId: null } : t
    );
    await updateProject(projectId, { sections, tasks });
  }, [projects, updateProject]);

  // ── Task CRUD ────────────────────────────────────────
  const addTask = useCallback(async (
    projectId: string,
    title: string,
    priority: Priority,
    deadline?: string,
    description?: string,
    sectionId?: string,
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const task = {
      id: generateId('ptask'),
      title: title.trim(),
      description: description?.trim() ?? null,
      priority,
      deadline: deadline ?? null,
      completed: false,
      createdAt: new Date().toISOString(),
      sectionId: sectionId ?? null,
    };
    await updateProject(projectId, { tasks: [task, ...project.tasks] });
  }, [projects, updateProject]);

  const editTask = useCallback(async (
    projectId: string,
    taskId: string,
    fields: Partial<Pick<ProjectTask, 'title' | 'description' | 'priority' | 'deadline' | 'sectionId'>>,
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const sanitized = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v === undefined ? null : v])
    );
    const tasks = project.tasks.map(t => t.id === taskId ? { ...t, ...sanitized } : t);
    await updateProject(projectId, { tasks });
  }, [projects, updateProject]);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const tasks = project.tasks.filter(t => t.id !== taskId);
    await updateProject(projectId, { tasks });
  }, [projects, updateProject]);

  const toggleTask = useCallback(async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const tasks = project.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    await updateProject(projectId, { tasks });
  }, [projects, updateProject]);

  const reorderTask = useCallback(async (
    projectId: string,
    taskId: string,
    targetSectionId: string | undefined,
    beforeTaskId: string | undefined,
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, sectionId: targetSectionId ?? null };
    const remaining = project.tasks.filter(t => t.id !== taskId);
    let reordered: ProjectTask[];
    if (beforeTaskId) {
      const idx = remaining.findIndex(t => t.id === beforeTaskId);
      if (idx === -1) {
        reordered = [...remaining, updatedTask];
      } else {
        reordered = [...remaining];
        reordered.splice(idx, 0, updatedTask);
      }
    } else {
      const sectionTasks = remaining.filter(t => t.sectionId === targetSectionId);
      const otherTasks = remaining.filter(t => t.sectionId !== targetSectionId);
      reordered = [...otherTasks, ...sectionTasks, updatedTask];
    }
    await updateProject(projectId, { tasks: reordered });
  }, [projects, updateProject]);

  const reorderSection = useCallback(async (
    projectId: string,
    sectionId: string,
    beforeSectionId: string | undefined,
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const section = project.sections.find(s => s.id === sectionId);
    if (!section) return;
    const remaining = project.sections.filter(s => s.id !== sectionId);
    let reordered: ProjectSection[];
    if (beforeSectionId) {
      const idx = remaining.findIndex(s => s.id === beforeSectionId);
      if (idx === -1) {
        reordered = [...remaining, section];
      } else {
        reordered = [...remaining];
        reordered.splice(idx, 0, section);
      }
    } else {
      reordered = [...remaining, section];
    }
    await updateProject(projectId, {
      sections: reordered.map((s, i) => ({ ...s, order: i })),
    });
  }, [projects, updateProject]);

  return {
    projects,
    loading,
    createProject,
    editProject,
    deleteProject,
    addSection,
    editSection,
    deleteSection,
    addTask,
    editTask,
    deleteTask,
    toggleTask,
    reorderTask,
    reorderSection,
  };
}