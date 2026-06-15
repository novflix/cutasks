import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './App.css';
import type { Task, Priority, Page, Project } from './types';
import { generateId } from './utils';
import { loadTasks, saveTasks, getAllTags, loadProjects, saveProjects } from './storage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import TaskList from './components/TaskList';
import TaskDetailModal from './components/TaskDetailModal';
import TaskFormModal from './components/TaskFormModal';
import ProjectsPage from './components/ProjectsPage';
import ProjectFormModal from './components/ProjectFormModal';
import MobileNav from './components/MobileNav';
import { getDeadlineStatus } from './utils';

export type FilterType = 'all' | 'active' | 'completed';

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default function App() {
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
  const [activePage, setActivePage] = useState<Page>('tasks');
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormClosing, setProjectFormClosing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectIcon, setProjectIcon] = useState('Folder');
  const [projectColor, setProjectColor] = useState('#ed9b6d');

  const tasksRef = useRef(tasks);
  const historyRef = useRef<Task[][]>([]);
  const formTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    tasksRef.current = tasks;
  });

  useEffect(() => {
    return () => {
      if (formTimer.current) clearTimeout(formTimer.current);
      if (detailTimer.current) clearTimeout(detailTimer.current);
    };
  }, []);

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
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

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
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      )
    );
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
    setProjectFormClosing(false);
    setShowProjectForm(true);
  }

  function openEditProject(project: Project) {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDesc(project.description);
    setProjectIcon(project.icon);
    setProjectColor(project.color);
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
            ? { ...p, name: trimmedName, description: projectDesc.trim(), icon: projectIcon, color: projectColor, updatedAt: now }
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
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [newProject, ...prev]);
    }
    closeProjectForm();
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const handleCreate = activePage === 'projects' ? openCreateProject : openCreateForm;

  return (
    <div className="app" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <Sidebar width={sidebarWidth} onResize={setSidebarWidth} activePage={activePage} onNavigate={setActivePage} />
      <div className="app-content">
        {activePage === 'tasks' ? (
          <>
            <Header stats={stats} onCreate={openCreateForm} />
            <Toolbar
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              filter={filter}
              onFilter={setFilter}
            />
            <main className="main">
              <TaskList
                tasks={filteredTasks}
                taskMap={taskMap}
                filter={filter}
                searchQuery={searchQuery}
                onToggle={toggleComplete}
                onView={setViewingTask}
                onEdit={openEditForm}
                onDelete={deleteTask}
                onSetSubtask={setSubtaskOf}
              />
            </main>
          </>
        ) : (
          <>
            <Header stats={stats} onCreate={openCreateProject} createLabel="New Project" />
            <main className="main">
              <ProjectsPage
                projects={projects}
                onEdit={openEditProject}
                onDelete={deleteProject}
              />
            </main>
          </>
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

      {(showProjectForm || projectFormClosing) && (
        <ProjectFormModal
          editingProject={editingProject}
          name={projectName}
          description={projectDesc}
          icon={projectIcon}
          color={projectColor}
          onNameChange={setProjectName}
          onDescChange={setProjectDesc}
          onIconChange={setProjectIcon}
          onColorChange={setProjectColor}
          onSubmit={handleProjectSubmit}
          onClose={closeProjectForm}
          isClosing={projectFormClosing}
        />
      )}

      <MobileNav activePage={activePage} onNavigate={setActivePage} onCreate={handleCreate} />
    </div>
  );
}
