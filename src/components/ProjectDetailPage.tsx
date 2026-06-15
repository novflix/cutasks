import { useState, useMemo, useRef, useEffect } from 'react';
import { AddSquare, Pen, TrashBinMinimalistic, NotesMinimalistic } from '@solar-icons/react';
import type { Project, Section as SectionType, ProjectTask, Priority } from '../types';
import { generateId } from '../utils';
import TaskCard from './TaskCard';
import SectionFormModal from './SectionFormModal';

interface ProjectDetailPageProps {
  project: Project;
  sections: SectionType[];
  tasks: ProjectTask[];
  onCreateTask: (sectionId: string | null) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onViewTask: (task: ProjectTask) => void;
  onUpdateTask: (id: string, changes: Partial<ProjectTask>) => void;
}

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default function ProjectDetailPage({
  project, sections, tasks,
  onCreateTask, onEditTask, onDeleteTask, onToggleTask, onViewTask, onUpdateTask,
}: ProjectDetailPageProps) {
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormClosing, setSectionFormClosing] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverUnsectioned, setDragOverUnsectioned] = useState(false);
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

    function handleMouseUp() {
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
          if (targetTask) {
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
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tasks, onUpdateTask]);

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
      createdAt: Date.now(), // eslint-disable-line react-hooks/purity -- event handler, not render
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
      <li key={task.id} data-task-id={task.id} className={dragOverId === task.id ? 'task-drag-over' : ''}>
        <div className={`pdrag-handle${depth > 0 ? ' pdrag-child' : ''}`} onMouseDown={(e) => handleDragStart(task.id, e)} onTouchStart={(e) => handleTouchStart(task.id, e)}>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.5" /><circle cx="9" cy="2.5" r="1.5" />
            <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13.5" r="1.5" /><circle cx="9" cy="13.5" r="1.5" />
          </svg>
        </div>
        <TaskCard
          task={task}
          searchQuery=""
          subtaskCount={children.length}
          isDragOver={false}
          onToggle={onToggleTask}
          onView={() => onViewTask(task)}
          onEdit={() => onEditTask(task)}
          onDelete={onDeleteTask}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => {}}
          onDrop={(e) => e.preventDefault()}
        />
        {children.length > 0 && (
          <ul className="psection-tasks ptask-children">
            {children.map((child) => renderTaskItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

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
                  {editingSectionId === section.id ? (
                    <div className="section-edit-row">
                      <input
                        type="text"
                        value={editingSectionName}
                        onChange={(e) => setEditingSectionName(e.target.value)}
                        className="section-edit-input"
                        maxLength={50}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditSection(section.id); if (e.key === 'Escape') setEditingSectionId(null); }}
                      />
                      <button className="btn-icon" onClick={() => saveEditSection(section.id)} title="Save">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      <button className="btn-icon" onClick={() => setEditingSectionId(null)} title="Cancel">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="project-section-name">{section.name}</h3>
                      <div className="project-section-actions">
                        <button className="btn-icon" onClick={() => startEditSection(section)} title="Edit name">
                          <Pen size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => onCreateTask(section.id)} title="Add task">
                          <AddSquare size={18} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => deleteSection(section.id)} title="Delete section">
                          <TrashBinMinimalistic size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {sectionTasks.length > 0 ? (
                  <ul className="psection-tasks">
                    {sectionTasks.map(renderTaskItem)}
                  </ul>
                ) : (
                  <button className="project-section-add" onClick={() => onCreateTask(section.id)}>
                    <AddSquare size={16} />
                    Add task
                  </button>
                )}
              </div>
            );
          })}

          {unsectionedTasks.length > 0 && (
            <div
              className={`project-unsectioned${dragOverUnsectioned ? ' drag-over' : ''}`}
              data-unsectioned
            >
              <ul className="psection-tasks">
                {unsectionedTasks.map(renderTaskItem)}
              </ul>
            </div>
          )}

          <button className="project-add-section" onClick={() => setShowSectionForm(true)}>
            <AddSquare size={18} />
            Add section
          </button>

          {projectSections.length === 0 && unsectionedTasks.length === 0 && (
            <div className="empty">
              <NotesMinimalistic size={56} className="empty-icon" />
              <p className="empty-title">No tasks yet</p>
              <p className="empty-sub">Create a section or add tasks directly</p>
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
