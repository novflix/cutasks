import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task, Project, Section, ProjectTask, Habit, Priority, FilterType } from '../types';
import { generateId, priorityOrder, sanitizeInput, getDeadlineStatus } from '../utils';
import { getAllTags } from '../storage';
import { saveTasksDirty as fsSaveTasksDirty, saveProjectsDirty as fsSaveProjectsDirty, saveSectionsDirty as fsSaveSectionsDirty, saveProjectTasksDirty as fsSaveProjectTasksDirty, saveHabitsDirty as fsSaveHabitsDirty, loadAllData, loadSettings, subscribeToAllData } from '../services/firestore';
import { useAuth } from './AuthContext';
import { TaskContext, type TaskContextValue } from './TaskContextDef';

export type { TaskContextValue };

function cleanupExpired(tasks: Task[], projectTasks: ProjectTask[]): { tasks: Task[]; projectTasks: ProjectTask[] } {
  const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';
  if (mode === 'instant') return { tasks, projectTasks };

  const retentionMs = mode === '3days' ? 3 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const expiredTaskIds = new Set(
    tasks.filter((t) => t.completed && t.completedAt && now - t.completedAt > retentionMs).map((t) => t.id)
  );
  const expiredPtIds = new Set(
    projectTasks.filter((t) => t.completed && t.completedAt && now - t.completedAt > retentionMs).map((t) => t.id)
  );
  return {
    tasks: expiredTaskIds.size > 0
      ? tasks.filter((t) => !expiredTaskIds.has(t.id)).map((t) => t.parentId && expiredTaskIds.has(t.parentId) ? { ...t, parentId: null } : t)
      : tasks,
    projectTasks: expiredPtIds.size > 0
      ? projectTasks.filter((t) => !expiredPtIds.has(t.id)).map((t) => t.parentId && expiredPtIds.has(t.parentId) ? { ...t, parentId: null } : t)
      : projectTasks,
  };
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // ── Core state ──
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dataLoading, setDataLoading] = useState(() => {
    return !localStorage.getItem('cutasks_tasks') && !localStorage.getItem('cutasks_projects');
  });

  // ── Filter state ──
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectTaskFilter, setProjectTaskFilter] = useState<FilterType>('all');
  const [projectTaskSearch, setProjectTaskSearch] = useState('');

  // ── Settings ──
  const [defaultPriority, setDefaultPriority] = useState<Priority>('medium');
  const [weekStart, setWeekStart] = useState<string>(() => localStorage.getItem('cutasks_week_start') || 'monday');
  const [expandProjects, setExpandProjects] = useState<boolean>(() => localStorage.getItem('cutasks_expand_projects') === '1');

  // ── Delete confirmation ──
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'task' | 'project'; id: string; title: string } | null>(null);

  // ── Refs for sync ──
  const syncReadyRef = useRef(false);
  const syncGenerationRef = useRef(0);
  const lastSavedGenerationRef = useRef(0);
  const dirtyTasksRef = useRef<Set<string>>(new Set());
  const dirtyProjectsRef = useRef<Set<string>>(new Set());
  const dirtySectionsRef = useRef<Set<string>>(new Set());
  const dirtyProjectTasksRef = useRef<Set<string>>(new Set());
  const dirtyHabitsRef = useRef<Set<string>>(new Set());
  const tasksRef = useRef(tasks);
  const projectsRef = useRef(projects);
  const sectionsRef = useRef(sections);
  const projectTasksRef = useRef(projectTasks);
  const habitsRef = useRef(habits);
  const historyRef = useRef<{ tasks: Task[]; projects: Project[]; sections: Section[]; projectTasks: ProjectTask[]; habits: Habit[] }[]>([]);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { projectTasksRef.current = projectTasks; }, [projectTasks]);
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  // ── Load data ──
  useEffect(() => {
    if (!user) return;

    syncReadyRef.current = false;
    syncGenerationRef.current = 0;
    lastSavedGenerationRef.current = 0;
    dirtyTasksRef.current = new Set();
    dirtyProjectsRef.current = new Set();
    dirtySectionsRef.current = new Set();
    dirtyProjectTasksRef.current = new Set();
    dirtyHabitsRef.current = new Set();
    requestAnimationFrame(() => setDataLoading(true));

    loadAllData(user.uid).then((data) => {
      const cleaned = cleanupExpired(data.tasks, data.projectTasks);
      setTasks(cleaned.tasks);
      setProjects(data.projects);
      setSections(data.sections);
      setProjectTasks(cleaned.projectTasks);
      setHabits(data.habits);
      syncReadyRef.current = true;
      syncGenerationRef.current = 1;
      lastSavedGenerationRef.current = 1;
      setDataLoading(false);
    }).catch(() => {
      syncReadyRef.current = true;
      syncGenerationRef.current = 1;
      lastSavedGenerationRef.current = 1;
      setDataLoading(false);
    });

    loadSettings(user.uid).then((settings) => {
      if (settings) {
        localStorage.setItem('cutasks_theme', settings.theme);
        localStorage.setItem('cutasks_delete_mode', settings.deleteMode);
        localStorage.setItem('cutasks_week_start', settings.weekStart);
        document.documentElement.setAttribute('data-theme', settings.theme);
        setDefaultPriority((settings.defaultPriority as Priority) || 'medium');
      }
    }).catch(() => {});

    const unsubscribe = subscribeToAllData(user.uid, {
      onTasks: (tasks) => {
        if (!syncReadyRef.current) return;
        syncGenerationRef.current++;
        const cleaned = cleanupExpired(tasks, projectTasksRef.current);
        setTasks(cleaned.tasks);
      },
      onProjects: (projects) => {
        if (!syncReadyRef.current) return;
        syncGenerationRef.current++;
        setProjects(projects);
      },
      onSections: (sections) => {
        if (!syncReadyRef.current) return;
        syncGenerationRef.current++;
        setSections(sections);
      },
      onProjectTasks: (projectTasks) => {
        if (!syncReadyRef.current) return;
        syncGenerationRef.current++;
        const cleaned = cleanupExpired(tasksRef.current, projectTasks);
        setProjectTasks(cleaned.projectTasks);
      },
      onHabits: (habits) => {
        if (!syncReadyRef.current) return;
        syncGenerationRef.current++;
        setHabits(habits);
      },
    });

    return () => { unsubscribe(); };
  }, [user]);

  // ── Dirty sync: tasks ──
  useEffect(() => {
    if (user && syncReadyRef.current && dirtyTasksRef.current.size > 0) {
      const gen = syncGenerationRef.current;
      const dirty = new Set(dirtyTasksRef.current);
      dirtyTasksRef.current = new Set();
      const timer = setTimeout(() => {
        lastSavedGenerationRef.current = gen;
        fsSaveTasksDirty(user.uid, tasks, dirty).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tasks, user]);

  // ── Dirty sync: projects ──
  useEffect(() => {
    if (user && syncReadyRef.current && dirtyProjectsRef.current.size > 0) {
      const gen = syncGenerationRef.current;
      const dirty = new Set(dirtyProjectsRef.current);
      dirtyProjectsRef.current = new Set();
      const timer = setTimeout(() => {
        lastSavedGenerationRef.current = gen;
        fsSaveProjectsDirty(user.uid, projects, dirty).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projects, user]);

  // ── Dirty sync: project tasks ──
  useEffect(() => {
    if (user && syncReadyRef.current && dirtyProjectTasksRef.current.size > 0) {
      const gen = syncGenerationRef.current;
      const dirty = new Set(dirtyProjectTasksRef.current);
      dirtyProjectTasksRef.current = new Set();
      const timer = setTimeout(() => {
        lastSavedGenerationRef.current = gen;
        fsSaveProjectTasksDirty(user.uid, projectTasks, dirty).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projectTasks, user]);

  // ── Dirty sync: sections ──
  useEffect(() => {
    if (user && syncReadyRef.current && dirtySectionsRef.current.size > 0) {
      const gen = syncGenerationRef.current;
      const dirty = new Set(dirtySectionsRef.current);
      dirtySectionsRef.current = new Set();
      const timer = setTimeout(() => {
        lastSavedGenerationRef.current = gen;
        fsSaveSectionsDirty(user.uid, sections, dirty).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sections, user]);

  // ── Dirty sync: habits ──
  useEffect(() => {
    if (user && syncReadyRef.current && dirtyHabitsRef.current.size > 0) {
      const gen = syncGenerationRef.current;
      const dirty = new Set(dirtyHabitsRef.current);
      dirtyHabitsRef.current = new Set();
      const timer = setTimeout(() => {
        lastSavedGenerationRef.current = gen;
        fsSaveHabitsDirty(user.uid, habits, dirty).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [habits, user]);

  // ── Undo ──
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setTasks(prev.tasks);
    setProjects(prev.projects);
    setSections(prev.sections);
    setProjectTasks(prev.projectTasks);
    setHabits(prev.habits);
    dirtyTasksRef.current.clear();
    dirtyProjectsRef.current.clear();
    dirtySectionsRef.current.clear();
    dirtyProjectTasksRef.current.clear();
    dirtyHabitsRef.current.clear();
  }, []);

  const pushHistory = useCallback(() => {
    historyRef.current.push({
      tasks: [...tasksRef.current],
      projects: [...projectsRef.current],
      sections: [...sectionsRef.current],
      projectTasks: [...projectTasksRef.current],
      habits: [...habitsRef.current],
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, []);

  // ── Task operations ──
  const createTask = useCallback((title: string) => {
    pushHistory();
    const now = Date.now();
    const newTask: Task = {
      id: generateId(),
      title: sanitizeInput(title),
      description: '',
      priority: defaultPriority,
      deadline: '',
      tags: [],
      completed: false,
      completedAt: null,
      parentId: null,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    dirtyTasksRef.current.add(newTask.id);
  }, [pushHistory, defaultPriority]);

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    pushHistory();
    dirtyTasksRef.current.add(id);
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t));
  }, [pushHistory]);

  const deleteTask = useCallback((id: string) => {
    pushHistory();
    dirtyTasksRef.current.add(id);
    setTasks((prev) => prev.filter((t) => t.id !== id).map((t) => t.parentId === id ? { ...t, parentId: null } : t));
  }, [pushHistory]);

  const toggleTask = useCallback((id: string) => {
    pushHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';
    const now = Date.now();
    dirtyTasksRef.current.add(id);

    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null, updatedAt: now } : t)
    );

    if (mode === 'instant') {
      setTimeout(() => {
        setTasks((prev) => {
          const task = prev.find((t) => t.id === id);
          if (!task || !task.completed) return prev;
          return prev.filter((t) => t.id !== id).map((t) => t.parentId === id ? { ...t, parentId: null } : t);
        });
      }, 800);
    }
  }, [pushHistory]);

  const setSubtaskOf = useCallback((childId: string, newParentId: string | null) => {
    if (childId === newParentId) return;
    pushHistory();
    dirtyTasksRef.current.add(childId);
    setTasks((prev) => prev.map((t) => t.id === childId ? { ...t, parentId: newParentId, updatedAt: Date.now() } : t));
  }, [pushHistory]);

  // ── Project operations ──
  const createProject = useCallback((name: string) => {
    pushHistory();
    const now = Date.now();
    const newProject: Project = {
      id: generateId(),
      name: sanitizeInput(name),
      description: '',
      icon: 'Folder',
      color: '#ed9b6d',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [newProject, ...prev]);
    dirtyProjectsRef.current.add(newProject.id);
  }, [pushHistory]);

  const updateProject = useCallback((id: string, changes: Partial<Project>) => {
    pushHistory();
    dirtyProjectsRef.current.add(id);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p));
  }, [pushHistory]);

  const deleteProject = useCallback((id: string) => {
    pushHistory();
    dirtyProjectsRef.current.add(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Use functional updates to avoid stale closures
    setProjectTasks((prev) => {
      const toDelete = prev.filter((t) => t.projectId === id);
      toDelete.forEach((t) => dirtyProjectTasksRef.current.add(t.id));
      return prev.filter((t) => t.projectId !== id);
    });
    setSections((prev) => {
      const toDelete = prev.filter((s) => s.projectId === id);
      toDelete.forEach((s) => dirtySectionsRef.current.add(s.id));
      return prev.filter((s) => s.projectId !== id);
    });
  }, [pushHistory]);

  const reorderProjects = useCallback((fromIndex: number, toIndex: number) => {
    setProjects((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      for (const p of updated) dirtyProjectsRef.current.add(p.id);
      return updated;
    });
  }, []);

  // ── Project task operations ──
  const createProjectTask = useCallback((projectId: string, title: string, sectionId?: string | null) => {
    pushHistory();
    const now = Date.now();
    const newTask: ProjectTask = {
      id: generateId(),
      projectId,
      title: sanitizeInput(title),
      description: '',
      priority: defaultPriority,
      deadline: '',
      tags: [],
      completed: false,
      completedAt: null,
      parentId: null,
      sectionId: sectionId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    setProjectTasks((prev) => [newTask, ...prev]);
    dirtyProjectTasksRef.current.add(newTask.id);
  }, [pushHistory, defaultPriority]);

  const updateProjectTask = useCallback((id: string, changes: Partial<ProjectTask>) => {
    pushHistory();
    dirtyProjectTasksRef.current.add(id);
    setProjectTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t));
  }, [pushHistory]);

  const deleteProjectTask = useCallback((id: string) => {
    pushHistory();
    dirtyProjectTasksRef.current.add(id);
    setProjectTasks((prev) => prev.filter((t) => t.id !== id).map((t) => t.parentId === id ? { ...t, parentId: null } : t));
  }, [pushHistory]);

  const toggleProjectTask = useCallback((id: string) => {
    pushHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';
    const now = Date.now();
    dirtyProjectTasksRef.current.add(id);

    setProjectTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null, updatedAt: now } : t)
    );

    if (mode === 'instant') {
      setTimeout(() => {
        setProjectTasks((prev) => {
          const task = prev.find((t) => t.id === id);
          if (!task || !task.completed) return prev;
          return prev.filter((t) => t.id !== id).map((t) => t.parentId === id ? { ...t, parentId: null } : t);
        });
      }, 800);
    }
  }, [pushHistory]);

  // ── Derived state ──
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter === 'active') result = result.filter((t) => !t.completed);
    if (filter === 'completed') result = result.filter((t) => t.completed);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = priorityOrder[a.priority];
      const pb = priorityOrder[b.priority];
      if (pa !== pb) return pa - pb;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, searchQuery]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const projectIdsWithMatchingTasks = new Set(
        projectTasks.filter((t) => t.title.toLowerCase().includes(q)).map((t) => t.projectId)
      );
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || projectIdsWithMatchingTasks.has(p.id)
      );
    }
    return result;
  }, [projects, projectSearch, projectTasks]);

  const taskStats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => !t.completed && getDeadlineStatus(t.deadline, t.completed) === 'overdue').length,
  }), [tasks]);

  const taskStatsFormatted = useMemo(() => [
    { label: t('common.total'), value: taskStats.total },
    { label: t('common.active'), value: taskStats.active, color: '#ed9b6d' },
    { label: t('common.done'), value: taskStats.completed, color: '#66bb6a' },
    ...(taskStats.overdue > 0 ? [{ label: t('common.overdue'), value: taskStats.overdue, color: '#ef5350' }] : []),
  ], [taskStats, t]);

  const allTags = useMemo(() => getAllTags(tasks), [tasks]);
  const allProjectTags = useMemo(() => getAllTags(projectTasks), [projectTasks]);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  const projectStats = useMemo(() => [
    { label: t('common.total'), value: projects.length },
    { label: t('common.active'), value: projects.filter((p) => p.status === 'active').length, color: '#66bb6a' },
    { label: t('common.paused'), value: projects.filter((p) => p.status === 'paused').length, color: '#ffb74d' },
    { label: t('common.done'), value: projects.filter((p) => p.status === 'completed').length, color: '#64b5f6' },
  ], [projects, t]);

  // ── Delete confirmation ──
  const confirmDeleteTask = useCallback((id: string) => { deleteTask(id); }, [deleteTask]);
  const confirmDeleteProject = useCallback((id: string) => { deleteProject(id); }, [deleteProject]);
  const confirmDeleteProjectTask = useCallback((id: string) => { deleteProjectTask(id); }, [deleteProjectTask]);

  const value: TaskContextValue = {
    tasks, projects, sections, projectTasks, habits, dataLoading,
    createTask, updateTask, deleteTask, toggleTask, setSubtaskOf,
    createProject, updateProject, deleteProject, reorderProjects,
    createProjectTask, updateProjectTask, deleteProjectTask, toggleProjectTask,
    setSections, setHabits, undo,
    filter, setFilter, searchQuery, setSearchQuery,
    projectSearch, setProjectSearch, projectTaskFilter, setProjectTaskFilter,
    projectTaskSearch, setProjectTaskSearch,
    filteredTasks, filteredProjects,
    allTags, allProjectTags, taskStats, projectStats, taskStatsFormatted,
    taskMap,
    defaultPriority, setDefaultPriority, weekStart, setWeekStart,
    expandProjects, setExpandProjects,
    confirmDelete, setConfirmDelete, confirmDeleteTask, confirmDeleteProject, confirmDeleteProjectTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
