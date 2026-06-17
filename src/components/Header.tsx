import { AddSquare } from '@solar-icons/react';

interface StatItem {
  label: string;
  value: number;
  color?: string;
}

interface HeaderProps {
  stats: StatItem[];
  onCreate: () => void;
  createLabel?: string;
}

export default function Header({ stats, onCreate, createLabel = 'New Task' }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="stats">
          {stats.map((s) => (
            <span key={s.label} className="stat" style={s.color ? { borderColor: `${s.color}33` } : undefined}>
              <span className="stat-dot" style={s.color ? { background: s.color } : undefined} />
              <strong>{s.value}</strong> {s.label}
            </span>
          ))}
          <button className="btn btn-primary stat-create-btn" onClick={onCreate}>
            <AddSquare size={18} />
            <span className="btn-label">{createLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
