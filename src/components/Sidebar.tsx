import { useRef, useCallback, useEffect } from 'react';
import { ClipboardCheck, Folder, SettingsMinimalistic, HomeSmile } from '@solar-icons/react';
import type { Page } from '../types';
import Logo from './Logo';

const MIN_WIDTH = 64;
const MAX_WIDTH = 220;
const COLLAPSE_THRESHOLD = 100;

interface NavItem {
  icon: typeof ClipboardCheck;
  label: string;
  page: Page;
}

const navItems: NavItem[] = [
  { icon: HomeSmile, label: 'Home', page: 'home' },
  { icon: ClipboardCheck, label: 'Tasks', page: 'tasks' },
  { icon: Folder, label: 'Projects', page: 'projects' },
  { icon: SettingsMinimalistic, label: 'Settings', page: 'settings' },
];

interface SidebarProps {
  width: number;
  onResize: (width: number) => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ width, onResize, activePage, onNavigate }: SidebarProps) {
  const collapsed = width < COLLAPSE_THRESHOLD;
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeBtn = navRef.current.querySelector('.sidebar-nav-btn.active') as HTMLElement;
    if (!activeBtn) {
      indicatorRef.current.style.opacity = '0';
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.top = `${btnRect.top - navRect.top}px`;
    indicatorRef.current.style.height = `${btnRect.height}px`;
    indicatorRef.current.style.opacity = '1';
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [activePage, collapsed, width, updateIndicator]);

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
        <Logo mini={collapsed} className="sidebar-logo-img" />
      </div>

      <nav className="sidebar-nav" ref={navRef}>
        <div className="sidebar-indicator" ref={indicatorRef} />
        {navItems.map((item) => {
          const isActive = item.page === activePage;
          return (
            <button
              key={item.label}
              className={`sidebar-nav-btn${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={() => onNavigate(item.page)}
            >
              <item.icon size={22} strokeWidth={1.8} />
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-resize-handle" onMouseDown={handleMouseDown} />
    </aside>
  );
}
