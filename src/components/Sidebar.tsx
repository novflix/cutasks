import { ClipboardCheck, CalendarMinimalistic, Bell, SettingsMinimalistic, SidebarMinimalistic } from '@solar-icons/react';

const navItems = [
  { icon: ClipboardCheck, label: 'Tasks', active: true },
  { icon: CalendarMinimalistic, label: 'Calendar', active: false },
  { icon: Bell, label: 'Notifications', active: false },
  { icon: SettingsMinimalistic, label: 'Settings', active: false },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img
          src={collapsed ? '/logo-mini.svg' : '/logo.svg'}
          alt="CuTasks"
          className="sidebar-logo-img"
        />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar-nav-btn ${item.active ? 'active' : ''}`}
            disabled={!item.active}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={22} strokeWidth={1.8} />
            {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <SidebarMinimalistic size={20} strokeWidth={1.8} />
      </button>
    </aside>
  );
}
