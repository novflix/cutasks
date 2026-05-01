import React, { useEffect, useRef, useState } from 'react';
import { CalendarMinimalistic, AltArrowLeft, AltArrowRight, CloseCircle } from '@solar-icons/react';

interface Props {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (val: string) => void;
  min?: string;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDisplay(s: string): string {
  const d = parseDate(s);
  if (!d) return '';
  const now = new Date(); now.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === 2) return 'In 2 days';
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export const DatePicker: React.FC<Props> = ({ value, onChange, min }) => {
  const [open, setOpen] = useState(false);
  const today = new Date(); today.setHours(0,0,0,0);
  const minDate = min ? parseDate(min) : today;

  const selected = parseDate(value);
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const d = selected ?? today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Build calendar grid (Mon-first)
  const firstDay = new Date(view.year, view.month, 1);
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  };
  const nextMonth = () => {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  };

  const selectDay = (day: number) => {
    const d = new Date(view.year, view.month, day);
    onChange(toYMD(d));
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const d = new Date(view.year, view.month, day);
    return d < minDate;
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return selected.getFullYear() === view.year &&
           selected.getMonth() === view.month &&
           selected.getDate() === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === view.year &&
    today.getMonth() === view.month &&
    today.getDate() === day;

  const displayLabel = formatDisplay(value);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '14px',
          fontSize: '0.875rem',
          border: `1.5px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--bg-card)',
          color: value ? 'var(--text-main)' : 'var(--text-muted)',
          fontFamily: '"DM Sans", sans-serif',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(201,144,58,0.15)' : 'none',
          textAlign: 'left',
        }}
      >
        <CalendarMinimalistic size={16} style={{ color: value ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ flex: 1, opacity: value ? 1 : 0.6 }}>
          {displayLabel || 'Pick a date...'}
        </span>
        {value && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(''); }}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <CloseCircle size={15} />
          </span>
        )}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            boxShadow: '0 8px 40px rgba(80,55,30,0.15), 0 2px 10px rgba(80,55,30,0.08)',
            padding: '16px',
            animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                width: '30px', height: '30px', borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-panel)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
            >
              <AltArrowLeft size={15} />
            </button>

            <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 500, fontSize: '1rem', color: 'var(--text-main)' }}>
              {MONTHS[view.month]} {view.year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={{
                width: '30px', height: '30px', borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-panel)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
            >
              <AltArrowRight size={15} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DOW.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '0.7rem', fontWeight: 600,
                color: 'var(--text-muted)', padding: '2px 0', letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const disabled = isDisabled(day);
              const sel = isSelected(day);
              const tod = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && selectDay(day)}
                  style={{
                    height: '34px',
                    borderRadius: '10px',
                    border: tod && !sel ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                    background: sel ? 'var(--text-main)' : 'transparent',
                    color: sel
                      ? 'var(--bg-main)'
                      : disabled
                      ? 'var(--border)'
                      : tod
                      ? 'var(--accent)'
                      : 'var(--text-main)',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: sel || tod ? 600 : 400,
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'background 0.12s, color 0.12s, transform 0.1s',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={e => {
                    if (!disabled && !sel) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!sel) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick picks */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Today', days: 0 },
              { label: 'Tomorrow', days: 1 },
              { label: 'In a week', days: 7 },
            ].map(({ label, days }) => {
              const d = new Date(today); d.setDate(d.getDate() + days);
              const ymd = toYMD(d);
              const active = value === ymd;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { onChange(ymd); setOpen(false); }}
                  style={{
                    flex: 1,
                    padding: '5px 4px',
                    borderRadius: '10px',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'rgba(201,144,58,0.12)' : 'var(--bg-panel)',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};