import { useState, useCallback } from 'react';
import type { Project, ProjectTask, ProjectSection, ProjectColor, Priority } from '../types';

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const STORAGE_KEY = 'cutasks-projects';

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);

  const update = useCallback((updater: (prev: Project[]) => Project[]) => {
    setProjects(prev => {
      const next = updater(prev);
      saveProjects(next);
      return next;
    });
  }, []);

  // ── Project CRUD ────────────────────────────────────
  const createProject = useCallback((
    name: string,
    color: ProjectColor,
    emoji?: string,
    description?: string,
  ): string => {
    const id = generateId('proj');
    const project: Project = {
      id,
      name: name.trim(),
      description: description?.trim(),
      color,
      emoji,
      sections: [],
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    update(prev => [project, ...prev]);
    return id;
  }, [update]);

  const editProject = useCallback((
    id: string,
    fields: Partial<Pick<Project, 'name' | 'description' | 'color' | 'emoji'>>,
  ) => {
    update(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
  }, [update]);

  const deleteProject = useCallback((id: string) => {
    update(prev => prev.filter(p => p.id !== id));
  }, [update]);

  // ── Section CRUD ────────────────────────────────────
  const addSection = useCallback((projectId: string, title: string, icon?: string) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const section: ProjectSection = {
        id: generateId('sec'),
        title: title.trim(),
        order: p.sections.length,
        icon,
      };
      return { ...p, sections: [...p.sections, section] };
    }));
  }, [update]);

  const editSection = useCallback((projectId: string, sectionId: string, title: string, icon?: string) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, title, icon } : s) };
    }));
  }, [update]);

  const deleteSection = useCallback((projectId: string, sectionId: string) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      // Move tasks from deleted section to unsectioned
      const tasks = p.tasks.map(t => t.sectionId === sectionId ? { ...t, sectionId: undefined } : t);
      return { ...p, sections: p.sections.filter(s => s.id !== sectionId), tasks };
    }));
  }, [update]);

  // ── Task CRUD ────────────────────────────────────────
  const addTask = useCallback((
    projectId: string,
    title: string,
    priority: Priority,
    deadline?: string,
    description?: string,
    sectionId?: string,
  ) => {
    const task: ProjectTask = {
      id: generateId('ptask'),
      title: title.trim(),
      description: description?.trim(),
      priority,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
      sectionId,
    };
    update(prev => prev.map(p => p.id === projectId
      ? { ...p, tasks: [task, ...p.tasks] }
      : p,
    ));
  }, [update]);

  const editTask = useCallback((
    projectId: string,
    taskId: string,
    fields: Partial<Pick<ProjectTask, 'title' | 'description' | 'priority' | 'deadline' | 'sectionId'>>,
  ) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...fields } : t) };
    }));
  }, [update]);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
    }));
  }, [update]);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) };
    }));
  }, [update]);

  const reorderTask = useCallback((
    projectId: string,
    taskId: string,
    targetSectionId: string | undefined,
    beforeTaskId: string | undefined,
  ) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const task = p.tasks.find(t => t.id === taskId);
      if (!task) return p;
      const updatedTask = { ...task, sectionId: targetSectionId };
      const remaining = p.tasks.filter(t => t.id !== taskId);
      if (beforeTaskId) {
        const idx = remaining.findIndex(t => t.id === beforeTaskId);
        if (idx === -1) return { ...p, tasks: [...remaining, updatedTask] };
        const next = [...remaining];
        next.splice(idx, 0, updatedTask);
        return { ...p, tasks: next };
      } else {
        const sectionTasks = remaining.filter(t => t.sectionId === targetSectionId);
        const otherTasks = remaining.filter(t => t.sectionId !== targetSectionId);
        return { ...p, tasks: [...otherTasks, ...sectionTasks, updatedTask] };
      }
    }));
  }, [update]);

  const reorderSection = useCallback((
    projectId: string,
    sectionId: string,
    beforeSectionId: string | undefined,
  ) => {
    update(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const section = p.sections.find(s => s.id === sectionId);
      if (!section) return p;
      const remaining = p.sections.filter(s => s.id !== sectionId);
      let reordered: typeof remaining;
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
      return { ...p, sections: reordered.map((s, i) => ({ ...s, order: i })) };
    }));
  }, [update]);

  return {
    projects,
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