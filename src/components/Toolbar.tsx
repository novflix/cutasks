import { memo } from 'react';
import { MinimalisticMagnifier } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { FilterType } from '../types';

interface ToolbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filter: FilterType;
  onFilter: (filter: FilterType) => void;
  onCreateFromSearch?: (query: string) => void;
  hasResults?: boolean;
}

const FILTER_KEYS: Record<FilterType, string> = {
  all: 'components.toolbar.all',
  active: 'components.toolbar.active',
  completed: 'components.toolbar.done',
};

export default memo(function Toolbar({ searchQuery, onSearch, filter, onFilter, onCreateFromSearch, hasResults = true }: ToolbarProps) {
  const { t } = useTranslation();

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim() && !hasResults && onCreateFromSearch) {
      onCreateFromSearch(searchQuery.trim());
    }
  }

  return (
    <div className="toolbar">
      <div className="search-box">
        <MinimalisticMagnifier size={18} className="search-icon" />
        <input
          type="text"
          placeholder={searchQuery.trim() && !hasResults ? t('components.toolbar.pressEnter') : t('components.toolbar.search')}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={handleKeyDown}
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
});
