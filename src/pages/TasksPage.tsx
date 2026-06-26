import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Toolbar from '../components/Toolbar';
import TaskList from '../components/TaskList';
import type { Task } from '../types';
import type { FilterType } from '../types';

interface TasksPageProps {
  stats: { label: string; value: number; color?: string }[];
  tasks: Task[];
  taskMap: Map<string, Task>;
  filter: FilterType;
  searchQuery: string;
  onSearch: (query: string) => void;
  onFilter: (filter: FilterType) => void;
  onCreate: () => void;
  onCreateFromSearch?: (query: string) => void;
  onToggle: (id: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSetSubtask: (childId: string, parentId: string | null) => void;
}

export default function TasksPage({
  stats, tasks, taskMap, filter, searchQuery,
  onSearch, onFilter, onCreate, onCreateFromSearch, onToggle, onView, onEdit, onDelete, onSetSubtask,
}: TasksPageProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">{t('tasks.title')}</h1>
      </div>
      <Header stats={stats} onCreate={onCreate} />
      <Toolbar
        searchQuery={searchQuery}
        onSearch={onSearch}
        filter={filter}
        onFilter={onFilter}
        onCreateFromSearch={onCreateFromSearch}
        hasResults={tasks.length > 0}
      />
      <main className="main">
        <TaskList
          tasks={tasks}
          taskMap={taskMap}
          filter={filter}
          searchQuery={searchQuery}
          onToggle={onToggle}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetSubtask={onSetSubtask}
        />
      </main>
    </>
  );
}
