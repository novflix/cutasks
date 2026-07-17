import { useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { FilterType, Habit } from './types';
import { getDeadlineStatus } from './utils';
import { TaskProvider } from './contexts/TaskContext';
import { useTaskContext } from './hooks/useTaskContext';
import { PomoProvider } from './contexts/PomoContext';
import { usePomoContext } from './hooks/usePomoContext';
import { useUIContext, UIProvider } from './contexts/UIContext';
import { useAuth } from './contexts/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import { usePomodoroTitle } from './hooks/usePomodoroTitle';
import { useUndoShortcut } from './hooks/useUndoShortcut';
import { useHotkeys } from './hooks/useHotkeys';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskDetailModal from './components/TaskDetailModal';
import TaskFormModal from './components/TaskFormModal';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectRoute from './components/ProjectRoute';
import PomoMiniTimer from './components/PomoMiniTimer';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import ConfirmDialog from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import PageSkeleton from './components/skeletons/PageSkeleton';
import MinimalisticMagnifier from '@solar-icons/react/icons/search/MinimalisticMagnifier';
import ArrowLeft from '@solar-icons/react/icons/arrows/ArrowLeft';
import { PROJECT_ICONS } from './constants/projects';
import { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AnimatedRoutes({ routes }: { routes: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Suspense fallback={<div className="page-loader"><div className="auth-spinner" /></div>}>
        {routes}
      </Suspense>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const {
    tasks, projects, projectTasks, habits, sections, dataLoading,
    toggleTask, setSubtaskOf, updateProjectTask, toggleProjectTask,
    reorderProjects, updateSections, updateHabits, undo,
    filter, setFilter, searchQuery, setSearchQuery,
    projectSearch, setProjectSearch, projectTaskFilter, setProjectTaskFilter,
    projectTaskSearch, setProjectTaskSearch,
    filteredTasks, filteredProjects, allTags, allProjectTags,
    projectStats, taskStatsFormatted, taskMap,
    expandProjects, weekStart,
    hotkeyConfig,
    confirmDelete, setConfirmDelete, confirmDeleteTask, confirmDeleteProject, confirmDeleteProjectTask,
  } = useTaskContext();

  const {
    mode: pomoMode, secondsLeft: pomoSeconds, running: pomoRunning,
    completedSessions: pomoSessions, config: pomoConfig, celebrate: pomoCelebrate,
    miniVisible: pomoMiniVisible, miniClosing: pomoMiniClosing,
    toggleRunning: pomoToggleRunning, reset: pomoReset, switchMode: pomoSwitchMode,
    skipSession: pomoSkipSession,
  } = usePomoContext();

  const {
    sidebarWidth, setSidebarWidth,
    showForm, formClosing, editingTask,
    title, setTitle, description, setDescription, priority, setPriority,
    deadline, setDeadline, tags, setTags, parentId, setParentId,
    openCreateForm, openEditForm, closeForm, handleSubmit,
    viewingTask, setViewingTask, detailClosing, closeDetail, handleViewTaskEdit, deleteTaskConfirm,
    showProjectForm, projectFormClosing, editingProject,
    projectName, setProjectName, projectDesc, setProjectDesc,
    projectIcon, setProjectIcon, projectColor, setProjectColor,
    projectStatus, setProjectStatus,
    openCreateProject, openEditProject, closeProjectForm, handleProjectSubmit, deleteProjectConfirm, openProject,
    showProjectTaskForm, projectTaskFormClosing, editingProjectTask,
    ptTitle, setPtTitle, ptDescription, setPtDescription, ptPriority, setPtPriority,
    ptDeadline, setPtDeadline, ptTags, setPtTags, ptParentId, setPtParentId,
    openCreateProjectTask, openEditProjectTask, closeProjectTaskForm, handleProjectTaskSubmit,
    viewingProjectTask, setViewingProjectTask, projectTaskDetailClosing, closeProjectTaskDetail, handleViewProjectTaskEdit, deleteProjectTaskConfirm,
    createTaskFromSearch, createProjectFromSearch, createProjectTaskFromSearch,
    handleCreate, handleCalendarViewTask,
    activePage, activeProjectId, activeProject,
    habitFormOpenerRef,
  } = useUIContext();

  useNotifications(user, dataLoading, tasks, projectTasks, habits);
  usePomodoroTitle(pomoRunning, pomoSeconds, pomoMode);
  useUndoShortcut(undo);

  const closeTopModal = useCallback(() => {
    if (confirmDelete) { setConfirmDelete(null); return; }
    if (showForm) { closeForm(); return; }
    if (showProjectForm) { closeProjectForm(); return; }
    if (showProjectTaskForm) { closeProjectTaskForm(); return; }
    if (viewingTask) { closeDetail(); return; }
    if (viewingProjectTask) { closeProjectTaskDetail(); return; }
  }, [
    confirmDelete, setConfirmDelete,
    showForm, closeForm,
    showProjectForm, closeProjectForm,
    showProjectTaskForm, closeProjectTaskForm,
    viewingTask, closeDetail,
    viewingProjectTask, closeProjectTaskDetail,
  ]);

  useHotkeys({
    hotkeyConfig,
    createTask: openCreateForm,
    createProject: openCreateProject,
    createHabit: () => habitFormOpenerRef.current?.(),
    togglePomodoro: pomoToggleRunning,
    closeTopModal,
    sidebarWidth,
    setSidebarWidth,
  });

  const activeProjectTasks = useMemo(
    () => activeProject ? projectTasks.filter((t) => t.projectId === activeProject.id) : [],
    [projectTasks, activeProject]
  );

  const filteredProjectTasks = useMemo(() => {
    let result = activeProjectTasks;
    if (projectTaskFilter === 'active') result = result.filter((t) => !t.completed);
    if (projectTaskFilter === 'completed') result = result.filter((t) => t.completed);
    if (projectTaskSearch.trim()) {
      const q = projectTaskSearch.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = { high: 0, medium: 1, low: 2 }[a.priority];
      const pb = { high: 0, medium: 1, low: 2 }[b.priority];
      return pa - pb;
    });
  }, [activeProjectTasks, projectTaskFilter, projectTaskSearch]);

  const projectTaskStats = useMemo(() => {
    if (!activeProject) return [];
    const total = activeProjectTasks.length;
    const active = activeProjectTasks.filter((t) => !t.completed).length;
    const done = activeProjectTasks.filter((t) => t.completed).length;
    const overdue = activeProjectTasks.filter((t) => !t.completed && getDeadlineStatus(t.deadline, t.completed) === 'overdue').length;
    return [
      { label: t('common.total'), value: total },
      { label: t('common.active'), value: active, color: activeProject.color },
      { label: t('common.done'), value: done, color: '#66bb6a' },
      ...(overdue > 0 ? [{ label: t('common.overdue'), value: overdue, color: '#ef5350' }] : []),
    ];
  }, [activeProjectTasks, activeProject, t]);

  const activeViewingTask = useMemo(
    () => (viewingTask ? tasks.find((t) => t.id === viewingTask.id) ?? null : null),
    [tasks, viewingTask]
  );

  const activeViewingProjectTask = useMemo(
    () => (viewingProjectTask ? projectTasks.find((t) => t.id === viewingProjectTask.id) ?? null : null),
    [projectTasks, viewingProjectTask]
  );

  const sidebarNavigate = useCallback((p: 'home' | 'tasks' | 'projects' | 'settings' | 'project-detail') => {
    if (p === 'home') navigate('/app/home');
    else if (p === 'tasks') navigate('/app/tasks');
    else if (p === 'projects') navigate('/app/projects');
    else if (p === 'settings') navigate('/app/settings');
  }, [navigate]);

  const handleHabitsChange = useCallback((updater: Habit[] | ((prev: Habit[]) => Habit[])) => {
    updateHabits(updater);
  }, [updateHabits]);

  const handleOpenProject = useCallback((id: string) => {
    navigate(`/app/projects/${id}`);
  }, [navigate]);

  return (
    <div className="app" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      <Sidebar
        width={sidebarWidth}
        onResize={setSidebarWidth}
        activePage={activePage}
        onNavigate={sidebarNavigate}
        projects={projects}
        expandProjects={expandProjects}
        activeProjectId={activeProjectId}
        onOpenProject={handleOpenProject}
      />
      <div className="app-content">
        <ErrorBoundary>
        {dataLoading ? (
          <main className="main">
            <PageSkeleton pathname={location.pathname} />
          </main>
        ) : (
        <AnimatedRoutes
          routes={
            <Routes>
              <Route path="/home" element={
                <ProtectedRoute>
                  <main className="main">
                    <HomePage tasks={tasks} projects={projects} habits={habits} projectTasks={projectTasks} />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/habits" element={
                <ProtectedRoute>
                  <main className="main">
                    <HabitsPage habits={habits} onHabitsChange={handleHabitsChange} weekStartDay={weekStart} formOpenerRef={habitFormOpenerRef} />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/pomodoro" element={
                <ProtectedRoute>
                  <main className="main">
                    <PomodoroPage
                      mode={pomoMode} secondsLeft={pomoSeconds} running={pomoRunning}
                      completedSessions={pomoSessions} config={pomoConfig} celebrate={pomoCelebrate}
                      onToggleRunning={pomoToggleRunning} onReset={pomoReset}
                      onSwitchMode={pomoSwitchMode} onSkipSession={pomoSkipSession}
                    />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <main className="main">
                    <CalendarPage tasks={tasks} projectTasks={projectTasks} weekStartDay={weekStart} onViewTask={handleCalendarViewTask} />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/templates" element={
                <ProtectedRoute>
                  <main className="main">
                    <TemplatesPage />
                  </main>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <TasksPage
                    stats={taskStatsFormatted} tasks={filteredTasks} taskMap={taskMap}
                    filter={filter} searchQuery={searchQuery}
                    onSearch={setSearchQuery} onFilter={setFilter}
                    onCreate={openCreateForm} onCreateFromSearch={createTaskFromSearch}
                    onToggle={toggleTask} onView={setViewingTask}
                    onEdit={openEditForm} onDelete={deleteTaskConfirm}
                    onSetSubtask={setSubtaskOf}
                  />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                <>
                  <div className="page-hero">
                    <h1 className="page-hero-title">{t('projects.title')}</h1>
                  </div>
                  <div className="sticky-top">
                  <Header stats={projectStats} onCreate={openCreateProject} createLabel={t('projects.newProject')} />
                  <div className="toolbar">
                    <div className="search-box">
                      <MinimalisticMagnifier size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder={projectSearch.trim() && filteredProjects.length === 0 ? t('components.toolbar.pressEnter') : t('projects.searchProjects')}
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && projectSearch.trim() && filteredProjects.length === 0) {
                            createProjectFromSearch(projectSearch.trim());
                          }
                        }}
                        className="search-input"
                      />
                    </div>
                  </div>
                  </div>
                  <main className="main">
                    <ProjectsPage
                      projects={filteredProjects} projectTasks={projectTasks}
                      searchQuery={projectSearch} onEdit={openEditProject}
                      onDelete={deleteProjectConfirm} onOpen={openProject}
                      onReorder={reorderProjects}
                    />
                  </main>
                </>
                </ProtectedRoute>
              } />
              <Route path="/projects/:projectId" element={
                <ProtectedRoute>
                <ProjectRoute
                  projects={projects}
                  fallback={
                    <main className="main">
                      <div className="empty">
                        <p className="empty-title">{t('projects.projectNotFound')}</p>
                        <button className="btn btn-primary" onClick={() => navigate('/app/projects')}>{t('projects.backToProjects')}</button>
                      </div>
                    </main>
                  }
                >
                  {(project) => (
                    <>
                      <div className="project-detail-header">
                        <button className="btn-icon project-back-btn" onClick={() => navigate('/app/projects')} aria-label={t('projects.backToProjects')}>
                          <ArrowLeft size={22} />
                        </button>
                        <div className="project-detail-icon" style={{ background: `${project.color}15`, color: project.color }}>
                          {(() => {
                            const Icon = PROJECT_ICONS.find((i) => i.name === project.icon)?.icon ?? PROJECT_ICONS[0].icon;
                            return <Icon size={24} strokeWidth={1.8} />;
                          })()}
                        </div>
                        <div className="project-detail-info">
                          <h1 className="project-detail-name" style={{ color: project.color }}>{project.name}</h1>
                          {project.description && <p className="project-detail-desc">{project.description}</p>}
                        </div>
                      </div>
                      <div className="sticky-top">
                      <Header stats={projectTaskStats} onCreate={() => openCreateProjectTask(null)} createLabel={t('tasks.newTask')} />
                      <div className="toolbar">
                        <div className="search-box">
                          <MinimalisticMagnifier size={18} className="search-icon" />
                          <input
                            type="text"
                            placeholder={projectTaskSearch.trim() && filteredProjectTasks.length === 0 ? t('components.toolbar.pressEnter') : t('tasks.searchTasks')}
                            value={projectTaskSearch}
                            onChange={(e) => setProjectTaskSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && projectTaskSearch.trim() && filteredProjectTasks.length === 0) {
                                createProjectTaskFromSearch(projectTaskSearch.trim());
                              }
                            }}
                            className="search-input"
                          />
                        </div>
                        <div className="filters">
                          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                            <button
                              key={f}
                              className={`filter-btn ${projectTaskFilter === f ? 'active' : ''}`}
                              onClick={() => setProjectTaskFilter(f)}
                            >
                              {f === 'all' ? t('common.all') : f === 'active' ? t('common.active') : t('common.done')}
                            </button>
                          ))}
                        </div>
                      </div>
                      </div>
                      <main className="main">
                        <ProjectDetailPage
                          project={project} sections={sections}
                          tasks={filteredProjectTasks} searchQuery={projectTaskSearch}
                          onCreateTask={openCreateProjectTask} onEditTask={openEditProjectTask}
                          onDeleteTask={deleteProjectTaskConfirm} onToggleTask={toggleProjectTask}
                          onViewTask={setViewingProjectTask} onUpdateTask={updateProjectTask}
                          onSaveSections={updateSections}
                        />
                      </main>
                    </>
                  )}
                </ProjectRoute>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                <main className="main">
                  <SettingsPage />
                </main>
                </ProtectedRoute>
              } />
              <Route path="/not-found" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          }
        />
        )}
        </ErrorBoundary>
      </div>

      {activeViewingTask && (
        <TaskDetailModal
          task={activeViewingTask} tasks={tasks}
          onClose={closeDetail} onEdit={handleViewTaskEdit}
          onToggle={toggleTask} isClosing={detailClosing}
        />
      )}

      {activeViewingProjectTask && (
        <TaskDetailModal
          task={activeViewingProjectTask} tasks={projectTasks}
          onClose={closeProjectTaskDetail} onEdit={handleViewProjectTaskEdit}
          onToggle={toggleProjectTask} isClosing={projectTaskDetailClosing}
        />
      )}

      {(showForm || formClosing) && (
        <TaskFormModal
          editingTask={editingTask} title={title} description={description}
          priority={priority} deadline={deadline} tags={tags} parentId={parentId}
          allTags={allTags} allTasks={tasks}
          onTitleChange={setTitle} onDescChange={setDescription}
          onPriorityChange={setPriority} onDeadlineChange={setDeadline}
          onTagsChange={setTags} onParentChange={setParentId}
          onSubmit={handleSubmit} onClose={closeForm} isClosing={formClosing}
        />
      )}

      {(showProjectTaskForm || projectTaskFormClosing) && (
        <TaskFormModal
          editingTask={editingProjectTask} title={ptTitle} description={ptDescription}
          priority={ptPriority} deadline={ptDeadline} tags={ptTags} parentId={ptParentId}
          allTags={allProjectTags} allTasks={projectTasks}
          onTitleChange={setPtTitle} onDescChange={setPtDescription}
          onPriorityChange={setPtPriority} onDeadlineChange={setPtDeadline}
          onTagsChange={setPtTags} onParentChange={setPtParentId}
          onSubmit={handleProjectTaskSubmit} onClose={closeProjectTaskForm} isClosing={projectTaskFormClosing}
        />
      )}

      {(showProjectForm || projectFormClosing) && (
        <ProjectFormModal
          editingProject={editingProject} name={projectName} description={projectDesc}
          icon={projectIcon} color={projectColor} status={projectStatus}
          onNameChange={setProjectName} onDescChange={setProjectDesc}
          onIconChange={setProjectIcon} onColorChange={setProjectColor}
          onStatusChange={setProjectStatus} onSubmit={handleProjectSubmit}
          onClose={closeProjectForm} isClosing={projectFormClosing}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === 'task' ? t('confirm.deleteTask') : t('confirm.deleteProject')}
          message={confirmDelete.type === 'task' ? t('confirm.deleteTaskMessage', { title: confirmDelete.title }) : t('confirm.deleteProjectMessage', { title: confirmDelete.title })}
          onConfirm={() => {
            if (confirmDelete.type === 'task') {
              if (projectTasks.find((t) => t.id === confirmDelete.id)) {
                confirmDeleteProjectTask(confirmDelete.id);
              } else {
                confirmDeleteTask(confirmDelete.id);
              }
            } else {
              confirmDeleteProject(confirmDelete.id);
            }
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      <MobileNav
        activePage={activePage} onNavigate={sidebarNavigate} onCreate={handleCreate}
        miniTimer={(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/app/pomodoro' ? (
          <div className={pomoMiniClosing ? 'pomo-mini-exit' : ''}>
            <PomoMiniTimer mode={pomoMode} secondsLeft={pomoSeconds} running={pomoRunning} onToggleRunning={pomoToggleRunning} />
          </div>
        ) : undefined}
      />

      {(pomoMiniVisible || pomoMiniClosing) && location.pathname !== '/app/pomodoro' && (
        <div className={`pomo-mini-desktop-only${pomoMiniClosing ? ' pomo-mini-exit' : ''}`}>
          <PomoMiniTimer mode={pomoMode} secondsLeft={pomoSeconds} running={pomoRunning} onToggleRunning={pomoToggleRunning} />
        </div>
      )}
    </div>
  );
}

export default function AppInner() {
  return (
    <TaskProvider>
      <PomoProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </PomoProvider>
    </TaskProvider>
  );
}
