import type { Priority } from '../types';
import React from 'react';

const MAP: Record<Priority, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'bg-sage-100   text-sage-500  dark:bg-sage-500/20  dark:text-sage-400' },
  medium: { label: 'Medium', className: 'bg-amber-100  text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' },
  high:   { label: 'High',   className: 'bg-blush-100  text-blush-500 dark:bg-blush-500/20 dark:text-blush-400' },
};

interface Props { priority: Priority; }

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const { label, className } = MAP[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${className}`}>
      {label}
    </span>
  );
};