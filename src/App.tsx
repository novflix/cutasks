import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AddSquare,
  Pen,
  TrashBinMinimalistic,
  CloseCircle,
  MinimalisticMagnifier,
  NotesMinimalistic,
  CalendarMinimalistic,
  PenNewRound,
} from '@solar-icons/react';
import './App.css';
import type { Task, Priority } from './types';
import DatePicker from './components/DatePicker';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const STORAGE_KEY = 'cutasks_tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: Task) => ({ ...t, deadline: t.deadline || '' }));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDeadline(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDeadlineStatus(dateStr: string, completed: boolean): 'overdue' | 'today' | 'soon' | 'normal' | '' {
  if (!dateStr || completed) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr + 'T00:00:00');
  const diff = deadline.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'normal';
}

type FilterType = 'all' | 'active' | 'completed';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [showForm]);

  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

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

  function openCreateForm() {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setShowForm(true);
  }

  function openViewModal(task: Task) {
    setViewingTask(task);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline || '');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const now = Date.now();

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, title: trimmedTitle, description: description.trim(), priority, deadline, updatedAt: now }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: generateId(),
        title: trimmedTitle,
        description: description.trim(),
        priority,
        deadline,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    closeForm();
  }

  function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <img src="/logo.svg" alt="CuTasks" className="logo logo-full" />
            <img src="/logo-mini.svg" alt="CuTasks" className="logo logo-mini" />
            <button className="btn btn-primary btn-add" onClick={openCreateForm}>
              <AddSquare size={20} />
              <span className="btn-label">New Task</span>
            </button>
          </div>
          <div className="stats">
            <span className="stat">
              <strong>{stats.total}</strong> total
            </span>
            <span className="stat stat-active">
              <strong>{stats.active}</strong> active
            </span>
            <span className="stat stat-done">
              <strong>{stats.completed}</strong> done
            </span>
            {stats.overdue > 0 && (
              <span className="stat stat-overdue">
                <strong>{stats.overdue}</strong> overdue
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <MinimalisticMagnifier size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      <main className="main">
        {filteredTasks.length === 0 ? (
          <div className="empty">
            <NotesMinimalistic size={64} className="empty-icon" />
            <p className="empty-title">
              {searchQuery
                ? 'Nothing found'
                : filter === 'completed'
                ? 'No completed tasks'
                : filter === 'active'
                ? 'All tasks are done!'
                : 'No tasks yet'}
            </p>
            <p className="empty-sub">
              {searchQuery
                ? 'Try a different search'
                : 'Click "New Task" to get started'}
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => {
              const dlStatus = getDeadlineStatus(task.deadline, task.completed);
              return (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''} ${dlStatus === 'overdue' ? 'task-overdue' : ''}`}
                >
                  <button
                    className={`task-check ${task.completed ? 'checked' : ''}`}
                    onClick={() => toggleComplete(task.id)}
                    title={task.completed ? 'Undo' : 'Complete'}
                  >
                    <span className="particles">
                      <i /><i /><i /><i /><i /><i />
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                      <polyline points="5 12 10 17 19 7" className="check-path" />
                    </svg>
                  </button>
                  <div className="task-body" onClick={() => openViewModal(task)}>
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    <div className="task-tags">
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.deadline && (
                        <span className={`deadline-badge deadline-${dlStatus}`}>
                          <CalendarMinimalistic size={11} />
                          {formatDeadline(task.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn-icon"
                      onClick={() => openEditForm(task)}
                      title="Edit"
                    >
                      <Pen size={20} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => deleteTask(task.id)}
                      title="Delete"
                    >
                      <TrashBinMinimalistic size={20} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {viewingTask && (
        <div className="modal-overlay" onClick={() => setViewingTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Details</h2>
              <button className="btn-icon" onClick={() => setViewingTask(null)}>
                <CloseCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <h3 className="detail-title">{viewingTask.title}</h3>
              {viewingTask.description && (
                <p className="detail-desc">{viewingTask.description}</p>
              )}
              <div className="detail-badges">
                <span className={`priority-badge priority-${viewingTask.priority}`}>
                  {viewingTask.priority}
                </span>
                <span className={`status-badge ${viewingTask.completed ? 'status-done' : 'status-active'}`}>
                  {viewingTask.completed ? 'Completed' : 'Active'}
                </span>
                {viewingTask.deadline && (
                  <span className={`deadline-badge deadline-${getDeadlineStatus(viewingTask.deadline, viewingTask.completed)}`}>
                    <CalendarMinimalistic size={11} />
                    Due: {formatDeadline(viewingTask.deadline)}
                  </span>
                )}
              </div>
              <div className="detail-dates">
                <div className="date-item">
                  <CalendarMinimalistic size={14} />
                  <span>Created: {formatDate(viewingTask.createdAt)}</span>
                </div>
                {viewingTask.updatedAt !== viewingTask.createdAt && (
                  <div className="date-item">
                    <PenNewRound size={14} />
                    <span>Updated: {formatDate(viewingTask.updatedAt)}</span>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setViewingTask(null)}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={() => {
                  setViewingTask(null);
                  openEditForm(viewingTask);
                }}>
                  Edit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="btn-icon" onClick={closeForm}>
                <CloseCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="task-title">Title</label>
                <input
                  ref={titleRef}
                  id="task-title"
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-desc">Description</label>
                <textarea
                  id="task-desc"
                  placeholder="Additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input form-textarea"
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label>Priority</label>
                  <div className="priority-selector">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-option priority-option-${p} ${priority === p ? 'selected' : ''}`}
                        onClick={() => setPriority(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group form-group-half">
                  <DatePicker
                    id="task-deadline"
                    label="Deadline"
                    value={deadline}
                    onChange={setDeadline}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              {editingTask && (
                <div className="detail-dates">
                  <div className="date-item">
                    <CalendarMinimalistic size={14} />
                    <span>Created: {formatDate(editingTask.createdAt)}</span>
                  </div>
                  {editingTask.updatedAt !== editingTask.createdAt && (
                    <div className="date-item">
                      <PenNewRound size={14} />
                      <span>Updated: {formatDate(editingTask.updatedAt)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
