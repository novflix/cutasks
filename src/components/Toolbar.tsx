import { MinimalisticMagnifier } from '@solar-icons/react';
import type { FilterType } from '../types';

interface ToolbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  filter: FilterType;
  onFilter: (filter: FilterType) => void;
}

export default function Toolbar({ searchQuery, onSearch, filter, onFilter }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <MinimalisticMagnifier size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks..."
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
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
          </button>
        ))}
      </div>
    </div>
  );
}
