import { useRef, useCallback, useEffect } from 'react';
import { ClipboardCheck, CalendarMinimalistic, Bell, SettingsMinimalistic } from '@solar-icons/react';

const MIN_WIDTH = 64;
const MAX_WIDTH = 220;
const COLLAPSE_THRESHOLD = 100;

const navItems = [
  { icon: ClipboardCheck, label: 'Tasks', active: true },
  { icon: CalendarMinimalistic, label: 'Calendar', active: false },
  { icon: Bell, label: 'Notifications', active: false },
  { icon: SettingsMinimalistic, label: 'Settings', active: false },
];

interface SidebarProps {
  width: number;
  onResize: (width: number) => void;
}

export default function Sidebar({ width, onResize }: SidebarProps) {
  const collapsed = width < COLLAPSE_THRESHOLD;
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.round(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth.current + delta)));
      onResize(next);
    }

    function handleMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} style={{ width }}>
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

      <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
    </aside>
  );
}
