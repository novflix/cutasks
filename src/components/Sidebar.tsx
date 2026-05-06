import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogoSVG } from './LogoSVG';
import { ClipboardList, CalendarMinimalistic, Settings, FolderOpen, Logout } from '@solar-icons/react';
import { useAuth } from '../context/useAuth';
import { usePomodoroSettings } from '../hooks/usePomodoroSettings';

const TimerIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5" />
    <path d="M9.5 2.5h5" />
    <path d="M12 2.5V5" />
  </svg>
);

interface NavItemDef {
  path: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
  pomodoro?: boolean;
}

const BASE_NAV: NavItemDef[] = [
  { path: '/tasks',    label: 'Tasks',    Icon: ClipboardList },
  { path: '/calendar', label: 'Calendar', Icon: CalendarMinimalistic },
  { path: '/projects', label: 'Projects', Icon: FolderOpen },
  { path: '/pomodoro', label: 'Pomodoro', Icon: TimerIcon, pomodoro: true },
  { path: '/settings', label: 'Settings', Icon: Settings },
];

interface Props {
  currentPath: string;
  dark: boolean;
}

export const Sidebar: React.FC<Props> = ({ dark }) => {
  const { user, logOut } = useAuth();
  const { settings } = usePomodoroSettings();
  const [loggingOut, setLoggingOut] = useState(false);

  const NAV = BASE_NAV.filter(item => !item.pomodoro || settings.showInNav);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logOut(); } finally { setLoggingOut(false); }
  };

  const avatarLetter = user?.displayName?.[0] ?? user?.email?.[0] ?? '?';
  const displayName = user?.displayName ?? user?.email ?? '';

  return (
    <>
      <aside className="sidebar-desktop">
        <div className="sidebar-logo"><LogoSVG dark={dark} /></div>
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
              <span className="sidebar-nav-icon"><Icon size={18} /></span>
              <span className="sidebar-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '12px', marginBottom: '4px' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', flexShrink: 0, textTransform: 'uppercase' }}>
                {avatarLetter}
              </div>
            )}
            <span style={{ fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={displayName}>
              {displayName}
            </span>
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '12px', border: 'none', background: 'none', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: loggingOut ? 'not-allowed' : 'pointer', opacity: loggingOut ? 0.5 : 1, transition: 'background 0.15s, color 0.15s', textAlign: 'left' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-panel)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Logout size={16} />
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </aside>

      <nav className="bottom-navbar">
        {NAV.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            aria-label={label}
            style={({ isActive: active }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              color: active || (path === '/projects' && window.location.pathname.startsWith('/projects')) ? 'var(--text-main)' : 'var(--text-muted)',
              textDecoration: 'none',
            })}
            className="bottom-nav-btn"
          >
            {({ isActive: active }) => {
              const on = active || (path === '/projects' && window.location.pathname.startsWith('/projects'));
              return (
                <>
                  <span className="bottom-nav-indicator" style={{ transform: `translateX(-50%) scaleX(${on ? 1 : 0})` }} />
                  <span style={{ width: '36px', height: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--bg-panel)' : 'transparent', transition: 'background 0.18s ease' }}>
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