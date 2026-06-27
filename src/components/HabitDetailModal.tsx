import { useState, useRef, useEffect } from 'react';
import {
  CloseCircle, PenNewRound, CalendarMinimalistic, Fire, Target,
} from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Habit } from '../types';
import { formatDate } from '../utils';
import { HABIT_ICONS, HABIT_COLORS } from '../constants/habits';

function getIcon(name: string) {
  return HABIT_ICONS.find((i) => i.name === name)?.icon ?? HABIT_ICONS[0].icon;
}

function countCompletions(completions: Record<string, number>): number {
  return Object.values(completions).reduce((sum, v) => sum + v, 0);
}

function getWeekdayLabel(weekdays: number[], t: (key: string) => string): string {
  if (weekdays.length === 7) return t('habits.everyDay');
  if (weekdays.length === 0) return t('habits.never');
  if (weekdays.length === 5 && [0, 1, 2, 3, 4].every((d) => weekdays.includes(d))) return t('habits.weekdays');
  if (weekdays.length === 2 && [5, 6].every((d) => weekdays.includes(d))) return t('habits.weekends');
  const dayKeys = ['common.mon', 'common.tue', 'common.wed', 'common.thu', 'common.fri', 'common.sat', 'common.sun'];
  return weekdays.map((d) => t(dayKeys[d])).join(', ');
}

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  isClosing?: boolean;
}

export default function HabitDetailModal({ habit, onClose, onUpdate, onDelete, isClosing }: HabitDetailModalProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [color, setColor] = useState(habit.color);
  const [weekdays, setWeekdays] = useState<number[]>(habit.weekdays);
  const [targetReps, setTargetReps] = useState(habit.targetReps || 1);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => nameRef.current?.focus(), 100);
  }, [editing]);

  useEffect(() => {
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    setWeekdays(habit.weekdays);
    setTargetReps(habit.targetReps || 1);
  }, [habit]);

  function startEdit() {
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    setWeekdays(habit.weekdays);
    setTargetReps(habit.targetReps || 1);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdate(habit.id, { name: trimmed, icon, color, weekdays, targetReps, updatedAt: Date.now() });
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
            <div className="habits-detail-icon" style={{ background: `${color}18`, color }}>
              {/* eslint-disable-next-line react-hooks/static-components */}
              {(() => { const Ic = getIcon(icon); return <Ic size={22} strokeWidth={1.8} />; })()}
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
                <h2 className="detail-title">{name}</h2>
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
              <label className="fm-label">{t('common.icon')}</label>
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
              <label className="fm-label">{t('common.color')}</label>
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
              <label className="fm-label">{t('habits.repeatOn')}</label>
              <div className="habits-weekday-picker">
                {['common.mon', 'common.tue', 'common.wed', 'common.thu', 'common.fri', 'common.sat', 'common.sun'].map((dayKey, i) => (
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
                    <span className="habits-weekday-letter">{t(dayKey).charAt(0)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fm-field">
              <label className="fm-label">{t('habits.repetitionsPerDay')}</label>
              <div className="habits-reps-input-wrap">
                <button
                  type="button"
                  className="habits-reps-adj"
                  onClick={() => setTargetReps((p) => Math.max(1, p - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={targetReps}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setTargetReps(Math.min(10, Math.max(1, v)));
                  }}
                  className="fm-input habits-reps-input"
                />
                <button
                  type="button"
                  className="habits-reps-adj"
                  onClick={() => setTargetReps((p) => Math.min(10, p + 1))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-meta">
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <img src="/icons/streak.svg" alt="" width="14" height="14" />
                {t('habits.streak')}
              </span>
              <span className="detail-meta-value habits-detail-streak">{habit.streak} {t('habits.days')}</span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <Fire size={14} />
                {t('habits.totalCompletions')}
              </span>
              <span className="detail-meta-value">{totalCompletions}</span>
            </div>

            {targetReps > 1 && (
              <div className="detail-meta-row">
                <span className="detail-meta-label">
                  <Target size={14} />
                  {t('habits.repetitionsPerDay')}
                </span>
                <span className="detail-meta-value">×{targetReps}</span>
              </div>
            )}

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                {t('habits.repeat')}
              </span>
              <span className="detail-meta-value">{getWeekdayLabel(weekdays, t)}</span>
            </div>

            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                {t('common.created')}
              </span>
              <span className="detail-meta-value">{formatDate(habit.createdAt)}</span>
            </div>

            {habit.updatedAt !== habit.createdAt && (
              <div className="detail-meta-row">
                <span className="detail-meta-label">
                  <PenNewRound size={14} />
                  {t('common.updated')}
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
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={!name.trim()}>
                {t('habits.saveChanges')}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-danger-outline" onClick={() => { onDelete(habit.id); onClose(); }}>
                {t('common.delete')}
              </button>
              <button className="btn btn-primary" onClick={startEdit}>
                <PenNewRound size={16} />
                {t('common.edit')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
