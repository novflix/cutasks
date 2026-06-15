import { useState, useMemo } from 'react';
import { AddSquare, Pen, TrashBinMinimalistic, NotesMinimalistic, CheckCircle, CloseCircle } from '@solar-icons/react';
import type { Project, Section as SectionType, ProjectTask, Priority } from '../types';
import { generateId } from '../utils';
import TaskCard from './TaskCard';
import SectionFormModal from './SectionFormModal';

interface ProjectDetailPageProps {
  project: Project;
  sections: SectionType[];
  tasks: ProjectTask[];
  onBack: () => void;
  onCreateTask: (sectionId: string | null) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
  onViewTask: (task: ProjectTask) => void;
  onSaveSections: (sections: SectionType[]) => void;
}

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default function ProjectDetailPage({
  project, sections, tasks,
  onCreateTask, onEditTask, onDeleteTask, onToggleTask, onViewTask,
  onSaveSections,
}: ProjectDetailPageProps) {
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormClosing, setSectionFormClosing] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  const projectSections = useMemo(
    () => sections.filter((s) => s.projectId === project.id).sort((a, b) => a.order - b.order),
    [sections, project.id]
  );

  const unsectionedTasks = useMemo(
    () => tasks.filter((t) => t.sectionId === null),
    [tasks]
  );

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
    onSaveSections([...sections, newSection]);
    setSectionName('');
    setSectionFormClosing(true);
    setTimeout(() => {
      setShowSectionForm(false);
      setSectionFormClosing(false);
    }, 200);
  }

  function deleteSection(id: string) {
    onSaveSections(sections.filter((s) => s.id !== id));
  }

  function startEditSection(section: SectionType) {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name);
  }

  function saveEditSection(id: string) {
    const trimmed = editingSectionName.trim();
    if (trimmed) {
      onSaveSections(sections.map((s) => s.id === id ? { ...s, name: trimmed } : s));
    }
    setEditingSectionId(null);
  }

  function cancelEditSection() {
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

  return (
    <>
      <div className="project-detail">
        <div className="project-sections">
          {projectSections.map((section) => {
            const sectionTasks = getTasksForSection(section.id);
            const isEditing = editingSectionId === section.id;
            return (
              <div key={section.id} className="project-section">
                <div className="project-section-header">
                  {isEditing ? (
                    <div className="section-edit-row">
                      <input
                        type="text"
                        value={editingSectionName}
                        onChange={(e) => setEditingSectionName(e.target.value)}
                        className="section-edit-input"
                        maxLength={50}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditSection(section.id); if (e.key === 'Escape') cancelEditSection(); }}
                      />
                      <button className="btn-icon" onClick={() => saveEditSection(section.id)} title="Save">
                        <CheckCircle size={18} />
                      </button>
                      <button className="btn-icon" onClick={cancelEditSection} title="Cancel">
                        <CloseCircle size={18} />
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
                  <ul className="project-section-tasks">
                    {sectionTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        searchQuery=""
                        subtaskCount={tasks.filter((t) => t.parentId === task.id).length}
                        isDragOver={dragOverId === task.id}
                        onToggle={onToggleTask}
                        onView={() => onViewTask(task)}
                        onEdit={() => onEditTask(task)}
                        onDelete={onDeleteTask}
                        onDragOver={(e, id) => { e.preventDefault(); setDragOverId(id); }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => { e.preventDefault(); setDragOverId(null); }}
                      />
                    ))}
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
            <div className="project-unsectioned">
              <ul className="project-section-tasks">
                {unsectionedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    searchQuery=""
                    subtaskCount={tasks.filter((t) => t.parentId === task.id).length}
                    isDragOver={dragOverId === task.id}
                    onToggle={onToggleTask}
                    onView={() => onViewTask(task)}
                    onEdit={() => onEditTask(task)}
                    onDelete={onDeleteTask}
                    onDragOver={(e, id) => { e.preventDefault(); setDragOverId(id); }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => { e.preventDefault(); setDragOverId(null); }}
                  />
                ))}
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
    </>
  );
}
