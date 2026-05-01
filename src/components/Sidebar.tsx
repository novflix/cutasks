import React from 'react';
import { ClipboardList, CalendarMinimalistic, Settings } from '@solar-icons/react';
import logoMini from '../assets/logo-mini.svg';

export type Page = 'tasks' | 'calendar' | 'settings';

interface NavItem {
  page: Page;
  label: string;
  Icon: React.FC<{ size?: number }>;
}

const NAV: NavItem[] = [
  { page: 'tasks',    label: 'Tasks',    Icon: ClipboardList },
  { page: 'calendar', label: 'Calendar', Icon: CalendarMinimalistic },
  { page: 'settings', label: 'Settings', Icon: Settings },
];

interface Props {
  current: Page;
  onChange: (p: Page) => void;
  dark: boolean;
}

export const Sidebar: React.FC<Props> = ({ current, onChange, dark }) => {
  return (
    <>
      {/* ── Desktop sidebar — виден только на sm+ через CSS класс ── */}
      <aside className="sidebar-desktop">
        {/* Logo */}
        <div
          style={{
            marginBottom: '24px',
            filter: dark ? 'none' : 'invert(1) brightness(0.22) sepia(0.15)',
          }}
        >
          <img src={logoMini} alt="CuTasks" style={{ width: '28px', height: '28px' }} draggable={false} />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          {NAV.map(({ page, label, Icon }) => {
            const active = current === page;
            return (
              <button
                key={page}
                onClick={() => onChange(page)}
                title={label}
                aria-label={label}
                className="sidebar-nav-btn"
                style={{
                  background: active ? 'var(--bg-panel)' : 'transparent',
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)'; }}
              >
                {active && <span className="sidebar-active-pill" />}
                <Icon size={20} />
                <span style={{ fontSize: '9px', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile bottom navbar — виден только на <sm через CSS класс ── */}
      <nav className="bottom-navbar">
        {NAV.map(({ page, label, Icon }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onChange(page)}
              aria-label={label}
              className="bottom-nav-btn"
              style={{ color: active ? 'var(--text-main)' : 'var(--text-muted)' }}
            >
              <span
                className="bottom-nav-indicator"
                style={{ transform: `translateX(-50%) scaleX(${active ? 1 : 0})` }}
              />
              <span
                style={{
                  width: '36px',
                  height: '24px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active ? 'var(--bg-panel)' : 'transparent',
                  transition: 'background 0.18s ease',
                }}
              >
                <Icon size={18} />
              </span>
              <span style={{ fontSize: '10px', fontFamily: '"DM Sans", sans-serif', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};