import { ClipboardCheck, CalendarMinimalistic, Bell, SettingsMinimalistic } from '@solar-icons/react';

const navItems = [
  { icon: ClipboardCheck, label: 'Tasks', active: true },
  { icon: CalendarMinimalistic, label: 'Calendar', active: false },
  { icon: Bell, label: 'Notifications', active: false },
  { icon: SettingsMinimalistic, label: 'Settings', active: false },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.svg" alt="CuTasks" className="sidebar-logo-img" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar-nav-btn ${item.active ? 'active' : ''}`}
            disabled={!item.active}
          >
            <item.icon size={22} strokeWidth={1.8} />
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
