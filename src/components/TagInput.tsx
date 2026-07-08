import { useState, useRef, useEffect, useCallback } from 'react';
import CloseCircle from '@solar-icons/react/icons/ui/CloseCircle';
import { useTranslation } from 'react-i18next';
import { getTagColor, MAX_TAGS_COUNT } from '../utils';

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export default function TagInput({ tags, allTags, onChange, label }: TagInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(open);
  const closingRef = useRef(closing);

  useEffect(() => {
    openRef.current = open;
    closingRef.current = closing;
  });

  const suggestions = input.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t))
    : allTags.filter((t) => !tags.includes(t));

  useEffect(() => {
    return () => {
      if (closingTimer.current) clearTimeout(closingTimer.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    setClosing(true);
    closingTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClose]);

  const handleOpen = useCallback(() => {
    if (openRef.current) return;
    setOpen(true);
    setClosing(false);
  }, []);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS_COUNT) {
      onChange([...tags, trimmed]);
    }
    setInput('');
    handleClose();
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

  const dropdownClass = `tag-dropdown${closing ? ' closing' : ''}`;

  return (
    <div className="tag-input" ref={ref}>
      {label && <label className="tag-input-label">{label}</label>}
      <div className="tag-input-box" onClick={handleOpen}>
        {tags.map((tag) => {
          const c = getTagColor(tag);
          return (
            <span key={tag} className="user-tag tag-chip" style={{ background: c.bg, color: c.text }}>
              #{tag}
              <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>
                <CloseCircle size={14} />
              </button>
            </span>
          );
        })}
        <input
          type="text"
          className="tag-input-field"
          placeholder={tags.length ? t('components.tagInput.addTag') : t('components.tagInput.typeTag')}
          value={input}
          onChange={(e) => { setInput(e.target.value); handleOpen(); }}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          maxLength={50}
        />
      </div>
      {(open || closing) && suggestions.length > 0 && (
        <div className={dropdownClass}>
          {suggestions.slice(0, 8).map((tag) => {
            const c = getTagColor(tag);
            return (
              <button
                key={tag}
                type="button"
                className="tag-dropdown-item"
                onClick={() => addTag(tag)}
              >
                <span className="user-tag" style={{ background: c.bg, color: c.text, borderColor: c.text }}>
                  #{tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
