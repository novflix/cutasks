import { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import type { Task, Priority, Page, FilterType, Project, ProjectStatus, Section, ProjectTask, Habit } from './types';
import type { PomoMode, PomoConfig } from './pages/PomodoroPage';
import { LONG_BREAK_INTERVAL } from './constants/pomo';
import { generateId, priorityOrder, validateTitle, validateDescription, sanitizeInput, sanitizePriority, MAX_TASKS_COUNT, MAX_PROJECTS_COUNT } from './utils';
import { loadPomoConfig, loadPomoSavedState, savePomoState, loadPomoRunning } from './utils/pomo';
import { loadTasks, saveTasks as localSaveTasks, getAllTags, loadProjects, saveProjects as localSaveProjects, loadSections, saveSections as localSaveSections, loadProjectTasks, saveProjectTasks as localSaveProjectTasks, loadHabits, saveHabits as localSaveHabits } from './storage';
import { useAuth } from './contexts/AuthContext';
import { saveTasks as fsSaveTasks, saveProjects as fsSaveProjects, saveSections as fsSaveSections, saveProjectTasks as fsSaveProjectTasks, saveHabits as fsSaveHabits, loadAllData, loadSettings } from './services/firestore';
import { isNotificationsEnabled, sendNotification, getLocalizedMessage } from './services/notifications';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskDetailModal from './components/TaskDetailModal';
import TaskFormModal from './components/TaskFormModal';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectRoute from './components/ProjectRoute';
import PomoMiniTimer from './components/PomoMiniTimer';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import ConfirmDialog from './components/ConfirmDialog';
import Skeleton from './components/Skeleton';
import { getDeadlineStatus } from './utils';
import { MinimalisticMagnifier, ArrowLeft } from '@solar-icons/react';
import { PROJECT_ICONS } from './constants';

const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

function AnimatedRoutes({ routes }: { routes: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Suspense fallback={<div className="page-loader"><div className="auth-spinner" /></div>}>
        {routes}
      </Suspense>
    </div>
  );
}

function PageLoader() {
  return <div className="page-loader"><div className="auth-spinner" /></div>;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();

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
  const syncReadyRef = useRef(false);
  const justLoadedFromFsRef = useRef(false);
  const [dataLoading, setDataLoading] = useState(() => {
    return !localStorage.getItem('cutasks_tasks') && !localStorage.getItem('cutasks_projects');
  });
  const habitFormOpenerRef = useRef<(() => void) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'task' | 'project'; id: string; title: string } | null>(null);

  const [pomoConfig, setPomoConfig] = useState<PomoConfig>(loadPomoConfig);
  const savedPomo = loadPomoSavedState();
  const [pomoMode, setPomoMode] = useState<PomoMode>(savedPomo?.mode ?? 'work');
  const [pomoSeconds, setPomoSeconds] = useState(savedPomo?.secondsLeft ?? pomoConfig.work * 60);
  const [pomoRunning, setPomoRunning] = useState(loadPomoRunning);
  const [pomoSessions, setPomoSessions] = useState(savedPomo?.completedSessions ?? 0);
  const pomoSessionsRef = useRef(pomoSessions);
  useEffect(() => { pomoSessionsRef.current = pomoSessions; });
  const pomoModeRef = useRef(pomoMode);
  useEffect(() => { pomoModeRef.current = pomoMode; });
  const [pomoCelebrate, setPomoCelebrate] = useState(false);
  const [pomoMiniVisible, setPomoMiniVisible] = useState(false);
  const [pomoMiniClosing, setPomoMiniClosing] = useState(false);
  const pomoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomoMiniTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    savePomoState(pomoMode, pomoSeconds, pomoSessions, pomoRunning);
  }, [pomoMode, pomoSeconds, pomoSessions, pomoRunning]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (pomoRunning) {
      if (pomoMiniTimer.current) clearTimeout(pomoMiniTimer.current);
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
  }, [pomoRunning, pomoMiniVisible]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activePage: Page = location.pathname.startsWith('/app/projects/') ? 'project-detail' : location.pathname.startsWith('/app/projects') ? 'projects' : location.pathname.startsWith('/app/settings') ? 'settings' : location.pathname.startsWith('/app/habits') || location.pathname.startsWith('/app/pomodoro') || location.pathname.startsWith('/app/calendar') || location.pathname.startsWith('/app/home') ? 'home' : 'tasks';
  const activeProjectId = activePage === 'project-detail' ? location.pathname.split('/')[3] : null;
  const activeProject = useMemo(() => activeProjectId ? projects.find((p) => p.id === activeProjectId) ?? null : null, [projects, activeProjectId]);

  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  const historyRef = useRef<{ tasks: Task[]; projects: Project[]; sections: Section[]; projectTasks: ProjectTask[]; habits: Habit[] }[]>([]);
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
      const cleaned = cleanupExpired(data.tasks, data.projectTasks);
      justLoadedFromFsRef.current = true;
      setTasks(cleaned.tasks);
      setProjects(data.projects);
      setSections(data.sections);
      setProjectTasks(cleaned.projectTasks);
      setHabits(data.habits);

      syncReadyRef.current = true;
      setDataLoading(false);
      setTimeout(() => { justLoadedFromFsRef.current = false; }, 100);
    }).catch(() => {

      syncReadyRef.current = true;
      setDataLoading(false);
    });

    loadSettings(user.uid).then((settings) => {
      if (settings) {
        localStorage.setItem('cutasks_theme', settings.theme);
        localStorage.setItem('cutasks_delete_mode', settings.deleteMode);
        localStorage.setItem('cutasks_week_start', settings.weekStart);
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
    }).catch(() => {});
  }, [user]);

  function dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const projectTasksRef = useRef(projectTasks);
  useEffect(() => { projectTasksRef.current = projectTasks; }, [projectTasks]);
  const habitsRef = useRef(habits);
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  useEffect(() => {
    if (!user || !syncReadyRef.current) return;

    function checkNotifications() {
      if (!isNotificationsEnabled()) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrowStart);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const allTasks = [...tasksRef.current, ...projectTasksRef.current];
      const lang = i18n.language;
      const hour = now.getHours();

      const overdueTasks = allTasks.filter((t) =>
        !t.completed && t.deadline && new Date(t.deadline) < todayStart
      );
      if (overdueTasks.length > 0) {
        const task = overdueTasks[0];
        const title = t('notifications.overdue.title');
        const body = getLocalizedMessage('overdue', lang, { title: task.title });
        sendNotification({ title, body, type: 'overdue', tag: 'overdue-check' });
      }

      const tomorrowTasks = allTasks.filter((t) =>
        !t.completed && t.deadline &&
        new Date(t.deadline) >= tomorrowStart &&
        new Date(t.deadline) < dayAfterTomorrow
      );
      if (tomorrowTasks.length > 0) {
        const task = tomorrowTasks[0];
        const title = t('notifications.deadlineTomorrow.title');
        const body = getLocalizedMessage('deadlineTomorrow', lang, { title: task.title });
        sendNotification({ title, body, type: 'deadlineTomorrow', tag: 'deadline-tomorrow-check' });
      }

      if (hour >= 7 && hour <= 9) {
        const activeTasks = allTasks.filter((t) => !t.completed);
        if (activeTasks.length > 0) {
          const title = t('notifications.morningGreeting.title');
          const body = getLocalizedMessage('morningGreeting', lang, { count: activeTasks.length });
          sendNotification({ title, body, type: 'morningGreeting', tag: 'morning-greeting' });
        }
      }

      if (hour >= 19 && hour <= 21) {
        const completedToday = allTasks.filter((t) =>
          t.completed && t.completedAt && t.completedAt >= todayStart.getTime()
        ).length;
        const totalToday = allTasks.filter((t) =>
          t.createdAt >= todayStart.getTime() || !t.completed
        ).length;
        if (totalToday > 0) {
          const title = t('notifications.eveningSummary.title');
          const body = getLocalizedMessage('eveningSummary', lang, { done: completedToday, total: totalToday });
          sendNotification({ title, body, type: 'eveningSummary', tag: 'evening-summary' });
        }
      }

      const todayHabits = habitsRef.current.filter((h) => h.weekdays.includes(now.getDay()));
      const uncompletedHabits = todayHabits.filter((h) => !h.completions[dateKey(now)]);
      if (uncompletedHabits.length > 0 && hour >= 18) {
        const habit = uncompletedHabits[0];
        const title = t('notifications.streakAtRisk.title');
        const body = getLocalizedMessage('streakAtRisk', lang, { habit: habit.name, streak: habit.streak });
        sendNotification({ title, body, type: 'streakAtRisk', tag: `streak-risk-${habit.id}` });
      }
    }

    const timer = setTimeout(checkNotifications, 3000);
    const interval = setInterval(checkNotifications, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user]);

  const pushHistory = useCallback(() => {
    historyRef.current.push({
      tasks: [...tasksRef.current],
      projects: [...projects],
      sections: [...sections],
      projectTasks: [...projectTasks],
      habits: [...habits],
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, [projects, sections, projectTasks, habits]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setTasks(prev.tasks);
    setProjects(prev.projects);
    setSections(prev.sections);
    setProjectTasks(prev.projectTasks);
    setHabits(prev.habits);
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

  /* ── Easter egg: console greeting ── */
  useEffect(() => {
    console.log(
      '%c🚀 CuTasks %cv1.0.2',
      'color: #ed9b6d; font-size: 16px; font-weight: bold;',
      'color: #777; font-size: 12px;'
    );
    console.log(
      '%cHey there, curious dev! 👋',
      'color: #999; font-size: 11px; font-style: italic;'
    );
  }, []);

  /* ── Easter egg: shake for motivational quote ── */
  useEffect(() => {
    const QUOTES = t('shakeQuotes', { returnObjects: true }) as string[];
    let lastShake = 0;
    let shakeCount = 0;
    let lastAccel = { x: 0, y: 0, z: 0 };
    const SHAKE_THRESHOLD = 15;

    function handleMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const dx = Math.abs(acc.x - lastAccel.x);
      const dy = Math.abs(acc.y - lastAccel.y);
      const dz = Math.abs(acc.z - lastAccel.z);
      lastAccel = { x: acc.x, y: acc.y, z: acc.z };

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShake > 300) {
          shakeCount++;
          lastShake = now;
          if (shakeCount >= 2) {
            shakeCount = 0;
            showShakeQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
          }
        }
      }
    }

    function showShakeQuote(text: string) {
      const existing = document.querySelector('.lp-shake-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'lp-shake-toast';
      toast.textContent = text;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    }

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  useEffect(() => {
    localSaveTasks(tasks);
    if (user && syncReadyRef.current && !justLoadedFromFsRef.current) {
      const timer = setTimeout(() => fsSaveTasks(user.uid, tasks).catch(() => {}), 500);
      return () => clearTimeout(timer);
    }
  }, [tasks, user]);

  useEffect(() => {
    localSaveProjects(projects);
    if (user && syncReadyRef.current && !justLoadedFromFsRef.current) {
      const timer = setTimeout(() => fsSaveProjects(user.uid, projects).catch(() => {}), 500);
      return () => clearTimeout(timer);
    }
  }, [projects, user]);

  useEffect(() => {
    localSaveProjectTasks(projectTasks);
    if (user && syncReadyRef.current && !justLoadedFromFsRef.current) {
      const timer = setTimeout(() => fsSaveProjectTasks(user.uid, projectTasks).catch(() => {}), 500);
      return () => clearTimeout(timer);
    }
  }, [projectTasks, user]);

  useEffect(() => {
    localSaveSections(sections);
    if (user && syncReadyRef.current && !justLoadedFromFsRef.current) {
      const timer = setTimeout(() => fsSaveSections(user.uid, sections).catch(() => {}), 500);
      return () => clearTimeout(timer);
    }
  }, [sections, user]);

  useEffect(() => {
    localSaveHabits(habits);
    if (user && syncReadyRef.current && !justLoadedFromFsRef.current) {
      const timer = setTimeout(() => fsSaveHabits(user.uid, habits).catch(() => {}), 500);
      return () => clearTimeout(timer);
    }
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
    { label: t('common.total'), value: projects.length },
    { label: t('common.active'), value: projects.filter((p) => p.status === 'active').length, color: '#66bb6a' },
    { label: t('common.paused'), value: projects.filter((p) => p.status === 'paused').length, color: '#ffb74d' },
    { label: t('common.done'), value: projects.filter((p) => p.status === 'completed').length, color: '#64b5f6' },
  ], [projects, t]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const projectIdsWithMatchingTasks = new Set(
        projectTasks
          .filter((t) => t.title.toLowerCase().includes(q))
          .map((t) => t.projectId)
      );
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          projectIdsWithMatchingTasks.has(p.id)
      );
    }
    return result;
  }, [projects, projectSearch, projectTasks]);

  const taskStatsFormatted = useMemo(() => [
    { label: t('common.total'), value: stats.total },
    { label: t('common.active'), value: stats.active, color: '#ed9b6d' },
    { label: t('common.done'), value: stats.completed, color: '#66bb6a' },
    ...(stats.overdue > 0 ? [{ label: t('common.overdue'), value: stats.overdue, color: '#ef5350' }] : []),
  ], [stats, t]);

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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    const titleError = validateTitle(title);
    if (titleError) return;
    const descError = validateDescription(description);
    if (descError) return;

    const trimmedTitle = sanitizeInput(title);
    const trimmedDesc = sanitizeInput(description);
    const safePriority = sanitizePriority(priority);

    if (!editingTask && tasks.length >= MAX_TASKS_COUNT) return;

    const now = Date.now();

    if (editingTask) {
      pushHistory();
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: trimmedTitle, description: trimmedDesc, priority: safePriority, deadline, tags, parentId, updatedAt: now }
            : t
        )
      );
    } else {
      pushHistory();
      const newTask: Task = {
        id: generateId(),
        title: trimmedTitle,
        description: trimmedDesc,
        priority: safePriority,
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
    if (detailTimer.current) clearTimeout(detailTimer.current);
    setDetailClosing(true);
    detailTimer.current = setTimeout(() => {
      setViewingTask(null);
      setDetailClosing(false);
    }, 200);
  }

  function toggleComplete(id: string) {
    pushHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';
    const now = Date.now();

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null, updatedAt: now } : t
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
    const task = tasks.find((t) => t.id === id);
    setConfirmDelete({ type: 'task', id, title: task?.title || '' });
  }

  function confirmDeleteTask(id: string) {
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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
    setProjectFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowProjectForm(false);
      setProjectFormClosing(false);
      setEditingProject(null);
    }, 200);
  }

  function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nameError = validateTitle(projectName);
    if (nameError) return;
    const descError = validateDescription(projectDesc);
    if (descError) return;

    const trimmedName = sanitizeInput(projectName);
    const trimmedDesc = sanitizeInput(projectDesc);

    if (!editingProject && projects.length >= MAX_PROJECTS_COUNT) return;

    const now = Date.now();
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: trimmedName, description: trimmedDesc, icon: projectIcon, color: projectColor, status: projectStatus, updatedAt: now }
            : p
        )
      );
    } else {
      const newProject: Project = {
        id: generateId(),
        name: trimmedName,
        description: trimmedDesc,
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
    const project = projects.find((p) => p.id === id);
    setConfirmDelete({ type: 'project', id, title: project?.name || '' });
  }

  function confirmDeleteProject(id: string) {
    pushHistory();
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectTasks((prev) => prev.filter((t) => t.projectId !== id));
    setSections((prev) => prev.filter((s) => s.projectId !== id));
    if (activeProject?.id === id) navigate('/app/projects');
  }

  function openProject(project: Project) {
    navigate(`/app/projects/${project.id}`);
  }

  function reorderProjects(fromIndex: number, toIndex: number) {
    setProjects((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
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
      { label: t('common.total'), value: total },
      { label: t('common.active'), value: active, color: activeProject.color },
      { label: t('common.done'), value: done, color: '#66bb6a' },
      ...(overdue > 0 ? [{ label: t('common.overdue'), value: overdue, color: '#ef5350' }] : []),
    ];
  }, [activeProjectTasks, activeProject, t]);

  const allProjectTags = useMemo(() => getAllTags(projectTasks), [projectTasks]);

  const activeViewingProjectTask = useMemo(
    () => (viewingProjectTask ? projectTasks.find((t) => t.id === viewingProjectTask.id) ?? null : null),
    [projectTasks, viewingProjectTask]
  );



  function openCreateProjectTask(sectionId: string | null) {
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
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
    if (formTimer.current) clearTimeout(formTimer.current);
    setProjectTaskFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowProjectTaskForm(false);
      setProjectTaskFormClosing(false);
      setEditingProjectTask(null);
    }, 200);
  }

  function handleProjectTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    const titleError = validateTitle(ptTitle);
    if (titleError || !activeProject) return;
    const descError = validateDescription(ptDescription);
    if (descError) return;

    const trimmedTitle = sanitizeInput(ptTitle);
    const trimmedDesc = sanitizeInput(ptDescription);
    const safePriority = sanitizePriority(ptPriority);

    const now = Date.now();
    if (editingProjectTask) {
      pushHistory();
      setProjectTasks((prev) =>
        prev.map((t) =>
          t.id === editingProjectTask.id
            ? { ...t, title: trimmedTitle, description: trimmedDesc, priority: safePriority, deadline: ptDeadline, tags: ptTags, parentId: ptParentId, sectionId: ptSectionId, updatedAt: now }
            : t
        )
      );
    } else {
      pushHistory();
      const newTask: ProjectTask = {
        id: generateId(),
        projectId: activeProject.id,
        title: trimmedTitle,
        description: trimmedDesc,
        priority: safePriority,
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
    pushHistory();
    const mode = (localStorage.getItem('cutasks_delete_mode') || 'instant') as 'instant' | '3days' | '7days';
    const now = Date.now();

    setProjectTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now : null, updatedAt: now } : t)
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
    const task = projectTasks.find((t) => t.id === id);
    setConfirmDelete({ type: 'task', id, title: task?.title || '' });
  }

  function confirmDeleteProjectTask(id: string) {
    pushHistory();
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
    pushHistory();
    setProjectTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t)
    );
  }

  useEffect(() => {
    function handleSaveSections(e: Event) {
      pushHistory();
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
      const next = (pomoSessionsRef.current + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
      setPomoSessions((s: number) => s + 1);
      pomoSwitchMode(next);
    } else {
      pomoSwitchMode('work');
    }
  }, [pomoMode, pomoSwitchMode]);

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

          if (pomoModeRef.current === 'work') {
            const newSessions = pomoSessionsRef.current + 1;
            setPomoSessions(newSessions);
            const next = newSessions % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
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
  }, [pomoRunning, pomoSwitchMode]);

  useEffect(() => {
    if (pomoRunning) {
      const m = Math.floor(pomoSeconds / 60);
      const s = pomoSeconds % 60;
      const label = pomoMode === 'work' ? t('pomodoro.focus') : pomoMode === 'short' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak');
      document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — ${label} | CuTasks`;
    } else if (location.pathname !== '/app/pomodoro') {
      document.title = 'CuTasks';
    }
  }, [pomoRunning, pomoSeconds, pomoMode, location.pathname]);

  function pomoToggleRunning() { setPomoRunning((r) => !r); }
  function pomoReset() {
    if (pomoIntervalRef.current) clearInterval(pomoIntervalRef.current);
    setPomoRunning(false);
    setPomoSeconds(pomoConfig[pomoMode] * 60);
  }

  const handleCreate = location.pathname.startsWith('/app/habits')
    ? () => habitFormOpenerRef.current?.()
    : activePage === 'project-detail' ? () => openCreateProjectTask(null) : activePage === 'projects' ? openCreateProject : openCreateForm;

  const sidebarNavigate = useCallback((p: Page) => {
    if (p === 'home') navigate('/app/home');
    else if (p === 'tasks') navigate('/app/tasks');
    else if (p === 'projects') navigate('/app/projects');
    else if (p === 'settings') navigate('/app/settings');
  }, [navigate]);

  if (location.pathname === '/auth') {
    return <Suspense fallback={<PageLoader />}><AuthPage /></Suspense>;
  }

  if (location.pathname === '/' || location.pathname === '/landing' || location.pathname === '/terms' || location.pathname === '/privacy') {
    if (authLoading) return <PageLoader />;
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/app/home" replace /> : <LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <Sidebar width={sidebarWidth} onResize={setSidebarWidth} activePage={activePage} onNavigate={sidebarNavigate} />
      <div className="app-content">
        {dataLoading ? (
          <main className="main">
            <div className="page-hero">
              <div className="skeleton-line skeleton-line-medium" style={{ width: 120, height: 24 }} />
            </div>
            <Skeleton type="stat" lines={4} />
            <div style={{ marginTop: 20 }}>
              <Skeleton type="task" lines={5} />
            </div>
          </main>
        ) : (
        <AnimatedRoutes
          routes={
            <Routes>
              <Route path="/app/home" element={
                <ProtectedRoute>
                  <main className="main">
                    <HomePage
                      tasks={tasks}
                      projects={projects}
                      habits={habits}
                      projectTasks={projectTasks}
                    />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/app/habits" element={
                <ProtectedRoute>
                  <main className="main">
                    <HabitsPage habits={habits} onHabitsChange={(updater) => { pushHistory(); setHabits(updater); }} weekStartDay={weekStart} formOpenerRef={habitFormOpenerRef} />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/app/pomodoro" element={
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
              <Route path="/app/calendar" element={
                <ProtectedRoute>
                  <main className="main">
                    <CalendarPage tasks={tasks} projectTasks={projectTasks} onViewTask={(t) => {
                      if ('projectId' in t) setViewingProjectTask(t as ProjectTask);
                      else setViewingTask(t);
                    }} />
                  </main>
                </ProtectedRoute>
              } />
          <Route path="/app/tasks" element={
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
          <Route path="/app/projects" element={
            <ProtectedRoute>
            <>
              <div className="page-hero">
                <h1 className="page-hero-title">{t('projects.title')}</h1>
              </div>
              <Header stats={projectStats} onCreate={openCreateProject} createLabel={t('projects.newProject')} />
              <div className="toolbar">
                <div className="search-box">
                  <MinimalisticMagnifier size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder={t('projects.searchProjects')}
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <main className="main">
                <ProjectsPage
                  projects={filteredProjects}
                  projectTasks={projectTasks}
                  searchQuery={projectSearch}
                  onEdit={openEditProject}
                  onDelete={deleteProject}
                  onOpen={openProject}
                  onReorder={reorderProjects}
                />
              </main>
            </>
            </ProtectedRoute>
          } />
          <Route path="/app/projects/:projectId" element={
            <ProtectedRoute>
            <ProjectRoute
              projects={projects}
              fallback={
                <main className="main">
                  <div className="empty">
                    <p className="empty-title">{t('projects.projectNotFound')}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/app/projects')}>{t('projects.backToProjects')}</button>
                  </div>
                </main>
              }
            >
              {(project) => (
                <>
                  <div className="project-detail-header">
                    <button className="btn-icon project-back-btn" onClick={() => navigate('/app/projects')}>
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
                  <Header stats={projectTaskStats} onCreate={() => openCreateProjectTask(null)} createLabel={t('tasks.newTask')} />
                  <div className="toolbar">
                    <div className="search-box">
                      <MinimalisticMagnifier size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder={t('tasks.searchTasks')}
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
                          {f === 'all' ? t('common.all') : f === 'active' ? t('common.active') : t('common.done')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <main className="main">
                    <ProjectDetailPage
                      project={project}
                      sections={sections}
                      tasks={filteredProjectTasks}
                      searchQuery={projectTaskSearch}
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
          <Route path="/app/settings" element={
            <ProtectedRoute>
            <main className="main">
              <SettingsPage />
            </main>
            </ProtectedRoute>
          } />
          <Route path="/app/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
            </Routes>
          }
        />
        )}
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

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === 'task' ? t('confirm.deleteTask') : t('confirm.deleteProject')}
          message={confirmDelete.type === 'task' ? t('confirm.deleteTaskMessage', { title: confirmDelete.title }) : t('confirm.deleteProjectMessage', { title: confirmDelete.title })}
          onConfirm={() => {
            if (confirmDelete.type === 'task') {
              if (projectTasks.find((t) => t.id === confirmDelete.id)) {
                confirmDeleteProjectTask(confirmDelete.id);
              } else {
                confirmDeleteTask(confirmDelete.id);
              }
            } else {
              confirmDeleteProject(confirmDelete.id);
            }
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      <MobileNav
        activePage={activePage}
        onNavigate={sidebarNavigate}
        onCreate={handleCreate}
        miniTimer={(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/app/pomodoro' ? (
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

      {(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/app/pomodoro' && (
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
