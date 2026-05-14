import React, { useRef, useState } from 'react';
import { AddCircle, CheckCircle, CloseCircle } from '@solar-icons/react';

interface Props {
  accentColor: string;
  onAdd: (title: string) => void;
  onOpenModal: () => void;
}

/**
 * InlineAddTask — quick-add row inside a project section.
 * Shows an "Add task" button; on click expands to an inline input.
 * Press Enter to confirm, Escape to cancel, "···" to open the full modal.
 */
export const InlineAddTask: React.FC<Props> = ({ accentColor, onAdd, onOpenModal }) => {
  const [active, setActive] = useState(false);
  const [val, setVal]       = useState('');
  const inputRef            = useRef<HTMLInputElement>(null);

  const activate = () => { setActive(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const cancel   = () => { setActive(false); setVal(''); };

  const commit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(''); inputRef.current?.focus(); }
    else cancel();
  };

  if (!active) {
    return (
      <button
        onClick={activate}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-body transition-all duration-150 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        style={{ color: accentColor }}
      >
        <AddCircle size={15} />
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
      style={{ background: 'var(--bg-panel)', border: `1.5px solid ${accentColor}40` }}
    >
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter')  commit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder="Task name…"
        className="flex-1 bg-transparent text-sm font-body outline-none"
        style={{ color: 'var(--text-main)' }}
        maxLength={120}
      />
      <button
        onClick={onOpenModal}
        className="text-xs font-body px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
        title="More options"
      >
        ···
      </button>
      <button onClick={commit} style={{ color: accentColor }}>
        <CheckCircle size={16} />
      </button>
      <button onClick={cancel} style={{ color: 'var(--text-muted)' }}>
        <CloseCircle size={16} />
      </button>
    </div>
  );
};
