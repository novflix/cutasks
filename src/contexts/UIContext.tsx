import { createContext, useContext, useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Task, Priority, Page, Project, ProjectStatus, ProjectTask } from '../types';
import { validateTitle, validateDescription, sanitizeInput, sanitizePriority, MAX_TASKS_COUNT, MAX_PROJECTS_COUNT } from '../utils';
import { useTaskContext } from '../hooks/useTaskContext';

interface UIContextValue {
  // Sidebar
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;

  // Task form
  showForm: boolean;
  formClosing: boolean;
  editingTask: Task | null;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  parentId: string | null;
  setParentId: (v: string | null) => void;
  openCreateForm: () => void;
  openEditForm: (task: Task) => void;
  closeForm: () => void;
  handleSubmit: (e: React.FormEvent) => void;

  // Task detail
  viewingTask: Task | null;
  setViewingTask: (task: Task | null) => void;
  detailClosing: boolean;
  closeDetail: () => void;
  handleViewTaskEdit: (task: Task) => void;
  deleteTaskConfirm: (id: string) => void;

  // Project form
  showProjectForm: boolean;
  projectFormClosing: boolean;
  editingProject: Project | null;
  projectName: string;
  setProjectName: (v: string) => void;
  projectDesc: string;
  setProjectDesc: (v: string) => void;
  projectIcon: string;
  setProjectIcon: (v: string) => void;
  projectColor: string;
  setProjectColor: (v: string) => void;
  projectStatus: ProjectStatus;
  setProjectStatus: (v: ProjectStatus) => void;
  openCreateProject: () => void;
  openEditProject: (project: Project) => void;
  closeProjectForm: () => void;
  handleProjectSubmit: (e: React.FormEvent) => void;
  deleteProjectConfirm: (id: string) => void;
  openProject: (project: Project) => void;

  // Project task form
  showProjectTaskForm: boolean;
  projectTaskFormClosing: boolean;
  editingProjectTask: ProjectTask | null;
  ptTitle: string;
  setPtTitle: (v: string) => void;
  ptDescription: string;
  setPtDescription: (v: string) => void;
  ptPriority: Priority;
  setPtPriority: (v: Priority) => void;
  ptDeadline: string;
  setPtDeadline: (v: string) => void;
  ptTags: string[];
  setPtTags: (v: string[]) => void;
  ptParentId: string | null;
  setPtParentId: (v: string | null) => void;
  ptSectionId: string | null;
  openCreateProjectTask: (sectionId: string | null) => void;
  openEditProjectTask: (task: ProjectTask) => void;
  closeProjectTaskForm: () => void;
  handleProjectTaskSubmit: (e: React.FormEvent) => void;

  // Project task detail
  viewingProjectTask: ProjectTask | null;
  setViewingProjectTask: (task: ProjectTask | null) => void;
  projectTaskDetailClosing: boolean;
  closeProjectTaskDetail: () => void;
  handleViewProjectTaskEdit: (task: Task) => void;
  deleteProjectTaskConfirm: (id: string) => void;

  // Search create
  createTaskFromSearch: (title: string) => void;
  createProjectFromSearch: (name: string) => void;
  createProjectTaskFromSearch: (title: string) => void;

  // Navigation & computed
  handleCreate: () => void;
  handleCalendarViewTask: (t: Task | ProjectTask) => void;
  activePage: Page;
  activeProjectId: string | null;
  activeProject: Project | null;

  // Habit form ref
  habitFormOpenerRef: React.MutableRefObject<(() => void) | null>;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used within UIProvider');
  return ctx;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tasks, projects, projectTasks,
    createTask, updateTask,
    createProject, updateProject,
    createProjectTask, updateProjectTask,
    setConfirmDelete,
    setSearchQuery, setProjectSearch, setProjectTaskSearch,
  } = useTaskContext();

  // ── Sidebar ──
  const [sidebarWidth, setSidebarWidth] = useState(220);

  // ── Task form state ──
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

  // ── Project form state ──
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormClosing, setProjectFormClosing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectIcon, setProjectIcon] = useState('Folder');
  const [projectColor, setProjectColor] = useState('#ed9b6d');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('active');

  // ── Project task form state ──
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

  // ── Refs ──
  const habitFormOpenerRef = useRef<(() => void) | null>(null);
  const detailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectFormTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cleanup timers on unmount ──
  useEffect(() => {
    return () => {
      if (formTimer.current) clearTimeout(formTimer.current);
      if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
      if (detailTimer.current) clearTimeout(detailTimer.current);
      if (detailTimer2.current) clearTimeout(detailTimer2.current);
    };
  }, []);

  // ── Page detection ──
  const activePage: Page = location.pathname.startsWith('/app/projects/') ? 'project-detail' : location.pathname.startsWith('/app/projects') ? 'projects' : location.pathname.startsWith('/app/settings') ? 'settings' : location.pathname.startsWith('/app/habits') || location.pathname.startsWith('/app/pomodoro') || location.pathname.startsWith('/app/calendar') || location.pathname.startsWith('/app/home') || location.pathname.startsWith('/app/templates') ? 'home' : 'tasks';
  const activeProjectId = activePage === 'project-detail' ? location.pathname.split('/')[3] : null;
  const activeProject = useMemo(() => activeProjectId ? projects.find((p) => p.id === activeProjectId) ?? null : null, [projects, activeProjectId]);

  // ── Task form handlers ──
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

    if (editingTask) {
      updateTask(editingTask.id, { title: trimmedTitle, description: trimmedDesc, priority: safePriority, deadline, tags, parentId });
    } else {
      createTask(trimmedTitle);
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

  function handleViewTaskEdit(task: Task) {
    closeDetail();
    setTimeout(() => openEditForm(task), 220);
  }

  function deleteTaskConfirm(id: string) {
    const task = tasks.find((t) => t.id === id);
    setConfirmDelete({ type: 'task', id, title: task?.title || '' });
  }

  // ── Project form handlers ──
  function openCreateProject() {
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
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
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
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
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
    setProjectFormClosing(true);
    projectFormTimer.current = setTimeout(() => {
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

    if (editingProject) {
      updateProject(editingProject.id, { name: trimmedName, description: trimmedDesc, icon: projectIcon, color: projectColor, status: projectStatus });
    } else {
      createProject(trimmedName, { icon: projectIcon, color: projectColor, status: projectStatus });
    }
    closeProjectForm();
  }

  function deleteProjectConfirm(id: string) {
    const project = projects.find((p) => p.id === id);
    setConfirmDelete({ type: 'project', id, title: project?.name || '' });
  }

  function openProject(project: Project) {
    navigate(`/app/projects/${project.id}`);
  }

  // ── Project task form handlers ──
  function openCreateProjectTask(sectionId: string | null) {
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
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
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
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
    if (projectFormTimer.current) clearTimeout(projectFormTimer.current);
    setProjectTaskFormClosing(true);
    projectFormTimer.current = setTimeout(() => {
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

    if (editingProjectTask) {
      updateProjectTask(editingProjectTask.id, { title: trimmedTitle, description: trimmedDesc, priority: safePriority, deadline: ptDeadline, tags: ptTags, parentId: ptParentId, sectionId: ptSectionId });
    } else {
      createProjectTask(activeProject.id, trimmedTitle, ptSectionId);
    }
    closeProjectTaskForm();
  }

  function deleteProjectTaskConfirm(id: string) {
    const task = projectTasks.find((t) => t.id === id);
    setConfirmDelete({ type: 'task', id, title: task?.title || '' });
  }

  function closeProjectTaskDetail() {
    setProjectTaskDetailClosing(true);
    detailTimer2.current = setTimeout(() => {
      setViewingProjectTask(null);
      setProjectTaskDetailClosing(false);
    }, 200);
  }

  function handleViewProjectTaskEdit(task: Task) {
    closeProjectTaskDetail();
    setTimeout(() => openEditProjectTask(task as ProjectTask), 220);
  }

  // ── Search create ──
  function createTaskFromSearch(title: string) {
    createTask(title);
    setSearchQuery('');
  }

  function createProjectFromSearch(name: string) {
    createProject(name);
    setProjectSearch('');
  }

  function createProjectTaskFromSearch(title: string) {
    if (!activeProject) return;
    createProjectTask(activeProject.id, title);
    setProjectTaskSearch('');
  }

  // ── Navigation ──
  const handleCreate = location.pathname.startsWith('/app/habits')
    ? () => habitFormOpenerRef.current?.()
    : activePage === 'project-detail' ? () => openCreateProjectTask(null) : activePage === 'projects' ? openCreateProject : openCreateForm;

  function handleCalendarViewTask(t: Task | ProjectTask) {
    if ('projectId' in t) setViewingProjectTask(t as ProjectTask);
    else setViewingTask(t);
  }

  const value: UIContextValue = {
    sidebarWidth, setSidebarWidth,
    showForm, formClosing, editingTask,
    title, setTitle, description, setDescription, priority, setPriority,
    deadline, setDeadline, tags, setTags, parentId, setParentId,
    openCreateForm, openEditForm, closeForm, handleSubmit,
    viewingTask, setViewingTask, detailClosing, closeDetail, handleViewTaskEdit, deleteTaskConfirm,
    showProjectForm, projectFormClosing, editingProject,
    projectName, setProjectName, projectDesc, setProjectDesc,
    projectIcon, setProjectIcon, projectColor, setProjectColor,
    projectStatus, setProjectStatus,
    openCreateProject, openEditProject, closeProjectForm, handleProjectSubmit, deleteProjectConfirm, openProject,
    showProjectTaskForm, projectTaskFormClosing, editingProjectTask,
    ptTitle, setPtTitle, ptDescription, setPtDescription, ptPriority, setPtPriority,
    ptDeadline, setPtDeadline, ptTags, setPtTags, ptParentId, setPtParentId, ptSectionId,
    openCreateProjectTask, openEditProjectTask, closeProjectTaskForm, handleProjectTaskSubmit,
    viewingProjectTask, setViewingProjectTask, projectTaskDetailClosing, closeProjectTaskDetail, handleViewProjectTaskEdit, deleteProjectTaskConfirm,
    createTaskFromSearch, createProjectFromSearch, createProjectTaskFromSearch,
    handleCreate, handleCalendarViewTask,
    activePage, activeProjectId, activeProject,
    habitFormOpenerRef,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
