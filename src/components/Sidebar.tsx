import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Folder, SettingsMinimalistic, HomeSmile, AltArrowRight } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Page, Project } from '../types';
import { PROJECT_ICONS } from '../constants/projects';
import Logo from './Logo';

const MIN_WIDTH = 64;
const MAX_WIDTH = 220;
const COLLAPSE_THRESHOLD = 100;
const INDICATOR_HEIGHT = 16;

interface NavItem {
  icon: typeof ClipboardCheck;
  labelKey: string;
  page: Page;
}

const NAV_ITEMS: NavItem[] = [
  { icon: HomeSmile, labelKey: 'nav.home', page: 'home' },
  { icon: ClipboardCheck, labelKey: 'nav.tasks', page: 'tasks' },
  { icon: Folder, labelKey: 'nav.projects', page: 'projects' },
  { icon: SettingsMinimalistic, labelKey: 'nav.settings', page: 'settings' },
];

interface SidebarProps {
  width: number;
  onResize: (width: number) => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
  projects?: Project[];
  expandProjects?: boolean;
  activeProjectId?: string | null;
  onOpenProject?: (id: string) => void;
}

export default function Sidebar({ width, onResize, activePage, onNavigate, projects = [], expandProjects = false, activeProjectId, onOpenProject }: SidebarProps) {
  const { t } = useTranslation();
  const collapsed = width < COLLAPSE_THRESHOLD;
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const showExpandable = expandProjects && !collapsed;

  const navItems = useMemo(() =>
    NAV_ITEMS.map(item => ({ ...item, label: t(item.labelKey) })),
    [t]
  );

  const updateIndicator = useCallback(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeBtn = navRef.current.querySelector('.sidebar-nav-btn.active') as HTMLElement;
    if (!activeBtn) {
      indicatorRef.current.style.opacity = '0';
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const offset = (btnRect.height - INDICATOR_HEIGHT) / 2;
    indicatorRef.current.style.top = `${btnRect.top - navRect.top + offset}px`;
    indicatorRef.current.style.height = `${INDICATOR_HEIGHT}px`;
    indicatorRef.current.style.opacity = '1';
  }, []);

  useEffect(() => {
    updateIndicator();
    function handleResize() {
      requestAnimationFrame(updateIndicator);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePage, collapsed, width, updateIndicator, projectsExpanded]);

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
          const isActive = item.page === activePage || (item.page === 'projects' && activePage === 'project-detail');
          const isProjects = item.page === 'projects';

          if (isProjects && showExpandable) {
            return (
              <div key={item.page} className="sidebar-nav-group">
                <button
                  className={`sidebar-nav-btn${isActive ? ' active' : ''}`}
                  onClick={() => {
                    onNavigate(item.page);
                    setProjectsExpanded((prev) => !prev);
                  }}
                >
                  <item.icon size={22} strokeWidth={1.8} />
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span
                    className={`sidebar-expand-icon${projectsExpanded ? ' expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectsExpanded((prev) => !prev);
                    }}
                  >
                    <AltArrowRight size={14} />
                  </span>
                </button>
                <div
                  className="sidebar-projects-list"
                  style={{
                    maxHeight: projectsExpanded ? `${projects.length * 40 + 8}px` : '0px',
                  }}
                >
                  {projects.map((project) => {
                    const iconDef = PROJECT_ICONS.find((i) => i.name === project.icon) ?? PROJECT_ICONS[0];
                    const Icon = iconDef.icon;
                    const isProjectActive = activeProjectId === project.id;
                    return (
                      <button
                        key={project.id}
                        className={`sidebar-project-item${isProjectActive ? ' active' : ''}`}
                        onClick={() => onOpenProject?.(project.id)}
                        aria-label={project.name}
                        style={{ '--project-color': project.color } as React.CSSProperties}
                      >
                        <Icon size={16} strokeWidth={1.8} />
                        <span className="sidebar-project-name">{project.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.page}
              className={`sidebar-nav-btn${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
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
