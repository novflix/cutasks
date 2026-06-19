import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import type { Task, Priority, Page, FilterType, Project, ProjectStatus, Section, ProjectTask, Habit } from './types';
import type { PomoMode, PomoConfig } from './pages/PomodoroPage';
import { LONG_BREAK_INTERVAL } from './pages/PomodoroPage';
import { generateId, priorityOrder } from './utils';
import { loadTasks, saveTasks as localSaveTasks, getAllTags, loadProjects, saveProjects as localSaveProjects, loadSections, saveSections as localSaveSections, loadProjectTasks, saveProjectTasks as localSaveProjectTasks, loadHabits, saveHabits as localSaveHabits } from './storage';
import { useAuth } from './contexts/AuthContext';
import { saveTasks as fsSaveTasks, saveProjects as fsSaveProjects, saveSections as fsSaveSections, saveProjectTasks as fsSaveProjectTasks, saveHabits as fsSaveHabits, loadAllData, loadSettings } from './services/firestore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskDetailModal from './components/TaskDetailModal';
import TaskFormModal from './components/TaskFormModal';
import ProjectsPage from './pages/ProjectsPage';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectRoute from './components/ProjectRoute';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import HabitsPage from './pages/HabitsPage';
import PomodoroPage from './pages/PomodoroPage';
import PomoMiniTimer from './components/PomoMiniTimer';
import TasksPage from './pages/TasksPage';
import MobileNav from './components/MobileNav';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { getDeadlineStatus } from './utils';
import { MinimalisticMagnifier, ArrowLeft } from '@solar-icons/react';
import { PROJECT_ICONS } from './constants';

function AnimatedRoutes({ routes }: { routes: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {routes}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [formClosing, setFormClosing] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormClosing, setProjectFormClosing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectIcon, setProjectIcon] = useState('Folder');
  const [projectColor, setProjectColor] = useState('#ed9b6d');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('active');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(loadProjectTasks);
  const [sections, setSections] = useState<Section[]>(loadSections);
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [weekStart, setWeekStart] = useState<string>(() => localStorage.getItem('cutasks_week_start') || 'monday');
  const [projectTaskFilter, setProjectTaskFilter] = useState<FilterType>('all');
  const [projectTaskSearch, setProjectTaskSearch] = useState('');
  const [showProjectTaskForm, setShowProjectTaskForm] = useState(false);
  const [projectTaskFormClosing, setProjectTaskFormClosing] = useState(false);
  const [editingProjectTask, setEditingProjectTask] = useState<ProjectTask | null>(null);
  const [viewingProjectTask, setViewingProjectTask] = useState<ProjectTask | null>(null);
  const [projectTaskDetailClosing, setProjectTaskDetailClosing] = useState(false);
  const [ptTitle, setPtTitle] = useState('');
  const [ptDescription, setPtDescription] = useState('');
  const [ptPriority, setPtPriority] = useState<Priority>('medium');
  const [ptDeadline, setPtDeadline] = useState('');
  const [ptTags, setPtTags] = useState<string[]>([]);
  const [ptParentId, setPtParentId] = useState<string | null>(null);
  const [ptSectionId, setPtSectionId] = useState<string | null>(null);
  const detailTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fsLoadedRef = useRef(false);
  const habitFormOpenerRef = useRef<(() => void) | null>(null);

  const POMO_STORAGE = 'cutasks_pomodoro';
  const POMO_STATE = 'cutasks_pomodoro_state';
  const defaultPomoConfig: PomoConfig = { work: 25, short: 5, long: 15 };
  const [pomoConfig, setPomoConfig] = useState<PomoConfig>(() => {
    try { const r = localStorage.getItem(POMO_STORAGE); return r ? { ...defaultPomoConfig, ...JSON.parse(r) } : defaultPomoConfig; } catch { return defaultPomoConfig; }
  });

  function loadPomoState() {
    try {
      const raw = localStorage.getItem(POMO_STATE);
      if (!raw) return null;
      const s: { running?: boolean; savedAt?: number; mode?: string; secondsLeft?: number; completedSessions?: number } = JSON.parse(raw);
      if (s.running && s.savedAt) {
        const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
        const remaining = Math.max(0, (s.secondsLeft ?? 0) - elapsed);
        if (remaining <= 0) return null;
        return { mode: (s.mode ?? 'work') as PomoMode, secondsLeft: remaining, completedSessions: s.completedSessions ?? 0 };
      }
      return { mode: (s.mode ?? 'work') as PomoMode, secondsLeft: s.secondsLeft ?? 0, completedSessions: s.completedSessions ?? 0 };
    } catch { return null; }
  }

  const savedPomo = loadPomoState();
  const [pomoMode, setPomoMode] = useState<PomoMode>(savedPomo?.mode ?? 'work');
  const [pomoSeconds, setPomoSeconds] = useState(() => savedPomo?.secondsLeft ?? pomoConfig.work * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(savedPomo?.completedSessions ?? 0);
  const [pomoCelebrate, setPomoCelebrate] = useState(false);
  const [pomoMiniVisible, setPomoMiniVisible] = useState(false);
  const [pomoMiniClosing, setPomoMiniClosing] = useState(false);
  const pomoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomoMiniTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const state = { mode: pomoMode, secondsLeft: pomoSeconds, completedSessions: pomoSessions, running: pomoRunning, savedAt: Date.now() };
    localStorage.setItem(POMO_STATE, JSON.stringify(state));
  }, [pomoMode, pomoSeconds, pomoSessions, pomoRunning]);

  useEffect(() => {
    if (pomoRunning) {
      setPomoMiniClosing(false);
      setPomoMiniVisible(true);
    } else if (pomoMiniVisible) {
      setPomoMiniClosing(true);
      pomoMiniTimer.current = setTimeout(() => {
        setPomoMiniVisible(false);
        setPomoMiniClosing(false);
      }, 300);
    }
    return () => { if (pomoMiniTimer.current) clearTimeout(pomoMiniTimer.current); };
  }, [pomoRunning]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POMO_STATE);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.running && s.secondsLeft > 0) setPomoRunning(true);
      }
    } catch { /* ignore */ }
  }, []);

  const activePage: Page = location.pathname.startsWith('/projects/') ? 'project-detail' : location.pathname.startsWith('/projects') ? 'projects' : location.pathname.startsWith('/settings') ? 'settings' : location.pathname.startsWith('/habits') || location.pathname.startsWith('/pomodoro') || location.pathname.startsWith('/home') ? 'home' : 'tasks';
  const activeProjectId = activePage === 'project-detail' ? location.pathname.split('/')[2] : null;
  const activeProject = useMemo(() => activeProjectId ? projects.find((p) => p.id === activeProjectId) ?? null : null, [projects, activeProjectId]);

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const historyRef = useRef<Task[][]>([]);
  const formTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (formTimer.current) clearTimeout(formTimer.current);
      if (detailTimer.current) clearTimeout(detailTimer.current);
      if (detailTimer2.current) clearTimeout(detailTimer2.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

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

    loadAllData(user.uid).then((data) => {
      loadSettings(user.uid).then((settings) => {
        if (settings) {
          localStorage.setItem('cutasks_theme', settings.theme);
          localStorage.setItem('cutasks_delete_mode', settings.deleteMode);
          localStorage.setItem('cutasks_week_start', settings.weekStart);
          document.documentElement.setAttribute('data-theme', settings.theme);
        }
        const cleaned = cleanupExpired(data.tasks, data.projectTasks);
        setTasks(cleaned.tasks);
        setProjects(data.projects);
        setSections(data.sections);
        setProjectTasks(cleaned.projectTasks);
        setHabits(data.habits);
        fsLoadedRef.current = true;
      }).catch(() => {
        const cleaned = cleanupExpired(data.tasks, data.projectTasks);
        setTasks(cleaned.tasks);
        setProjects(data.projects);
        setSections(data.sections);
        setProjectTasks(cleaned.projectTasks);
        setHabits(data.habits);
        fsLoadedRef.current = true;
      });
    }).catch(() => {
      fsLoadedRef.current = true;
    });
  }, [user]);

  const pushHistory = useCallback(() => {
    historyRef.current.push([...tasksRef.current]);
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setTasks(prev);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  useEffect(() => {
    localSaveTasks(tasks);
    if (user && fsLoadedRef.current) fsSaveTasks(user.uid, tasks).catch(() => {});
  }, [tasks, user]);

  useEffect(() => {
    localSaveProjects(projects);
    if (user && fsLoadedRef.current) fsSaveProjects(user.uid, projects).catch(() => {});
  }, [projects, user]);

  useEffect(() => {
    localSaveProjectTasks(projectTasks);
    if (user && fsLoadedRef.current) fsSaveProjectTasks(user.uid, projectTasks).catch(() => {});
  }, [projectTasks, user]);

  useEffect(() => {
    localSaveSections(sections);
    if (user && fsLoadedRef.current) fsSaveSections(user.uid, sections).catch(() => {});
  }, [sections, user]);

  useEffect(() => {
    localSaveHabits(habits);
    if (user && fsLoadedRef.current) fsSaveHabits(user.uid, habits).catch(() => {});
  }, [habits, user]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter === 'active') result = result.filter((t) => !t.completed);
    if (filter === 'completed') result = result.filter((t) => t.completed);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
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

  const stats = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => !t.completed && getDeadlineStatus(t.deadline, t.completed) === 'overdue').length,
  }), [tasks]);

  const projectStats = useMemo(() => [
    { label: 'total', value: projects.length },
    { label: 'active', value: projects.filter((p) => p.status === 'active').length, color: '#66bb6a' },
    { label: 'paused', value: projects.filter((p) => p.status === 'paused').length, color: '#ffb74d' },
    { label: 'done', value: projects.filter((p) => p.status === 'completed').length, color: '#64b5f6' },
  ], [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, projectSearch]);

  const taskStatsFormatted = useMemo(() => [
    { label: 'total', value: stats.total },
    { label: 'active', value: stats.active, color: '#ed9b6d' },
    { label: 'done', value: stats.completed, color: '#66bb6a' },
    ...(stats.overdue > 0 ? [{ label: 'overdue', value: stats.overdue, color: '#ef5350' }] : []),
  ], [stats]);

  const allTags = useMemo(() => getAllTags(tasks), [tasks]);

  const activeViewingTask = useMemo(
    () => (viewingTask ? tasks.find((t) => t.id === viewingTask.id) ?? null : null),
    [tasks, viewingTask]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  function openCreateForm() {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setTags([]);
    setParentId(null);
    setFormClosing(false);
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline || '');
    setTags(task.tags || []);
    setParentId(task.parentId ?? null);
    setFormClosing(false);
    setShowForm(true);
  }

  function closeForm() {
    setFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowForm(false);
      setFormClosing(false);
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
      setTags([]);
      setParentId(null);
    }, 200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const now = Date.now();

    if (editingTask) {
      pushHistory();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: trimmedTitle, description: description.trim(), priority, deadline, tags, parentId, updatedAt: now }
            : t
        )
      );
    } else {
      pushHistory();
      const newTask: Task = {
        id: generateId(),
        title: trimmedTitle,
        description: description.trim(),
        priority,
        deadline,
        tags,
        completed: false,
        completedAt: null,
        parentId,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    closeForm();
  }

  function closeDetail() {
    setDetailClosing(true);
    detailTimer.current = setTimeout(() => {
      setViewingTask(null);
      setDetailClosing(false);
    }, 200);
  }

  function toggleComplete(id: string) {
    pushHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null, updatedAt: Date.now() } : t
      )
    );

    if (mode === 'instant') {
      setTimeout(() => {
        setTasks((prev) => {
          const task = prev.find((t) => t.id === id);
          if (!task || !task.completed) return prev;
          return prev
            .filter((t) => t.id !== id)
            .map((t) => t.parentId === id ? { ...t, parentId: null } : t);
        });
      }, 800);
    }
  }

  function deleteTask(id: string) {
    pushHistory();
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      return updated.map((t) =>
        t.parentId === id ? { ...t, parentId: null } : t
      );
    });
  }

  function setSubtaskOf(childId: string, newParentId: string | null) {
    if (childId === newParentId) return;
    pushHistory();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === childId ? { ...t, parentId: newParentId, updatedAt: Date.now() } : t
      )
    );
  }

  function openCreateProject() {
    setEditingProject(null);
    setProjectName('');
    setProjectDesc('');
    setProjectIcon('Folder');
    setProjectColor('#ed9b6d');
    setProjectStatus('active');
    setProjectFormClosing(false);
    setShowProjectForm(true);
  }

  function openEditProject(project: Project) {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDesc(project.description);
    setProjectIcon(project.icon);
    setProjectColor(project.color);
    setProjectStatus(project.status);
    setProjectFormClosing(false);
    setShowProjectForm(true);
  }

  function closeProjectForm() {
    setProjectFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowProjectForm(false);
      setProjectFormClosing(false);
      setEditingProject(null);
    }, 200);
  }

  function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName) return;
    const now = Date.now();
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: trimmedName, description: projectDesc.trim(), icon: projectIcon, color: projectColor, status: projectStatus, updatedAt: now }
            : p
        )
      );
    } else {
      const newProject: Project = {
        id: generateId(),
        name: trimmedName,
        description: projectDesc.trim(),
        icon: projectIcon,
        color: projectColor,
        status: projectStatus,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [newProject, ...prev]);
    }
    closeProjectForm();
  }

  function deleteProject(id: string) {
    pushHistory();
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectTasks((prev) => prev.filter((t) => t.projectId !== id));
    setSections((prev) => prev.filter((s) => s.projectId !== id));
    if (activeProject?.id === id) navigate('/projects');
  }

  function openProject(project: Project) {
    navigate(`/projects/${project.id}`);
  }

  const activeProjectTasks = useMemo(
    () => activeProject ? projectTasks.filter((t) => t.projectId === activeProject.id) : [],
    [projectTasks, activeProject]
  );

  const filteredProjectTasks = useMemo(() => {
    let result = activeProjectTasks;
    if (projectTaskFilter === 'active') result = result.filter((t) => !t.completed);
    if (projectTaskFilter === 'completed') result = result.filter((t) => t.completed);
    if (projectTaskSearch.trim()) {
      const q = projectTaskSearch.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [activeProjectTasks, projectTaskFilter, projectTaskSearch]);

  const projectTaskStats = useMemo(() => {
    if (!activeProject) return [];
    const total = activeProjectTasks.length;
    const active = activeProjectTasks.filter((t) => !t.completed).length;
    const done = activeProjectTasks.filter((t) => t.completed).length;
    const overdue = activeProjectTasks.filter((t) => !t.completed && getDeadlineStatus(t.deadline, t.completed) === 'overdue').length;
    return [
      { label: 'total', value: total },
      { label: 'active', value: active, color: activeProject.color },
      { label: 'done', value: done, color: '#66bb6a' },
      ...(overdue > 0 ? [{ label: 'overdue', value: overdue, color: '#ef5350' }] : []),
    ];
  }, [activeProjectTasks, activeProject]);

  const allProjectTags = useMemo(() => getAllTags(projectTasks), [projectTasks]);

  const activeViewingProjectTask = useMemo(
    () => (viewingProjectTask ? projectTasks.find((t) => t.id === viewingProjectTask.id) ?? null : null),
    [projectTasks, viewingProjectTask]
  );

  const projectTaskHistoryRef = useRef<ProjectTask[][]>([]);

  const pushProjectTaskHistory = useCallback(() => {
    projectTaskHistoryRef.current.push([...projectTasks]);
    if (projectTaskHistoryRef.current.length > 50) projectTaskHistoryRef.current.shift();
  }, [projectTasks]);

  function openCreateProjectTask(sectionId: string | null) {
    setEditingProjectTask(null);
    setPtTitle('');
    setPtDescription('');
    setPtPriority('medium');
    setPtDeadline('');
    setPtTags([]);
    setPtParentId(null);
    setPtSectionId(sectionId);
    setProjectTaskFormClosing(false);
    setShowProjectTaskForm(true);
  }

  function openEditProjectTask(task: ProjectTask) {
    setEditingProjectTask(task);
    setPtTitle(task.title);
    setPtDescription(task.description);
    setPtPriority(task.priority);
    setPtDeadline(task.deadline || '');
    setPtTags(task.tags || []);
    setPtParentId(task.parentId ?? null);
    setPtSectionId(task.sectionId ?? null);
    setProjectTaskFormClosing(false);
    setShowProjectTaskForm(true);
  }

  function closeProjectTaskForm() {
    setProjectTaskFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowProjectTaskForm(false);
      setProjectTaskFormClosing(false);
      setEditingProjectTask(null);
    }, 200);
  }

  function handleProjectTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = ptTitle.trim();
    if (!trimmedTitle || !activeProject) return;
    const now = Date.now();
    if (editingProjectTask) {
      pushProjectTaskHistory();
      setProjectTasks((prev) =>
        prev.map((t) =>
          t.id === editingProjectTask.id
            ? { ...t, title: trimmedTitle, description: ptDescription.trim(), priority: ptPriority, deadline: ptDeadline, tags: ptTags, parentId: ptParentId, sectionId: ptSectionId, updatedAt: now }
            : t
        )
      );
    } else {
      pushProjectTaskHistory();
      const newTask: ProjectTask = {
        id: generateId(),
        projectId: activeProject.id,
        title: trimmedTitle,
        description: ptDescription.trim(),
        priority: ptPriority,
        deadline: ptDeadline,
        tags: ptTags,
        completed: false,
        completedAt: null,
        parentId: ptParentId,
        sectionId: ptSectionId,
        createdAt: now,
        updatedAt: now,
      };
      setProjectTasks((prev) => [newTask, ...prev]);
    }
    closeProjectTaskForm();
  }

  function toggleProjectTask(id: string) {
    pushProjectTaskHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';

    setProjectTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null, updatedAt: Date.now() } : t)
    );

    if (mode === 'instant') {
      setTimeout(() => {
        setProjectTasks((prev) => {
          const task = prev.find((t) => t.id === id);
          if (!task || !task.completed) return prev;
          return prev
            .filter((t) => t.id !== id)
            .map((t) => t.parentId === id ? { ...t, parentId: null } : t);
        });
      }, 800);
    }
  }

  function deleteProjectTask(id: string) {
    pushProjectTaskHistory();
    setProjectTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      return updated.map((t) => t.parentId === id ? { ...t, parentId: null } : t);
    });
  }

  function closeProjectTaskDetail() {
    setProjectTaskDetailClosing(true);
    detailTimer2.current = setTimeout(() => {
      setViewingProjectTask(null);
      setProjectTaskDetailClosing(false);
    }, 200);
  }

  function updateProjectTask(id: string, changes: Partial<ProjectTask>) {
    pushProjectTaskHistory();
    setProjectTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t)
    );
  }

  useEffect(() => {
    function handleSaveSections(e: Event) {
      setSections((e as CustomEvent).detail);
    }
    function handleWeekStartChange(e: Event) {
      setWeekStart((e as CustomEvent).detail);
    }
    window.addEventListener('save-sections', handleSaveSections);
    window.addEventListener('week-start-changed', handleWeekStartChange);
    return () => {
      window.removeEventListener('save-sections', handleSaveSections);
      window.removeEventListener('week-start-changed', handleWeekStartChange);
    };
  }, []);

  useEffect(() => () => { if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current); }, []);

  const pomoSwitchMode = useCallback((newMode: PomoMode) => {
    if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    setPomoRunning(false);
    setPomoMode(newMode);
    setPomoSeconds(pomoConfig[newMode] * 60);
  }, [pomoConfig]);

  useEffect(() => {
    function onPomoConfigChange(e: Event) {
      setPomoConfig((e as CustomEvent).detail);
    }
    window.addEventListener('pomo-config-changed', onPomoConfigChange);
    return () => window.removeEventListener('pomo-config-changed', onPomoConfigChange);
  }, []);

  const pomoSkipSession = useCallback(() => {
    if (pomoMode === 'work') {
      const next = (pomoSessions + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
      setPomoSessions((s: number) => s + 1);
      pomoSwitchMode(next);
    } else {
      pomoSwitchMode('work');
    }
  }, [pomoMode, pomoSessions, pomoSwitchMode]);

  useEffect(() => {
    if (!pomoRunning) {
      if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
      return;
    }
    pomoIntervalRef.current = setInterval(() => {
      setPomoSeconds((prev: number) => {
        if (prev <= 1) {
          clearInterval(pomoIntervalRef.current!);
          pomoIntervalRef.current = null;
          setPomoRunning(false);
          setPomoCelebrate(true);
          setTimeout(() => setPomoCelebrate(false), 2000);

          if (pomoMode === 'work') {
            setPomoSessions((s: number) => s + 1);
            const next = (pomoSessions + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
            setTimeout(() => pomoSwitchMode(next), 600);
          } else {
            setTimeout(() => pomoSwitchMode('work'), 600);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current); };
  }, [pomoRunning, pomoMode, pomoSessions, pomoSwitchMode]);

  useEffect(() => {
    if (pomoRunning) {
      const m = Math.floor(pomoSeconds / 60);
      const s = pomoSeconds % 60;
      const label = pomoMode === 'work' ? 'Focus' : pomoMode === 'short' ? 'Short Break' : 'Long Break';
      document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — ${label} | CuTasks`;
    } else if (location.pathname !== '/pomodoro') {
      document.title = 'CuTasks';
    }
  }, [pomoRunning, pomoSeconds, pomoMode, location.pathname]);

  function pomoToggleRunning() { setPomoRunning((r) => !r); }
  function pomoReset() {
    if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    setPomoRunning(false);
    setPomoSeconds(pomoConfig[pomoMode] * 60);
  }

  const handleCreate = location.pathname.startsWith('/habits')
    ? () => habitFormOpenerRef.current?.()
    : activePage === 'project-detail' ? () => openCreateProjectTask(null) : activePage === 'projects' ? openCreateProject : openCreateForm;

  const sidebarNavigate = useCallback((p: Page) => {
    if (p === 'home') navigate('/home');
    else if (p === 'tasks') navigate('/tasks');
    else if (p === 'projects') navigate('/projects');
    else if (p === 'settings') navigate('/settings');
  }, [navigate]);

  if (location.pathname === '/auth') {
    return <AuthPage />;
  }

  return (
    <div className="app" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <Sidebar width={sidebarWidth} onResize={setSidebarWidth} activePage={activePage} onNavigate={sidebarNavigate} />
      <div className="app-content">
        <AnimatedRoutes
          routes={
            <Routes>
              <Route path="/home" element={
                <ProtectedRoute>
                  <main className="main">
                    <HomePage />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/habits" element={
                <ProtectedRoute>
                  <main className="main">
                    <HabitsPage habits={habits} onHabitsChange={setHabits} weekStartDay={weekStart} formOpenerRef={habitFormOpenerRef} />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/pomodoro" element={
                <ProtectedRoute>
                  <main className="main">
                    <PomodoroPage
                      mode={pomoMode}
                      secondsLeft={pomoSeconds}
                      running={pomoRunning}
                      completedSessions={pomoSessions}
                      config={pomoConfig}
                      celebrate={pomoCelebrate}
                      onToggleRunning={pomoToggleRunning}
                      onReset={pomoReset}
                      onSwitchMode={pomoSwitchMode}
                      onSkipSession={pomoSkipSession}
                    />
                  </main>
                </ProtectedRoute>
              } />
          <Route path="/tasks" element={
            <ProtectedRoute>
            <TasksPage
              stats={taskStatsFormatted}
              tasks={filteredTasks}
              taskMap={taskMap}
              filter={filter}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              onFilter={setFilter}
              onCreate={openCreateForm}
              onToggle={toggleComplete}
              onView={setViewingTask}
              onEdit={openEditForm}
              onDelete={deleteTask}
              onSetSubtask={setSubtaskOf}
            />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
            <>
              <div className="page-hero">
                <h1 className="page-hero-title">Projects</h1>
              </div>
              <Header stats={projectStats} onCreate={openCreateProject} createLabel="New Project" />
              <div className="toolbar">
                <div className="search-box">
                  <MinimalisticMagnifier size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <main className="main">
                <ProjectsPage
                  projects={filteredProjects}
                  onEdit={openEditProject}
                  onDelete={deleteProject}
                  onOpen={openProject}
                />
              </main>
            </>
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
            <ProjectRoute
              projects={projects}
              fallback={
                <main className="main">
                  <div className="empty">
                    <p className="empty-title">Project not found</p>
                    <button className="btn btn-primary" onClick={() => navigate('/projects')}>Back to Projects</button>
                  </div>
                </main>
              }
            >
              {(project) => (
                <>
                  <div className="project-detail-header">
                    <button className="btn-icon project-back-btn" onClick={() => navigate('/projects')}>
                      <ArrowLeft size={22} />
                    </button>
                    <div className="project-detail-icon" style={{ background: `${project.color}15`, color: project.color }}>
                      {(() => {
                        const Icon = PROJECT_ICONS.find((i) => i.name === project.icon)?.icon ?? PROJECT_ICONS[0].icon;
                        return <Icon size={24} strokeWidth={1.8} />;
                      })()}
                    </div>
                    <div className="project-detail-info">
                      <h1 className="project-detail-name" style={{ color: project.color }}>{project.name}</h1>
                      {project.description && (
                        <p className="project-detail-desc">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <Header stats={projectTaskStats} onCreate={() => openCreateProjectTask(null)} createLabel="New Task" />
                  <div className="toolbar">
                    <div className="search-box">
                      <MinimalisticMagnifier size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={projectTaskSearch}
                        onChange={(e) => setProjectTaskSearch(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <div className="filters">
                      {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                        <button
                          key={f}
                          className={`filter-btn ${projectTaskFilter === f ? 'active' : ''}`}
                          onClick={() => setProjectTaskFilter(f)}
                        >
                          {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <main className="main">
                    <ProjectDetailPage
                      project={project}
                      sections={sections}
                      tasks={filteredProjectTasks}
                      onCreateTask={openCreateProjectTask}
                      onEditTask={openEditProjectTask}
                      onDeleteTask={deleteProjectTask}
                      onToggleTask={toggleProjectTask}
                      onViewTask={setViewingProjectTask}
                      onUpdateTask={updateProjectTask}
                    />
                  </main>
                </>
              )}
            </ProjectRoute>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
            <main className="main">
              <SettingsPage />
            </main>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          }
        />
      </div>

      {(activeViewingTask || detailClosing) && (
        <TaskDetailModal
          task={activeViewingTask!}
          tasks={tasks}
          onClose={closeDetail}
          onEdit={(t) => { closeDetail(); setTimeout(() => openEditForm(t), 220); }}
          onToggle={toggleComplete}
          isClosing={detailClosing}
        />
      )}

      {(activeViewingProjectTask || projectTaskDetailClosing) && (
        <TaskDetailModal
          task={activeViewingProjectTask!}
          tasks={projectTasks}
          onClose={closeProjectTaskDetail}
          onEdit={(t) => { closeProjectTaskDetail(); setTimeout(() => openEditProjectTask(t as ProjectTask), 220); }}
          onToggle={toggleProjectTask}
          isClosing={projectTaskDetailClosing}
        />
      )}

      {(showForm || formClosing) && (
        <TaskFormModal
          editingTask={editingTask}
          title={title}
          description={description}
          priority={priority}
          deadline={deadline}
          tags={tags}
          parentId={parentId}
          allTags={allTags}
          allTasks={tasks}
          onTitleChange={setTitle}
          onDescChange={setDescription}
          onPriorityChange={setPriority}
          onDeadlineChange={setDeadline}
          onTagsChange={setTags}
          onParentChange={setParentId}
          onSubmit={handleSubmit}
          onClose={closeForm}
          isClosing={formClosing}
        />
      )}

      {(showProjectTaskForm || projectTaskFormClosing) && (
        <TaskFormModal
          editingTask={editingProjectTask}
          title={ptTitle}
          description={ptDescription}
          priority={ptPriority}
          deadline={ptDeadline}
          tags={ptTags}
          parentId={ptParentId}
          allTags={allProjectTags}
          allTasks={projectTasks}
          onTitleChange={setPtTitle}
          onDescChange={setPtDescription}
          onPriorityChange={setPtPriority}
          onDeadlineChange={setPtDeadline}
          onTagsChange={setPtTags}
          onParentChange={setPtParentId}
          onSubmit={handleProjectTaskSubmit}
          onClose={closeProjectTaskForm}
          isClosing={projectTaskFormClosing}
        />
      )}

      {(showProjectForm || projectFormClosing) && (
        <ProjectFormModal
          editingProject={editingProject}
          name={projectName}
          description={projectDesc}
          icon={projectIcon}
          color={projectColor}
          status={projectStatus}
          onNameChange={setProjectName}
          onDescChange={setProjectDesc}
          onIconChange={setProjectIcon}
          onColorChange={setProjectColor}
          onStatusChange={setProjectStatus}
          onSubmit={handleProjectSubmit}
          onClose={closeProjectForm}
          isClosing={projectFormClosing}
        />
      )}

      <MobileNav
        activePage={activePage}
        onNavigate={sidebarNavigate}
        onCreate={handleCreate}
        miniTimer={(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/pomodoro' ? (
          <div className={pomoMiniClosing ? 'pomo-mini-exit' : ''}>
            <PomoMiniTimer
              mode={pomoMode}
              secondsLeft={pomoSeconds}
              running={pomoRunning}
              onToggleRunning={pomoToggleRunning}
            />
          </div>
        ) : undefined}
      />

      {(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/pomodoro' && (
        <div className={`pomo-mini-desktop-only${pomoMiniClosing ? ' pomo-mini-exit' : ''}`}>
          <PomoMiniTimer
            mode={pomoMode}
            secondsLeft={pomoSeconds}
            running={pomoRunning}
            onToggleRunning={pomoToggleRunning}
          />
        </div>
      )}
    </div>
  );
}
