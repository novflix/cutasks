import { MinimalisticMagnifier } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { FilterType } from '../types';

interface ToolbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filter: FilterType;
  onFilter: (filter: FilterType) => void;
}

const FILTER_KEYS: Record<FilterType, string> = {
  all: 'components.toolbar.all',
  active: 'components.toolbar.active',
  completed: 'components.toolbar.done',
};

export default function Toolbar({ searchQuery, onSearch, filter, onFilter }: ToolbarProps) {
  const { t } = useTranslation();
  return (
    <div className="toolbar">
      <div className="search-box">
        <MinimalisticMagnifier size={18} className="search-icon" />
        <input
          type="text"
          placeholder={t('components.toolbar.search')}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filters">
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => onFilter(f)}
          >
            {t(FILTER_KEYS[f])}
          </button>
        ))}
      </div>
    </div>
  );
}
