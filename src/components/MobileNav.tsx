import { useRef, useCallback, useEffect, type ReactNode } from 'react';
import { ClipboardCheck, Folder, SettingsMinimalistic, AddCircle, HomeSmile } from '@solar-icons/react';
import type { Page } from '../types';

interface MobileNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onCreate?: () => void;
  miniTimer?: ReactNode;
}

export default function MobileNav({ activePage, onNavigate, onCreate, miniTimer }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const activeBtn = navRef.current.querySelector('.mobile-nav-btn.active') as HTMLElement;
    if (!activeBtn) {
      indicatorRef.current.style.opacity = '0';
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.left = `${btnRect.left - navRect.left + btnRect.width / 2 - 2.5}px`;
    indicatorRef.current.style.top = `${btnRect.top - navRect.top + btnRect.height - 7}px`;
    indicatorRef.current.style.opacity = '1';
  }, []);

  useEffect(() => {
    updateIndicator();
    function handleResize() {
      requestAnimationFrame(updateIndicator);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePage, updateIndicator]);

  return (
    <div className="mobile-bottom-bar">
      <div className="mobile-bottom-bar-inner">
        {miniTimer && <div className="pomo-mini-wrap">{miniTimer}</div>}
        <div className="mobile-bottom-bar-row">
          <nav className="mobile-nav" ref={navRef}>
            <div className="mobile-dot-indicator" ref={indicatorRef} />
            <button
              className={`mobile-nav-btn${activePage === 'home' ? ' active' : ''}`}
              onClick={() => onNavigate('home')}
              aria-label="Home"
            >
              <HomeSmile size={24} strokeWidth={1.8} />
            </button>
            <button
              className={`mobile-nav-btn${activePage === 'tasks' ? ' active' : ''}`}
              onClick={() => onNavigate('tasks')}
              aria-label="Tasks"
            >
              <ClipboardCheck size={24} strokeWidth={1.8} />
            </button>
            <button
              className={`mobile-nav-btn${activePage === 'projects' ? ' active' : ''}`}
              onClick={() => onNavigate('projects')}
              aria-label="Projects"
            >
              <Folder size={24} strokeWidth={1.8} />
            </button>
            <button
              className={`mobile-nav-btn${activePage === 'settings' ? ' active' : ''}`}
              onClick={() => onNavigate('settings')}
              aria-label="Settings"
            >
              <SettingsMinimalistic size={24} strokeWidth={1.8} />
            </button>
          </nav>
          <button className="mobile-fab" onClick={onCreate} aria-label={activePage === 'projects' ? 'Add project' : 'Add task'}>
            <AddCircle size={30} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
