import type { Priority } from '../types';
import { ArrowDown, ArrowRight, ArrowUp } from '@solar-icons/react';

const MAP: Record<Priority, { label: string; Icon: React.FC<{ size?: number; className?: string }>; className: string }> = {
  low:    { label: 'Low',    Icon: ArrowDown,  className: 'bg-sage-100   text-sage-500  dark:bg-sage-500/20  dark:text-sage-400' },
  medium: { label: 'Medium', Icon: ArrowRight, className: 'bg-amber-100  text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' },
  high:   { label: 'High',   Icon: ArrowUp,    className: 'bg-blush-100  text-blush-500 dark:bg-blush-500/20 dark:text-blush-400' },
};

import React from 'react';

interface Props { priority: Priority; }

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const { label, Icon, className } = MAP[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-body ${className}`}>
      <Icon size={10} />
      {label}
    </span>
  );
};
