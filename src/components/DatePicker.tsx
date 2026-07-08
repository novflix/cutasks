import { useState, useRef, useEffect, useCallback } from 'react';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import ArrowRight from '@solar-icons/react/icons/arrows/ArrowRight';
import { useTranslation } from 'react-i18next';

function getDropdownPosition(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const dropdownHeight = 340;
  const openUp = spaceBelow < dropdownHeight + 16 && rect.top > dropdownHeight;
  return {
    position: 'fixed' as const,
    top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
    left: rect.left,
    zIndex: 1000,
  };
}

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  label?: string;
  id?: string;
}

const WEEKDAY_KEYS = ['common.sunday', 'common.monday', 'common.tuesday', 'common.wednesday', 'common.thursday', 'common.friday', 'common.saturday'];
const MONTH_KEYS = [
  'common.january', 'common.february', 'common.march', 'common.april', 'common.may', 'common.june',
  'common.july', 'common.august', 'common.september', 'common.october', 'common.november', 'common.december',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateDisplay(dateStr: string, locale: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
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
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseDate(value).year);
  const [viewMonth, setViewMonth] = useState(() => parseDate(value).month);
  const ref = useRef<HTMLDivElement>(null);
  const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(open);
  const closingRef = useRef(closing);

  useEffect(() => {
    openRef.current = open;
    closingRef.current = closing;
  });

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

  const toggleOpen = useCallback(() => {
    if (openRef.current) {
      handleClose();
    } else {
      const parsed = parseDate(value);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setOpen(true);
      setClosing(false);
    }
  }, [handleClose, value]);

  function prevMonth() {
    if (min) {
      const minDate = new Date(min + 'T00:00:00');
      const minYear = minDate.getFullYear();
      const minMonth = minDate.getMonth();
      if (viewYear === minYear && viewMonth === minMonth) return;
      if (viewYear < minYear) return;
    }
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
    handleClose();
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    handleClose();
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());
  const minDate = min || '';

  const dropdownClass = `dp-dropdown${closing ? ' closing' : ''}`;
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && ref.current && window.innerWidth > 640) {
      setDropdownStyle(getDropdownPosition(ref.current));
    } else if (open) {
      setDropdownStyle({});
    }
  }, [open]);

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
          {value ? formatDateDisplay(value, i18n.language === 'fr' ? 'fr-FR' : 'en-US') : t('components.datePicker.selectDate')}
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
      {(open || closing) && (
        <div className={dropdownClass} style={dropdownStyle}>
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>
              <ArrowLeft size={16} />
            </button>
            <span className="dp-title">{t(MONTH_KEYS[viewMonth])} {viewYear}</span>
            <button type="button" className="dp-nav" onClick={nextMonth}>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="dp-weekdays">
            {WEEKDAY_KEYS.map((key) => (
              <span key={key} className="dp-weekday">{t(key).charAt(0)}</span>
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
              <button type="button" className="dp-clear" onClick={clearDate}>{t('components.datePicker.clear')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
