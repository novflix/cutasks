import { AddSquare } from '@solar-icons/react';

interface HeaderProps {
  stats: { total: number; active: number; completed: number; overdue: number };
  onCreate: () => void;
}

export default function Header({ stats, onCreate }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="stats">
          <span className="stat stat-total">
            <span className="stat-dot" />
            <strong>{stats.total}</strong> total
          </span>
          <span className="stat stat-active">
            <span className="stat-dot" />
            <strong>{stats.active}</strong> active
          </span>
          <span className="stat stat-done">
            <span className="stat-dot" />
            <strong>{stats.completed}</strong> done
          </span>
          {stats.overdue > 0 && (
            <span className="stat stat-overdue">
              <span className="stat-dot" />
              <strong>{stats.overdue}</strong> overdue
            </span>
          )}
          <button className="btn btn-primary stat-create-btn" onClick={onCreate}>
            <AddSquare size={16} />
            <span className="btn-label">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
