import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { AddSquare, Pen, TrashBinMinimalistic, NotesMinimalistic } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Project, Section as SectionType, ProjectTask } from '../types';
import { generateId, canAddSubtask, getTaskDepth, MAX_SUBTASK_DEPTH, priorityOrder } from '../utils';
import TaskCard from '../components/TaskCard';
import SectionFormModal from '../components/SectionFormModal';

interface ProjectDetailPageProps {
  project: Project;
  sections: SectionType[];
  tasks: ProjectTask[];
  searchQuery: string;
  onCreateTask: (sectionId: string | null) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onViewTask: (task: ProjectTask) => void;
  onUpdateTask: (id: string, changes: Partial<ProjectTask>) => void;
}

export default function ProjectDetailPage({
  project, sections, tasks, searchQuery,
  onCreateTask, onEditTask, onDeleteTask, onToggleTask, onViewTask, onUpdateTask,
}: ProjectDetailPageProps) {
  const { t } = useTranslation();
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormClosing, setSectionFormClosing] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverUnsectioned, setDragOverUnsectioned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [maxDepthNotice, setMaxDepthNotice] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const draggingIdRef = useRef<string | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef({ section: null as string | null, unsectioned: false, target: null as string | null });

  const projectSections = useMemo(
    () => sections.filter((s) => s.projectId === project.id).sort((a, b) => a.order - b.order),
    [sections, project.id]
  );

  const unsectionedTasks = useMemo(
    () => tasks.filter((t) => t.sectionId === null),
    [tasks]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, { parentId: string | null }>();
    for (const t of tasks) map.set(t.id, { parentId: t.parentId });
    return map;
  }, [tasks]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!ghostRef.current) return;
      ghostRef.current.style.left = `${e.clientX - 30}px`;
      ghostRef.current.style.top = `${e.clientY - 20}px`;

      ghostRef.current.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      ghostRef.current.style.pointerEvents = '';
      if (!el) return;

      const sectionEl = el.closest('[data-section-id]');
      const unsectionedEl = el.closest('[data-unsectioned]');
      const taskNode = el.closest('.task-item')?.closest('[data-task-id]');

      if (taskNode) {
        const taskId = taskNode.getAttribute('data-task-id');
        const newTarget = taskId && taskId !== draggingIdRef.current ? taskId : null;
        dragStateRef.current = { section: null, unsectioned: false, target: newTarget };
        setDragOverId(newTarget);
        setDragOverSection(null);
        setDragOverUnsectioned(false);
        if (newTarget) {
          const targetDepth = getTaskDepth(newTarget, taskMap);
          setMaxDepthNotice(targetDepth >= MAX_SUBTASK_DEPTH);
        } else {
          setMaxDepthNotice(false);
        }
      } else if (sectionEl) {
        const sid = sectionEl.getAttribute('data-section-id');
        dragStateRef.current = { section: sid, unsectioned: false, target: null };
        setDragOverSection(sid);
        setDragOverId(null);
        setDragOverUnsectioned(false);
      } else if (unsectionedEl) {
        dragStateRef.current = { section: null, unsectioned: true, target: null };
        setDragOverUnsectioned(true);
        setDragOverSection(null);
        setDragOverId(null);
      } else {
        dragStateRef.current = { section: null, unsectioned: false, target: null };
        setDragOverId(null);
        setDragOverSection(null);
        setDragOverUnsectioned(false);
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!ghostRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      ghostRef.current.style.left = `${touch.clientX - 30}px`;
      ghostRef.current.style.top = `${touch.clientY - 20}px`;

      ghostRef.current.style.pointerEvents = 'none';
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      ghostRef.current.style.pointerEvents = '';
      if (!el) return;

      const sectionEl = el.closest('[data-section-id]');
      const unsectionedEl = el.closest('[data-unsectioned]');
      const taskNode = el.closest('.task-item')?.closest('[data-task-id]');

      if (taskNode) {
        const taskId = taskNode.getAttribute('data-task-id');
        const newTarget = taskId && taskId !== draggingIdRef.current ? taskId : null;
        dragStateRef.current = { section: null, unsectioned: false, target: newTarget };
        setDragOverId(newTarget);
        setDragOverSection(null);
        setDragOverUnsectioned(false);
      } else if (sectionEl) {
        const sid = sectionEl.getAttribute('data-section-id');
        dragStateRef.current = { section: sid, unsectioned: false, target: null };
        setDragOverSection(sid);
        setDragOverId(null);
        setDragOverUnsectioned(false);
      } else if (unsectionedEl) {
        dragStateRef.current = { section: null, unsectioned: true, target: null };
        setDragOverUnsectioned(true);
        setDragOverSection(null);
        setDragOverId(null);
      } else {
        dragStateRef.current = { section: null, unsectioned: false, target: null };
        setDragOverId(null);
        setDragOverSection(null);
        setDragOverUnsectioned(false);
      }
    }

    function handleEnd() {
      if (!ghostRef.current) return;
      const dsId = draggingIdRef.current;
      const ds = dragStateRef.current;

      if (dsId) {
        if (ds.section) {
          onUpdateTask(dsId, { sectionId: ds.section, parentId: null });
        } else if (ds.unsectioned) {
          onUpdateTask(dsId, { sectionId: null, parentId: null });
        } else if (ds.target) {
          const targetTask = tasks.find((t) => t.id === ds.target);
          if (targetTask && canAddSubtask(dsId, ds.target, taskMap)) {
            onUpdateTask(dsId, { sectionId: targetTask.sectionId, parentId: ds.target });
          }
        }
      }

      ghostRef.current.remove();
      ghostRef.current = null;
      draggingIdRef.current = null;
      dragStateRef.current = { section: null, unsectioned: false, target: null };
      setDragOverId(null);
      setDragOverSection(null);
      setDragOverUnsectioned(false);
      setIsDragging(false);
      setMaxDepthNotice(false);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [tasks, onUpdateTask, taskMap]);

  function handleDragStart(taskId: string, e: React.MouseEvent) {
    e.preventDefault();
    const el = document.querySelector(`[data-task-id="${taskId}"]`);
    const rect = el?.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.textContent = tasks.find((t) => t.id === taskId)?.title ?? '';
    ghost.style.left = `${e.clientX - 30}px`;
    ghost.style.top = `${e.clientY - 20}px`;
    if (rect) ghost.style.width = `${rect.width}px`;
    document.body.appendChild(ghost);
      ghostRef.current = ghost;
    draggingIdRef.current = taskId;
    setIsDragging(true);
  }

  function handleTouchStart(taskId: string, e: React.TouchEvent) {
    const touch = e.touches[0];
    const el = document.querySelector(`[data-task-id="${taskId}"]`);
    const rect = el?.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'touch-drag-ghost';
    ghost.textContent = tasks.find((t) => t.id === taskId)?.title ?? '';
    ghost.style.left = `${touch.clientX - 30}px`;
    ghost.style.top = `${touch.clientY - 20}px`;
    if (rect) ghost.style.width = `${rect.width}px`;
    document.body.appendChild(ghost);
      ghostRef.current = ghost;
    draggingIdRef.current = taskId;
    setIsDragging(true);
  }

  function handleSectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = sectionName.trim();
    if (!trimmed) return;
    const newSection: SectionType = {
      id: generateId(),
      projectId: project.id,
      name: trimmed,
      order: projectSections.length,
      createdAt: Date.now(),
    };
    onSaveSectionsLocal([...sections, newSection]);
    setSectionName('');
    setSectionFormClosing(true);
    setTimeout(() => {
      setShowSectionForm(false);
      setSectionFormClosing(false);
    }, 200);
  }

  function deleteSection(id: string) {
    tasks.filter((t) => t.sectionId === id).forEach((t) => onUpdateTask(t.id, { sectionId: null }));
    onSaveSectionsLocal(sections.filter((s) => s.id !== id));
  }

  function onSaveSectionsLocal(newSections: SectionType[]) {
    window.dispatchEvent(new CustomEvent('save-sections', { detail: newSections }));
  }

  function startEditSection(section: SectionType) {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name);
  }

  function saveEditSection(id: string) {
    const trimmed = editingSectionName.trim();
    if (trimmed) {
      onSaveSectionsLocal(sections.map((s) => s.id === id ? { ...s, name: trimmed } : s));
    }
    setEditingSectionId(null);
  }

  function getTasksForSection(sectionId: string | null): ProjectTask[] {
    return tasks
      .filter((t) => t.sectionId === sectionId && t.parentId === null)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  function renderTaskItem(task: ProjectTask, depth: number = 0) {
    const children = tasks.filter((t) => t.parentId === task.id);
    return (
      <div key={task.id} className={`task-node${depth > 0 ? ' task-child' : ''}`} data-task-id={task.id}>
        <div className="task-row">
          <div
            className={`task-drag-handle${depth > 0 ? ' task-drag-handle-child' : ''}`}
            onMouseDown={(e) => handleDragStart(task.id, e)}
            onTouchStart={(e) => handleTouchStart(task.id, e)}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <circle cx="3" cy="2.5" r="1.5" /><circle cx="9" cy="2.5" r="1.5" />
              <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
              <circle cx="3" cy="13.5" r="1.5" /><circle cx="9" cy="13.5" r="1.5" />
            </svg>
          </div>
          <TaskCard
            task={task}
            searchQuery={searchQuery}
            subtaskCount={children.length}
            isDragOver={dragOverId === task.id}
            onToggle={onToggleTask}
            onView={() => onViewTask(task)}
            onEdit={() => onEditTask(task)}
            onDelete={onDeleteTask}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {}}
            onDrop={(e) => e.preventDefault()}
          />
        </div>
        {children.length > 0 && (
          <div className="task-children-wrap">
            <ul className="task-children">
              {children.map((child) => renderTaskItem(child, depth + 1))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const tasksRef = useRef(tasks);

  useLayoutEffect(() => {
    if (tasksRef.current === tasks) return;
    tasksRef.current = tasks;
    const prev = prevPositionsRef.current;
    const nodes = document.querySelectorAll('[data-task-id]');
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

  return (
    <>
      <div className="project-detail">
        <div className="project-sections">
          {projectSections.map((section) => {
            const sectionTasks = getTasksForSection(section.id);
            const isDropTarget = dragOverSection === section.id;
            return (
              <div
                key={section.id}
                className={`project-section${isDropTarget ? ' drag-over' : ''}`}
                data-section-id={section.id}
              >
                <div className="project-section-header">
                  <h3 className="project-section-name">{section.name}</h3>
                  <div className="project-section-actions">
                    <button className="btn-icon" onClick={() => startEditSection(section)} title={t('projects.editName')}>
                      <Pen size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => onCreateTask(section.id)} title={t('projects.addTask')}>
                      <AddSquare size={18} />
                    </button>
                    <button className="btn-icon btn-icon-danger" onClick={() => deleteSection(section.id)} title={t('projects.deleteSection')}>
                      <TrashBinMinimalistic size={18} />
                    </button>
                  </div>
                </div>
                {sectionTasks.length > 0 ? (
                  <div className="task-list">
                    {sectionTasks.map((t) => renderTaskItem(t))}
                  </div>
                ) : (
                  <button className="project-section-add" onClick={() => onCreateTask(section.id)}>
                    <AddSquare size={16} />
                    {t('projects.addTask')}
                  </button>
                )}
              </div>
            );
          })}

          {unsectionedTasks.length > 0 ? (
            <div
              className={`project-unsectioned${dragOverUnsectioned ? ' drag-over' : ''}`}
              data-unsectioned
            >
              <div className="task-list">
                {unsectionedTasks.map((t) => renderTaskItem(t))}
              </div>
            </div>
          ) : isDragging ? (
            <div
              className={`project-unsectioned project-unsectioned-empty${dragOverUnsectioned ? ' drag-over' : ''}`}
              data-unsectioned
            >
              <span className="project-unsectioned-hint">{t('projects.dropHere')}</span>
            </div>
          ) : null}

          {maxDepthNotice && (
            <div className="max-depth-notice">
              {t('tasks.maxDepth')}
            </div>
          )}

          <button className="project-add-section" onClick={() => setShowSectionForm(true)}>
            <AddSquare size={18} />
            {t('projects.addSection')}
          </button>

          {projectSections.length === 0 && unsectionedTasks.length === 0 && (
            <div className="empty">
              <NotesMinimalistic size={56} className="empty-icon" />
              <p className="empty-title">{t('projects.noTasks')}</p>
              <p className="empty-sub">{t('projects.noTasksSub')}</p>
            </div>
          )}
        </div>
      </div>

      {(showSectionForm || sectionFormClosing) && (
        <SectionFormModal
          sectionName={sectionName}
          onNameChange={setSectionName}
          onSubmit={handleSectionSubmit}
          onClose={() => {
            setSectionFormClosing(true);
            setTimeout(() => {
              setShowSectionForm(false);
              setSectionFormClosing(false);
              setSectionName('');
            }, 200);
          }}
          isClosing={sectionFormClosing}
        />
      )}

      {(editingSectionId && !showSectionForm) && (
        <SectionFormModal
          editing
          sectionName={editingSectionName}
          onNameChange={setEditingSectionName}
          onSubmit={(e) => { e.preventDefault(); saveEditSection(editingSectionId); }}
          onClose={() => {
            setSectionFormClosing(true);
            setTimeout(() => {
              setEditingSectionId(null);
              setSectionFormClosing(false);
            }, 200);
          }}
          isClosing={sectionFormClosing}
        />
      )}
    </>
  );
}
