import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from '@solar-icons/react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  label?: string;
  id?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(value: string) {
  if (value) {
    const [y, m] = value.split('-').map(Number);
    return { year: y, month: m - 1 };
  }
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

export default function DatePicker({ value, onChange, min, label, id }: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseDate(value).year);
  const [viewMonth, setViewMonth] = useState(() => parseDate(value).month);
  const ref = useRef<HTMLDivElement>(null);

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

  function syncViewFromDate() {
    const parsed = parseDate(value);
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }

  function toggleOpen() {
    if (!open) syncViewFromDate();
    setOpen(!open);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function selectDay(day: number) {
    const dateStr = toDateString(viewYear, viewMonth, day);
    if (min && dateStr < min) return;
    onChange(dateStr);
    setOpen(false);
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());
  const minDate = min || '';

  return (
    <div className="dp" ref={ref}>
      {label && <label className="dp-label" htmlFor={id}>{label}</label>}
      <button
        type="button"
        id={id}
        className={`dp-trigger ${open ? 'dp-trigger-focus' : ''}`}
        onClick={toggleOpen}
      >
        <span className={value ? 'dp-trigger-value' : 'dp-trigger-placeholder'}>
          {value ? formatDateDisplay(value) : 'Select date'}
        </span>
        {value ? (
          <span className="dp-trigger-clear" onClick={clearDate}>&times;</span>
        ) : (
          <svg className="dp-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
      </button>
      {open && (
        <div className="dp-dropdown">
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>
              <ArrowLeft size={16} />
            </button>
            <span className="dp-title">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className="dp-nav" onClick={nextMonth}>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="dp-weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d} className="dp-weekday">{d}</span>
            ))}
          </div>
          <div className="dp-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`empty-${i}`} className="dp-day dp-day-empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toDateString(viewYear, viewMonth, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === value;
              const isDisabled = minDate ? dateStr < minDate : false;
              return (
                <button
                  key={day}
                  type="button"
                  className={`dp-day ${isToday ? 'dp-day-today' : ''} ${isSelected ? 'dp-day-selected' : ''} ${isDisabled ? 'dp-day-disabled' : ''}`}
                  onClick={() => selectDay(day)}
                  disabled={isDisabled}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <div className="dp-footer">
              <button type="button" className="dp-clear" onClick={clearDate}>Clear</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
