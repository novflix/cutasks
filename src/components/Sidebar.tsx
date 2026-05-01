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
      {/* ── Desktop sidebar (left) ── */}
      <aside
        className="hidden sm:flex flex-col"
        style={{
          width: '72px',
          minHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--bg-card)',
          borderRight: '1.5px solid var(--border)',
          zIndex: 30,
          padding: '20px 0',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: '24px',
            filter: dark ? 'none' : 'invert(1) brightness(0.22) sepia(0.15)',
            opacity: 0.9,
          }}
        >
          <img src={logoMini} alt="CuTasks" style={{ width: '28px', height: '28px' }} draggable={false} />
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, alignItems: 'center' }}>
          {NAV.map(({ page, label, Icon }) => {
            const active = current === page;
            return (
              <button
                key={page}
                onClick={() => onChange(page)}
                title={label}
                aria-label={label}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  background: active ? 'var(--bg-panel)' : 'transparent',
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                  transition: 'background 0.18s ease, color 0.18s ease, transform 0.14s cubic-bezier(0.23,1,0.32,1)',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
                onMouseDown={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)';
                }}
                onMouseUp={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)';
                }}
              >
                {/* Active indicator pill */}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '-1px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '20px',
                      borderRadius: '0 3px 3px 0',
                      background: 'var(--accent)',
                    }}
                  />
                )}
                <Icon size={20} />
                <span style={{
                  fontSize: '9px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile bottom navbar ── */}
      <nav
        className="sm:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'var(--bg-card)',
          borderTop: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'stretch',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map(({ page, label, Icon }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onChange(page)}
              aria-label={label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '10px 0 8px',
                border: 'none',
                background: 'transparent',
                color: active ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.18s ease',
                position: 'relative',
              }}
            >
              {/* Top indicator line */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
                  width: '24px',
                  height: '2px',
                  borderRadius: '0 0 2px 2px',
                  background: 'var(--accent)',
                  transition: 'transform 0.22s cubic-bezier(0.23,1,0.32,1)',
                }}
              />

              {/* Icon wrapper with active bg pill */}
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

              <span style={{
                fontSize: '10px',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: active ? 600 : 400,
                transition: 'font-weight 0.15s ease',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};