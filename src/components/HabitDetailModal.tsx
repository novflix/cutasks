import { useState, useRef, useEffect, type ComponentType } from 'react';
import {
  CloseCircle, PenNewRound, CalendarMinimalistic, Fire,
  Book, Running, Meditation, Waterdrop, Heart, MoonStars,
  CupHot, Target, MedalStar, Shield, Leaf, Star, Bolt, Alarm,
  SmileCircle, Football, CodeSquare, Palette, MusicNote, Notes,
} from '@solar-icons/react';
import type { Habit } from '../types';
import { formatDate } from '../utils';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HABIT_ICONS: { name: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { name: 'Book', icon: Book },
  { name: 'Running', icon: Running },
  { name: 'Meditation', icon: Meditation },
  { name: 'Waterdrop', icon: Waterdrop },
  { name: 'Heart', icon: Heart },
  { name: 'MoonStars', icon: MoonStars },
  { name: 'CupHot', icon: CupHot },
  { name: 'Target', icon: Target },
  { name: 'MedalStar', icon: MedalStar },
  { name: 'Shield', icon: Shield },
  { name: 'Leaf', icon: Leaf },
  { name: 'Star', icon: Star },
  { name: 'Bolt', icon: Bolt },
  { name: 'Alarm', icon: Alarm },
  { name: 'SmileCircle', icon: SmileCircle },
  { name: 'Football', icon: Football },
  { name: 'CodeSquare', icon: CodeSquare },
  { name: 'Palette', icon: Palette },
  { name: 'MusicNote', icon: MusicNote },
  { name: 'Notes', icon: Notes },
];

const HABIT_COLORS = [
  '#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d',
  '#4db6ac', '#e57373', '#9575cd', '#4fc3f7', '#f06292',
  '#aed581', '#ff8a65',
];

function getIcon(name: string) {
  return HABIT_ICONS.find((i) => i.name === name)?.icon ?? Book;
}

function countCompletions(completions: Record<string, boolean>): number {
  return Object.values(completions).filter(Boolean).length;
}

function getWeekdayLabel(weekdays: number[]): string {
  if (weekdays.length === 7) return 'Every day';
  if (weekdays.length === 0) return 'Never';
  if (weekdays.length === 5 && [0, 1, 2, 3, 4].every((d) => weekdays.includes(d))) return 'Weekdays';
  if (weekdays.length === 2 && [5, 6].every((d) => weekdays.includes(d))) return 'Weekends';
  return weekdays.map((d) => DAY_NAMES[d]).join(', ');
}

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  isClosing?: boolean;
}

export default function HabitDetailModal({ habit, onClose, onUpdate, onDelete, isClosing }: HabitDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [color, setColor] = useState(habit.color);
  const [weekdays, setWeekdays] = useState<number[]>(habit.weekdays);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => nameRef.current?.focus(), 100);
  }, [editing]);

  function startEdit() {
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    setWeekdays(habit.weekdays);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdate(habit.id, { name: trimmed, icon, color, weekdays, updatedAt: Date.now() });
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal detail-modal${isClosing ? ' closing' : ''}`;
  const totalCompletions = countCompletions(habit.completions);

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="detail-top">
          <div className="detail-top-left">
            <div className="habits-detail-icon" style={{ background: `${habit.color}18`, color: habit.color }}>
              {/* eslint-disable-next-line react-hooks/static-components */}
              {(() => { const Ic = getIcon(habit.icon); return <Ic size={22} strokeWidth={1.8} />; })()}
            </div>
            <div className="detail-top-info">
              {editing ? (
                <input
                  ref={nameRef}
                  type="text"
                  className="fm-input habits-detail-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              ) : (
                <h2 className="detail-title">{habit.name}</h2>
              )}
            </div>
          </div>
          <button className="btn-icon detail-close" onClick={onClose}>
            <CloseCircle size={22} />
          </button>
        </div>

        <div className="detail-divider" />

        {editing ? (
          <div className="habits-detail-edit">
            <div className="fm-field">
              <label className="fm-label">Icon</label>
              <div className="habits-icon-picker">
                {HABIT_ICONS.map((item) => {
                  const Ic = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`habits-icon-btn${icon === item.name ? ' selected' : ''}`}
                      style={icon === item.name ? { background: `${color}18`, color, borderColor: `${color}40` } : undefined}
                      onClick={() => setIcon(item.name)}
                    >
                      <Ic size={18} strokeWidth={1.8} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="fm-field">
              <label className="fm-label">Color</label>
              <div className="habits-color-picker">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`habits-color-btn${color === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="fm-field">
              <label className="fm-label">Repeat on</label>
              <div className="habits-weekday-picker">
                {DAY_NAMES.map((dayName, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`habits-weekday-btn${weekdays.includes(i) ? ' selected' : ''}`}
                    onClick={() => {
                      setWeekdays((prev) =>
                        prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
                      );
                    }}
                  >
                    <span className="habits-weekday-letter">{dayName.charAt(0)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-meta">
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <img src="/icons/streak.svg" alt="" width="14" height="14" />
                Streak
              </span>
              <span className="detail-meta-value habits-detail-streak">{habit.streak} days</span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <Fire size={14} />
                Total completions
              </span>
              <span className="detail-meta-value">{totalCompletions}</span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                Repeat
              </span>
              <span className="detail-meta-value">{getWeekdayLabel(habit.weekdays)}</span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                Created
              </span>
              <span className="detail-meta-value">{formatDate(habit.createdAt)}</span>
            </div>

            {habit.updatedAt !== habit.createdAt && (
              <div className="detail-meta-row">
                <span className="detail-meta-label">
                  <PenNewRound size={14} />
                  Updated
                </span>
                <span className="detail-meta-value">{formatDate(habit.updatedAt)}</span>
              </div>
            )}
          </div>
        )}

        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={!name.trim()}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-danger-outline" onClick={() => { onDelete(habit.id); onClose(); }}>
                Delete
              </button>
              <button className="btn btn-primary" onClick={startEdit}>
                <PenNewRound size={16} />
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
