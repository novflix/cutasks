import React from 'react';
import type { FilterType } from '../types';
import { ClipboardList, Sun, CheckCircle } from '@solar-icons/react';

const MESSAGES: Record<FilterType, { Icon: React.FC<{ size?: number; className?: string }>; title: string; sub: string }> = {
  all:       { Icon: ClipboardList, title: 'All clear!',     sub: 'Add your first task and make today count.' },
  active:    { Icon: Sun,           title: 'Nothing to do!', sub: "You're all caught up. Enjoy the moment." },
  completed: { Icon: CheckCircle,   title: 'Not yet!',       sub: 'Complete some tasks and see them here.' },
};

export const EmptyState: React.FC<{ filter: FilterType }> = ({ filter }) => {
  const { Icon, title, sub } = MESSAGES[filter];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>
        <Icon size={32} />
      </div>
      <h3 className="font-display text-xl font-medium" style={{ color: 'var(--text-main)' }}>{title}</h3>
      <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
};
