import { useState, useCallback, useRef, useEffect } from 'react';
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

  const touchDragRef = useRef<{
    taskId: string;
    ghost: HTMLElement | null;
    startX: number;
    startY: number;
    currentTarget: string | null;
  } | null>(null);

  useEffect(() => {
    function handleTouchMove(e: TouchEvent) {
      const td = touchDragRef.current;
      if (!td) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (td.ghost) {
        td.ghost.style.left = `${touch.clientX - 30}px`;
        td.ghost.style.top = `${touch.clientY - 20}px`;
      }
      if (td.ghost) td.ghost.style.display = 'block';

      if (td.ghost) td.ghost.style.pointerEvents = 'none';
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (td.ghost) td.ghost.style.pointerEvents = '';

      let foundTarget: string | null = null;
      let foundIsRoot = false;
      if (el) {
        const taskItem = el.closest('.task-item');
        if (taskItem) {
          const node = taskItem.closest('.task-node');
          if (node) {
            const key = node.getAttribute('data-task-id');
            if (key && key !== td.taskId) foundTarget = key;
          }
        }
        if (el.closest('.task-make-root')) foundIsRoot = true;
      }

      setDragOverRoot(foundIsRoot);
      setDragOverId(foundTarget);
      td.currentTarget = foundTarget;
    }

    function handleTouchEnd() {
      const td = touchDragRef.current;
      if (!td) return;

      if (td.ghost) {
        td.ghost.remove();
        td.ghost = null;
      }

      if (td.currentTarget) {
        const draggedTask = taskMap.get(td.taskId);
        if (draggedTask && draggedTask.parentId !== td.currentTarget && !isDescendant(td.currentTarget, td.taskId, taskMap)) {
          onSetSubtask(td.taskId, td.currentTarget);
        }
      } else if (dragOverRoot) {
        onSetSubtask(td.taskId, null);
      }

      touchDragRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
    }

    function handleTouchCancel() {
      if (touchDragRef.current?.ghost) {
        touchDragRef.current.ghost.remove();
        touchDragRef.current.ghost = null;
      }
      touchDragRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [taskMap, onSetSubtask, dragOverRoot]);

  function handleTouchDragStart(taskId: string, e: React.TouchEvent) {
    const touch = e.touches[0];
    const el = e.currentTarget.closest('.task-node');
    const rect = el?.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.textContent = taskMap.get(taskId)?.title ?? '';
    ghost.style.left = `${touch.clientX - 30}px`;
    ghost.style.top = `${touch.clientY - 20}px`;
    if (rect) {
      ghost.style.width = `${rect.width}px`;
    }
    document.body.appendChild(ghost);

    touchDragRef.current = {
      taskId,
      ghost,
      startX: touch.clientX,
      startY: touch.clientY,
      currentTarget: null,
    };
    setDraggingId(taskId);
  }

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
      <div key={task.id} className={`task-node ${depth > 0 ? 'task-child' : ''}`} data-task-id={task.id}>
        <div className="task-row">
          <DragHandle taskId={task.id} onDragStart={handleDragStart} onTouchDragStart={handleTouchDragStart} child={depth > 0} />
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
