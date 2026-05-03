import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogoSVG } from './LogoSVG';
import { ClipboardList, CalendarMinimalistic, Settings, FolderOpen } from '@solar-icons/react';

interface NavItem {
  path: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
}

const NAV: NavItem[] = [
  { path: '/',          label: 'Tasks',    Icon: ClipboardList },
  { path: '/calendar',  label: 'Calendar', Icon: CalendarMinimalistic },
  { path: '/projects',  label: 'Projects', Icon: FolderOpen },
  { path: '/settings',  label: 'Settings', Icon: Settings },
];

interface Props {
  currentPath: string;
  dark: boolean;
}

export const Sidebar: React.FC<Props> = ({ dark }) => {

  return (
    <>
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <LogoSVG dark={dark} />
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {NAV.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              aria-label={label}
              className={({ isActive: active }) =>
                `sidebar-nav-btn${active || (path === '/projects' && window.location.pathname.startsWith('/projects')) ? ' active' : ''}`
              }
            >
              <span className="sidebar-nav-icon">
                <Icon size={18} />
              </span>
              <span className="sidebar-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="bottom-navbar">
        {NAV.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            aria-label={label}
            style={({ isActive: active }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: active || (path === '/projects' && window.location.pathname.startsWith('/projects'))
                ? 'var(--text-main)'
                : 'var(--text-muted)',
              textDecoration: 'none',
            })}
            className="bottom-nav-btn"
          >
            {({ isActive: active }) => {
              const on = active || (path === '/projects' && window.location.pathname.startsWith('/projects'));
              return (
                <>
                  <span
                    className="bottom-nav-indicator"
                    style={{ transform: `translateX(-50%) scaleX(${on ? 1 : 0})` }}
                  />
                  <span
                    style={{
                      width: '36px',
                      height: '24px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: on ? 'var(--bg-panel)' : 'transparent',
                      transition: 'background 0.18s ease',
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: '"DM Sans", sans-serif', fontWeight: on ? 600 : 400 }}>
                    {label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </>
  );
};