import { NotesMinimalistic } from '@solar-icons/react';
import type { Task } from '../types';
import type { FilterType } from '../App';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  filter: FilterType;
  searchQuery: string;
  onToggle: (id: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, filter, searchQuery, onToggle, onView, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty">
        <NotesMinimalistic size={64} className="empty-icon" />
        <p className="empty-title">
          {searchQuery
            ? 'Nothing found'
            : filter === 'completed'
            ? 'No completed tasks'
            : filter === 'active'
            ? 'All tasks are done!'
            : 'No tasks yet'}
        </p>
        <p className="empty-sub">
          {searchQuery
            ? 'Try a different search'
            : 'Click "New Task" to get started'}
        </p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          searchQuery={searchQuery}
          onToggle={onToggle}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
