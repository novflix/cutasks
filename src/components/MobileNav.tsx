import { ClipboardCheck, CalendarMinimalistic, Bell, SettingsMinimalistic, AddCircle } from '@solar-icons/react';

interface MobileNavProps {
  onCreate: () => void;
}

export default function MobileNav({ onCreate }: MobileNavProps) {
  return (
    <div className="mobile-bottom-bar">
      <nav className="mobile-nav">
        <button className="mobile-nav-btn active" aria-label="Tasks">
          <ClipboardCheck size={24} strokeWidth={1.8} />
        </button>
        <button className="mobile-nav-btn" disabled aria-label="Calendar">
          <CalendarMinimalistic size={24} strokeWidth={1.8} />
        </button>
        <button className="mobile-nav-btn" disabled aria-label="Notifications">
          <Bell size={24} strokeWidth={1.8} />
        </button>
        <button className="mobile-nav-btn" disabled aria-label="Settings">
          <SettingsMinimalistic size={24} strokeWidth={1.8} />
        </button>
      </nav>
      <button className="mobile-fab" onClick={onCreate} aria-label="Add task">
        <AddCircle size={30} strokeWidth={1.8} />
      </button>
    </div>
  );
}
