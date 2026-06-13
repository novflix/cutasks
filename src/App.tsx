import { useState, useEffect, useMemo } from 'react';
import './App.css';
import type { Task, Priority } from './types';
import { generateId } from './utils';
import { loadTasks, saveTasks, getAllTags } from './storage';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import TaskList from './components/TaskList';
import TaskDetailModal from './components/TaskDetailModal';
import TaskFormModal from './components/TaskFormModal';
import { getDeadlineStatus } from './utils';

export type FilterType = 'all' | 'active' | 'completed';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

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

  const allTags = useMemo(() => getAllTags(tasks), [tasks]);

  const activeViewingTask = useMemo(
    () => (viewingTask ? tasks.find((t) => t.id === viewingTask.id) ?? null : null),
    [tasks, viewingTask]
  );

  function openCreateForm() {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setTags([]);
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline || '');
    setTags(task.tags || []);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
    setTags([]);
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
            ? { ...t, title: trimmedTitle, description: description.trim(), priority, deadline, tags, updatedAt: now }
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
        tags,
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
          filter={filter}
          searchQuery={searchQuery}
          onToggle={toggleComplete}
          onView={setViewingTask}
          onEdit={openEditForm}
          onDelete={deleteTask}
        />
      </main>

      {activeViewingTask && (
        <TaskDetailModal
          task={activeViewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={openEditForm}
          onToggle={toggleComplete}
        />
      )}

      {showForm && (
        <TaskFormModal
          editingTask={editingTask}
          title={title}
          description={description}
          priority={priority}
          deadline={deadline}
          tags={tags}
          allTags={allTags}
          onTitleChange={setTitle}
          onDescChange={setDescription}
          onPriorityChange={setPriority}
          onDeadlineChange={setDeadline}
          onTagsChange={setTags}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
