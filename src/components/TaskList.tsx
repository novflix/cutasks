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

  const dragStateRef = useRef<{
    taskId: string;
    ghost: HTMLElement | null;
    currentTarget: string | null;
    isMouse: boolean;
  } | null>(null);

  function findTargetAtPoint(clientX: number, clientY: number, excludeId: string): { targetId: string | null; isRoot: boolean } {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return { targetId: null, isRoot: false };

    const taskItem = el.closest('.task-item');
    if (taskItem) {
      const node = taskItem.closest('.task-node');
      if (node) {
        const key = node.getAttribute('data-task-id');
        if (key && key !== excludeId) return { targetId: key, isRoot: false };
      }
    }
    if (el.closest('.task-make-root')) return { targetId: null, isRoot: true };
    return { targetId: null, isRoot: false };
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const ds = dragStateRef.current;
      if (!ds || !ds.isMouse) return;
      if (ds.ghost) {
        ds.ghost.style.left = `${e.clientX - 30}px`;
        ds.ghost.style.top = `${e.clientY - 20}px`;
      }

      if (ds.ghost) ds.ghost.style.pointerEvents = 'none';
      const { targetId, isRoot } = findTargetAtPoint(e.clientX, e.clientY, ds.taskId);
      if (ds.ghost) ds.ghost.style.pointerEvents = '';

      setDragOverRoot(isRoot);
      setDragOverId(targetId);
      ds.currentTarget = targetId;
    }

    function handleMouseUp() {
      const ds = dragStateRef.current;
      if (!ds || !ds.isMouse) return;

      if (ds.ghost) {
        ds.ghost.remove();
        ds.ghost = null;
      }

      if (ds.currentTarget) {
        const draggedTask = taskMap.get(ds.taskId);
        if (draggedTask && draggedTask.parentId !== ds.currentTarget && !isDescendant(ds.currentTarget, ds.taskId, taskMap)) {
          onSetSubtask(ds.taskId, ds.currentTarget);
        }
      } else if (dragOverRoot) {
        onSetSubtask(ds.taskId, null);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
    }

    function handleTouchMove(e: TouchEvent) {
      const ds = dragStateRef.current;
      if (!ds || ds.isMouse) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (ds.ghost) {
        ds.ghost.style.left = `${touch.clientX - 30}px`;
        ds.ghost.style.top = `${touch.clientY - 20}px`;
      }

      if (ds.ghost) ds.ghost.style.pointerEvents = 'none';
      const { targetId, isRoot } = findTargetAtPoint(touch.clientX, touch.clientY, ds.taskId);
      if (ds.ghost) ds.ghost.style.pointerEvents = '';

      setDragOverRoot(isRoot);
      setDragOverId(targetId);
      ds.currentTarget = targetId;
    }

    function handleTouchEnd() {
      const ds = dragStateRef.current;
      if (!ds || ds.isMouse) return;

      if (ds.ghost) {
        ds.ghost.remove();
        ds.ghost = null;
      }

      if (ds.currentTarget) {
        const draggedTask = taskMap.get(ds.taskId);
        if (draggedTask && draggedTask.parentId !== ds.currentTarget && !isDescendant(ds.currentTarget, ds.taskId, taskMap)) {
          onSetSubtask(ds.taskId, ds.currentTarget);
        }
      } else if (dragOverRoot) {
        onSetSubtask(ds.taskId, null);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
    }

    function handleCancel() {
      if (dragStateRef.current?.ghost) {
        dragStateRef.current.ghost.remove();
        dragStateRef.current.ghost = null;
      }
      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleCancel);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleCancel);
    };
  }, [taskMap, onSetSubtask, dragOverRoot]);

  function createGhost(taskId: string, clientX: number, clientY: number): HTMLElement {
    const el = document.querySelector(`[data-task-id="${taskId}"]`);
    const rect = el?.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.textContent = taskMap.get(taskId)?.title ?? '';
    ghost.style.left = `${clientX - 30}px`;
    ghost.style.top = `${clientY - 20}px`;
    if (rect) ghost.style.width = `${rect.width}px`;
    document.body.appendChild(ghost);
    return ghost;
  }

  function handleMouseDown(taskId: string, e: React.MouseEvent) {
    e.preventDefault();
    const ghost = createGhost(taskId, e.clientX, e.clientY);
    dragStateRef.current = { taskId, ghost, currentTarget: null, isMouse: true };
    setDraggingId(taskId);
  }

  function handleTouchDragStart(taskId: string, e: React.TouchEvent) {
    const touch = e.touches[0];
    const ghost = createGhost(taskId, touch.clientX, touch.clientY);
    dragStateRef.current = { taskId, ghost, currentTarget: null, isMouse: false };
    setDraggingId(taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDragLeave() {
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

  function renderTask(task: Task, depth: number = 0) {
    const children = subtaskMap.get(task.id) ?? [];

    return (
      <div key={task.id} className={`task-node ${depth > 0 ? 'task-child' : ''}`} data-task-id={task.id}>
        <div className="task-row">
          <DragHandle taskId={task.id} onMouseDown={handleMouseDown} onTouchDragStart={handleTouchDragStart} child={depth > 0} />
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
    <div className="task-list">
      {draggingId && taskMap.get(draggingId)?.parentId !== null && (
        <div
          className={`task-make-root ${dragOverRoot ? 'drag-over' : ''}`}
          onMouseOver={() => { if (draggingId) setDragOverRoot(true); }}
          onMouseLeave={() => setDragOverRoot(false)}
        >
          <span className="task-make-root-text">Drop here to make a top-level task</span>
        </div>
      )}
      {topLevelTasks.map((task) => renderTask(task))}
    </div>
  );
}
