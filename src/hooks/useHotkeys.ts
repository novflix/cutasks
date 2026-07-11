import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HotkeyAction, HotkeyCombo } from '../constants/hotkeys';
import { matchCombo } from '../constants/hotkeys';

interface HotkeyActions {
  hotkeyConfig: Record<HotkeyAction, HotkeyCombo>;
  createTask: () => void;
  createProject: () => void;
  createHabit: () => void;
  togglePomodoro: () => void;
  closeTopModal: () => void;
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
}

export function useHotkeys({
  hotkeyConfig,
  createTask,
  createProject,
  createHabit,
  togglePomodoro,
  closeTopModal,
  sidebarWidth,
  setSidebarWidth,
}: HotkeyActions) {
  const navigate = useNavigate();
  const configRef = useRef(hotkeyConfig);
  configRef.current = hotkeyConfig;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape — close topmost modal (always active, not configurable)
      if (e.key === 'Escape') {
        closeTopModal();
        return;
      }

      // Don't trigger hotkeys when typing in inputs
      if (isInputFocused()) return;

      const config = configRef.current;
      const matchedAction = (Object.keys(config) as HotkeyAction[]).find(
        (action) => matchCombo(e, config[action])
      );

      if (!matchedAction) return;

      e.preventDefault();

      switch (matchedAction) {
        case 'createTask':
          createTask();
          break;
        case 'createProject':
          createProject();
          break;
        case 'createHabit':
          createHabit();
          break;
        case 'togglePomodoro':
          togglePomodoro();
          break;
        case 'focusSearch': {
          const searchInput = document.querySelector('.search-input') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        }
        case 'openCalendar':
          navigate('/app/calendar');
          break;
        case 'toggleSidebar':
          setSidebarWidth(sidebarWidth < 100 ? 220 : 64);
          break;
        case 'goHome':
          navigate('/app/home');
          break;
        case 'goTasks':
          navigate('/app/tasks');
          break;
        case 'goProjects':
          navigate('/app/projects');
          break;
        case 'goSettings':
          navigate('/app/settings');
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    navigate, createTask, createProject, createHabit,
    togglePomodoro, closeTopModal, sidebarWidth, setSidebarWidth,
  ]);
}
