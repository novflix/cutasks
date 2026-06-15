import { ClipboardCheck, Folder, Bell, SettingsMinimalistic, AddCircle } from '@solar-icons/react';
import type { Page } from '../types';

interface MobileNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  onCreate?: () => void;
}

export default function MobileNav({ activePage, onNavigate, onCreate }: MobileNavProps) {
  return (
    <div className="mobile-bottom-bar">
      <nav className="mobile-nav">
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
        <button className="mobile-nav-btn" disabled aria-label="Notifications">
          <Bell size={24} strokeWidth={1.8} />
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
  );
}
