import React from 'react';
import { Sun, Moon, CloudStorm, Logout } from '@solar-icons/react';
import type { Theme } from '../hooks/useTheme';
import { useAuth } from '../context/useAuth';
import { usePomodoroSettings } from '../hooks/usePomodoroSettings';

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

const THEMES: {
  value: Theme;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number }>;
  preview: { bg: string; card: string; text: string; accent: string };
}[] = [
  { value: 'light', label: 'Light',  description: 'Warm cream tones',    Icon: Sun,        preview: { bg: '#fdfaf5', card: '#ffffff', text: '#2d2824', accent: '#ed9b6d' } },
  { value: 'slate', label: 'Slate',  description: 'Neutral dark greys',  Icon: CloudStorm, preview: { bg: '#111111', card: '#1c1c1c', text: '#e4e4e4', accent: '#ed9b6d' } },
  { value: 'dark',  label: 'Mocha',  description: 'Warm dark browns',    Icon: Moon,       preview: { bg: '#1a1614', card: '#2d2824', text: '#f4e8d0', accent: '#ed9b6d' } },
];

const ThemePreview: React.FC<{ colors: (typeof THEMES)[0]['preview']; active: boolean }> = ({ colors, active }) => (
  <div style={{ width: '100%', height: '54px', borderRadius: '10px', background: colors.bg, border: active ? `2px solid ${colors.accent}` : '2px solid transparent', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', transition: 'border-color 0.15s', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <div style={{ width: '14px', height: '6px', borderRadius: '3px', background: colors.accent, opacity: 0.9 }} />
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: colors.card, opacity: 0.6 }} />
    </div>
    <div style={{ flex: 1, borderRadius: '5px', background: colors.card, display: 'flex', alignItems: 'center', gap: '4px', padding: '0 5px' }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.accent }} />
      <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: colors.text, opacity: 0.3 }} />
    </div>
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
    {children}
  </p>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    style={{
      width: '40px', height: '22px', borderRadius: '11px', border: 'none',
      background: checked ? 'var(--accent)' : 'var(--border)',
      position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.22s ease',
    }}
  >
    <span style={{
      position: 'absolute', top: '3px', left: checked ? '21px' : '3px',
      width: '16px', height: '16px', borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
    }} />
  </button>
);

const NumberInput: React.FC<{ value: number; min: number; max: number; onChange: (v: number) => void }> = ({ value, min, max, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem', lineHeight: 1 }}
    >−</button>
    <span style={{ minWidth: '28px', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1rem', lineHeight: 1 }}
    >+</button>
  </div>
);

const SettingRow: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
    <div>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-main)' }}>{label}</p>
      {hint && <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{hint}</p>}
    </div>
    {children}
  </div>
);

export const SettingsPage: React.FC<Props> = ({ theme, onThemeChange }) => {
  const { user, logOut } = useAuth();
  const { settings: pomo, update: updatePomo } = usePomodoroSettings();

  const displayName = user?.displayName ?? user?.email ?? 'Пользователь';
  const avatarLetter = user?.displayName?.[0] ?? user?.email?.[0] ?? '?';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', opacity: 0, animation: 'fadeIn 0.22s ease-out forwards' }}>
      <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '24px' }}>
        Settings
      </h1>

      {/* Account */}
      <section style={{ marginBottom: '28px' }}>
        <SectionLabel>Account</SectionLabel>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', flexShrink: 0, textTransform: 'uppercase' }}>
              {avatarLetter}
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            {user?.displayName && user?.email && (
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{user.email}</p>
            )}
          </div>
          <button onClick={() => logOut()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s, border-color 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Logout size={14} /> Log Out
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section style={{ marginBottom: '28px' }}>
        <SectionLabel>Appearance</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {THEMES.map(({ value, label, description, Icon, preview }) => {
            const active = theme === value;
            return (
              <button key={value} onClick={() => onThemeChange(value)}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', borderRadius: '16px', border: active ? '2px solid var(--accent)' : '2px solid var(--border)', background: active ? 'var(--bg-panel)' : 'var(--bg-card)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s, transform 0.12s', transform: active ? 'scale(1.02)' : 'scale(1)', textAlign: 'left' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <ThemePreview colors={preview} active={active} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s', display: 'flex' }}><Icon size={14} /></span>
                  <div>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.8rem', color: active ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.2, transition: 'color 0.15s' }}>{label}</p>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px', lineHeight: 1.2 }}>{description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pomodoro */}
      <section>
        <SectionLabel>Pomodoro</SectionLabel>
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '0 16px' }}>
          <SettingRow label="Show in navigation" hint="Display Pomodoro tab in the sidebar">
            <Toggle checked={pomo.showInNav} onChange={v => updatePomo({ showInNav: v })} />
          </SettingRow>
          <SettingRow label="Auto-start breaks" hint="Automatically begin break after focus">
            <Toggle checked={pomo.autoStartBreaks} onChange={v => updatePomo({ autoStartBreaks: v })} />
          </SettingRow>
          <SettingRow label="Auto-start focus" hint="Automatically begin focus after break">
            <Toggle checked={pomo.autoStartPomodoros} onChange={v => updatePomo({ autoStartPomodoros: v })} />
          </SettingRow>
          <SettingRow label="Focus duration" hint="Minutes">
            <NumberInput value={pomo.workDuration} min={1} max={120} onChange={v => updatePomo({ workDuration: v })} />
          </SettingRow>
          <SettingRow label="Short break" hint="Minutes">
            <NumberInput value={pomo.shortBreak} min={1} max={60} onChange={v => updatePomo({ shortBreak: v })} />
          </SettingRow>
          <SettingRow label="Long break" hint="Minutes">
            <NumberInput value={pomo.longBreak} min={1} max={60} onChange={v => updatePomo({ longBreak: v })} />
          </SettingRow>
          <SettingRow label="Long break interval" hint="Pomodoros before long break">
            <NumberInput value={pomo.longBreakInterval} min={2} max={10} onChange={v => updatePomo({ longBreakInterval: v })} />
          </SettingRow>
        </div>
      </section>
    </div>
  );
};