import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { Sidebar, type Page } from './components/Sidebar';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProjectsPage } from './pages/ProjectsPage';

export default function App() {
  const { theme, setTheme, dark } = useTheme();
  const [page, setPage] = useState<Page>('tasks');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Sidebar current={page} onChange={setPage} dark={dark} />

      <main
        style={{ paddingLeft: 0, paddingBottom: '80px' }}
        className="sm:pl-[200px] sm:pb-0"
      >
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
          {page === 'tasks'    && <TasksPage dark={dark} />}
          {page === 'calendar' && <CalendarPage />}
          {page === 'projects' && <ProjectsPage />}
          {page === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} />}
        </div>
      </main>
    </div>
  );
}