import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

import { useTranslation } from 'react-i18next';
import type { Task } from '../types';
import type { FilterType } from '../types';
import { canAddSubtask, getTaskDepth, MAX_SUBTASK_DEPTH } from '../utils';
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

export default function TaskList({ tasks, taskMap, filter, searchQuery, onToggle, onView, onEdit, onDelete, onSetSubtask }: TaskListProps) {
  const { t } = useTranslation();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const maxDepthRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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

      if (targetId) {
        const targetDepth = getTaskDepth(targetId, taskMap);
        if (maxDepthRef.current) maxDepthRef.current.style.display = targetDepth >= MAX_SUBTASK_DEPTH ? '' : 'none';
      } else if (maxDepthRef.current) {
        maxDepthRef.current.style.display = 'none';
      }
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
        if (draggedTask && draggedTask.parentId !== ds.currentTarget && canAddSubtask(ds.taskId, ds.currentTarget, taskMap)) {
          onSetSubtask(ds.taskId, ds.currentTarget);
        }
      } else if (dragOverRoot) {
        onSetSubtask(ds.taskId, null);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
      isDraggingRef.current = false;
      if (maxDepthRef.current) maxDepthRef.current.style.display = 'none';
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

      if (targetId) {
        const targetDepth = getTaskDepth(targetId, taskMap);
        if (maxDepthRef.current) maxDepthRef.current.style.display = targetDepth >= MAX_SUBTASK_DEPTH ? '' : 'none';
      } else if (maxDepthRef.current) {
        maxDepthRef.current.style.display = 'none';
      }
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
        if (draggedTask && draggedTask.parentId !== ds.currentTarget && canAddSubtask(ds.taskId, ds.currentTarget, taskMap)) {
          onSetSubtask(ds.taskId, ds.currentTarget);
        }
      } else if (dragOverRoot) {
        onSetSubtask(ds.taskId, null);
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
      setDragOverRoot(false);
      isDraggingRef.current = false;
      if (maxDepthRef.current) maxDepthRef.current.style.display = 'none';
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
      isDraggingRef.current = false;
      if (maxDepthRef.current) maxDepthRef.current.style.display = 'none';
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
    isDraggingRef.current = true;
  }

  function handleTouchDragStart(taskId: string, e: React.TouchEvent) {
    const touch = e.touches[0];
    const ghost = createGhost(taskId, touch.clientX, touch.clientY);
    dragStateRef.current = { taskId, ghost, currentTarget: null, isMouse: false };
    setDraggingId(taskId);
    isDraggingRef.current = true;
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

  const subtaskMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (t.parentId) {
        const arr = map.get(t.parentId) ?? [];
        arr.push(t);
        map.set(t.parentId, arr);
      }
    }
    return map;
  }, [tasks]);

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
              {children.map((child: Task) => renderTask(child, depth + 1))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const tasksRef = useRef(tasks);

  useEffect(() => {
    return () => { prevPositionsRef.current.clear(); };
  }, []);

  useLayoutEffect(() => {
    if (isDraggingRef.current) return;
    if (tasksRef.current === tasks) return;
    tasksRef.current = tasks;
    const prev = prevPositionsRef.current;
    const nodes = document.querySelectorAll('.task-list [data-task-id]');
    nodes.forEach((node) => {
      const id = node.getAttribute('data-task-id');
      if (!id) return;
      const el = node as HTMLElement;
      const newRect = el.getBoundingClientRect();
      const oldRect = prev.get(id);
      if (oldRect) {
        const dy = oldRect.top - newRect.top;
        if (Math.abs(dy) > 1) {
          el.style.transform = `translateY(${dy}px)`;
          el.style.transition = 'none';
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
            el.style.transform = '';
          });
        }
      }
      prev.set(id, newRect);
    });
  });

  if (topLevelTasks.length === 0) {
    return (
      <div className="empty">
        <img src="/illustrations/Tasks-Variant-1.svg" className="empty-illustration" alt="" />
        <p className="empty-title">
          {searchQuery
            ? t('tasks.noResults')
            : filter === 'completed'
            ? t('tasks.noCompleted')
            : filter === 'active'
            ? t('tasks.allDone')
            : t('tasks.noTasks')}
        </p>
        <p className="empty-sub">
          {searchQuery
            ? t('tasks.noResultsSub')
            : t('tasks.noTasksSub')}
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
          <span className="task-make-root-text">{t('tasks.makeRoot')}</span>
        </div>
      )}
      <div ref={maxDepthRef} className="max-depth-notice" style={{ display: 'none' }}>
        {t('tasks.maxDepth')}
      </div>
      {topLevelTasks.map((task) => renderTask(task))}
    </div>
  );
}
