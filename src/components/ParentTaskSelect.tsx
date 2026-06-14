import { useState, useRef, useEffect } from 'react';
import { CloseCircle, ArrowUp } from '@solar-icons/react';
import type { Task } from '../types';

interface ParentTaskSelectProps {
  parentId: string | null;
  currentTaskId: string | null;
  allTasks: Task[];
  onChange: (parentId: string | null) => void;
}

export default function ParentTaskSelect({ parentId, currentTaskId, allTasks, onChange }: ParentTaskSelectProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const availableTasks = allTasks.filter(
    (t) => t.id !== currentTaskId && t.parentId === null
  );

  const parentTask = parentId ? allTasks.find((t) => t.id === parentId) ?? null : null;

  const suggestions = input.trim()
    ? availableTasks.filter((t) => t.title.toLowerCase().includes(input.toLowerCase()))
    : availableTasks;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  function selectTask(task: Task) {
    onChange(task.id);
    setInput('');
    setOpen(false);
  }

  function clearParent() {
    onChange(null);
    setInput('');
  }

  return (
    <div className="parent-select" ref={ref}>
      <label className="parent-select-label">
        <ArrowUp size={13} />
        Parent Task
      </label>
      {parentTask ? (
        <div className="parent-selected">
          <span className="parent-selected-title">{parentTask.title}</span>
          <button type="button" className="parent-selected-remove" onClick={clearParent}>
            <CloseCircle size={16} />
          </button>
        </div>
      ) : (
        <div className="parent-input-box" onClick={() => setOpen(true)}>
          <input
            type="text"
            className="parent-input"
            placeholder="Search tasks to set as parent..."
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div className="parent-dropdown">
          {suggestions.slice(0, 10).map((task) => (
            <button
              key={task.id}
              type="button"
              className="parent-dropdown-item"
              onClick={() => selectTask(task)}
            >
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority}
              </span>
              <span className="parent-dropdown-title">{task.title}</span>
            </button>
          ))}
        </div>
      )}
      {open && input.trim() && suggestions.length === 0 && (
        <div className="parent-dropdown parent-dropdown-empty">
          <span className="parent-dropdown-empty-text">No tasks found</span>
        </div>
      )}
    </div>
  );
}
