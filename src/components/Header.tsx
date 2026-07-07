import { memo } from 'react';
import { AddSquare } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';

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

export default memo(function Header({ stats, onCreate, createLabel }: HeaderProps) {
  const { t } = useTranslation();
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
          <button className="btn-add" onClick={onCreate}>
            <AddSquare size={18} />
            <span>{createLabel || t('components.header.newTask')}</span>
          </button>
        </div>
      </div>
    </header>
  );
});
