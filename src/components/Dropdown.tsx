import React, { useEffect, useRef } from 'react';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  separator?: boolean;
}

interface Props {
  items: DropdownItem[];
  onClose: () => void;
  /** Alignment relative to trigger: defaults to 'right' */
  align?: 'left' | 'right';
  /** Additional top offset in px, defaults to 8 */
  offsetTop?: number;
}

/**
 * Dropdown — shared absolutely-positioned panel for context menus and pickers.
 *
 * Usage: wrap trigger + Dropdown in a `position: relative` container.
 *
 * Provides:
 *  - consistent z-index (z-50), border-radius, shadow
 *  - close on outside click or Escape
 *  - optional destructive (red) items
 *  - optional separator between groups
 */
export const Dropdown: React.FC<Props> = ({
  items,
  onClose,
  align = 'right',
  offsetTop = 8,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouse);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouse);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 rounded-2xl p-1.5 shadow-cozy animate-fade-in"
      style={{
        top: `calc(100% + ${offsetTop}px)`,
        [align === 'right' ? 'right' : 'left']: 0,
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        minWidth: '160px',
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.separator && i > 0 && (
            <div
              style={{
                height: '1px',
                background: 'var(--border)',
                margin: '4px 6px',
              }}
            />
          )}
          <button
            onClick={() => { item.onClick(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body text-left transition-all hover:opacity-90 active:scale-95"
            style={{
              color: item.destructive ? '#c45a69' : 'var(--text-main)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = item.destructive
                ? 'rgba(196,90,105,0.08)'
                : 'var(--bg-panel)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            {item.icon && (
              <span style={{ flexShrink: 0, opacity: 0.8 }}>{item.icon}</span>
            )}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
