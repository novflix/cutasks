import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PomoMode } from '../pages/PomodoroPage';

export function usePomodoroTitle(
  pomoRunning: boolean,
  pomoSeconds: number,
  pomoMode: PomoMode,
) {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (pomoRunning) {
      const m = Math.floor(pomoSeconds / 60);
      const s = pomoSeconds % 60;
      const label = pomoMode === 'work' ? t('pomodoro.focus') : pomoMode === 'short' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak');
      document.title = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — ${label} | CuTasks`;
    } else if (location.pathname !== '/app/pomodoro') {
      document.title = 'CuTasks';
    }
  }, [pomoRunning, pomoSeconds, pomoMode, location.pathname, t]);
}
