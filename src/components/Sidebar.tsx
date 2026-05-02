import React from 'react';
import { LogoSVG } from './LogoSVG';
import { ClipboardList, CalendarMinimalistic, Settings, FolderOpen } from '@solar-icons/react';

export type Page = 'tasks' | 'calendar' | 'projects' | 'settings';

interface NavItem {
  page: Page;
  label: string;
  Icon: React.FC<{ size?: number }>;
}

const NAV: NavItem[] = [
  { page: 'tasks',    label: 'Tasks',    Icon: ClipboardList },
  { page: 'calendar', label: 'Calendar', Icon: CalendarMinimalistic },
  { page: 'projects', label: 'Projects', Icon: FolderOpen },
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
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <LogoSVG dark={dark} />
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {NAV.map(({ page, label, Icon }) => {
            const active = current === page;
            return (
              <button
                key={page}
                onClick={() => onChange(page)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`sidebar-nav-btn${active ? ' active' : ''}`}
              >
                <span className="sidebar-nav-icon">
                  <Icon size={18} />
                </span>
                <span className="sidebar-nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

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