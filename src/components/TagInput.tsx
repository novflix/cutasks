import { useState, useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export default function TagInput({ tags, allTags, onChange, label }: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = input.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
    : allTags.filter((t) => !tags.includes(t));

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

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="tag-input" ref={ref}>
      {label && <label className="tag-input-label">{label}</label>}
      <div className="tag-input-box" onClick={() => setOpen(true)}>
        {tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>
              <CloseCircle size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input-field"
          placeholder={tags.length ? 'Add tag...' : 'Type to add tags...'}
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="tag-dropdown">
          {suggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-dropdown-item"
              onClick={() => addTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
