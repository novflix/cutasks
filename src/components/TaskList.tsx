import { useState, useCallback } from 'react';
import { NotesMinimalistic } from '@solar-icons/react';
import type { Task } from '../types';
import type { FilterType } from '../App';
import TaskCard, { DragHandle } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  taskMap: Map<string, Task>;
  filter: FilterType;
  searchQuery: string;
  onToggle: (id: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSetSubtask: (childId: string, parentId: string | null) => void;
}

function isDescendant(childId: string, parentId: string, taskMap: Map<string, Task>): boolean {
  let current = taskMap.get(childId);
  while (current?.parentId) {
    if (current.parentId === parentId) return true;
    current = taskMap.get(current.parentId);
  }
  return false;
}

export default function TaskList({ tasks, taskMap, filter, searchQuery, onToggle, onView, onEdit, onDelete, onSetSubtask }: TaskListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);

  const topLevelTasks = tasks.filter((t) => t.parentId === null);

  const subtaskMap = useCallback(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (t.parentId) {
        const arr = map.get(t.parentId) ?? [];
        arr.push(t);
        map.set(t.parentId, arr);
      }
    }
    return map;
  }, [tasks])();

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  }

  function handleDragOver(e: React.DragEvent, taskId: string) {
    if (!draggingId || draggingId === taskId) return;
    const draggedTask = taskMap.get(draggingId);
    if (!draggedTask) return;
    if (draggedTask.parentId === taskId) return;
    if (isDescendant(taskId, draggingId, taskMap)) return;
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(taskId);
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    const childId = e.dataTransfer.getData('text/plain');
    if (childId && childId !== targetId && !isDescendant(targetId, childId, taskMap)) {
      onSetSubtask(childId, targetId);
    }
    setDragOverId(null);
    setDraggingId(null);
  }

  function handleDragEnd() {
    setDragOverId(null);
    setDraggingId(null);
  }

  function renderTask(task: Task, depth: number = 0) {
    const children = subtaskMap.get(task.id) ?? [];

    return (
      <div key={task.id} className={`task-node ${depth > 0 ? 'task-child' : ''}`}>
        <div className="task-row">
          <DragHandle taskId={task.id} onDragStart={handleDragStart} child={depth > 0} />
          <TaskCard
            task={task}
            searchQuery={searchQuery}
            subtaskCount={children.length}
            isDragOver={dragOverId === task.id}
            onToggle={onToggle}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </div>
        {children.length > 0 && (
          <div className="task-children-wrap">
            <ul className="task-children">
              {children.map((child) => renderTask(child, depth + 1))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (topLevelTasks.length === 0) {
    return (
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
    );
  }

  return (
    <div
      className="task-list"
      onDragEnd={handleDragEnd}
    >
      {draggingId && taskMap.get(draggingId)?.parentId !== null && (
        <div
          className={`task-make-root ${dragOverRoot ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggingId) {
              e.dataTransfer.dropEffect = 'move';
              setDragOverRoot(true);
            }
          }}
          onDragLeave={() => setDragOverRoot(false)}
          onDrop={(e) => {
            e.preventDefault();
            const childId = e.dataTransfer.getData('text/plain');
            if (childId) {
              onSetSubtask(childId, null);
            }
            setDragOverRoot(false);
            setDraggingId(null);
          }}
        >
          <span className="task-make-root-text">Drop here to make a top-level task</span>
        </div>
      )}
      {topLevelTasks.map((task) => renderTask(task))}
    </div>
  );
}
