import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

export default function App() {
  const { theme, setTheme, dark } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Sidebar currentPath={location.pathname} dark={dark} />

      <main
        style={{ paddingLeft: 0, paddingBottom: '80px' }}
        className="sm:pl-[200px] sm:pb-0"
      >
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
          <Routes>
            <Route path="/"           element={<TasksPage dark={dark} />} />
            <Route path="/calendar"   element={<CalendarPage />} />
            <Route path="/projects"   element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/settings"   element={<SettingsPage theme={theme} onThemeChange={setTheme} />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}