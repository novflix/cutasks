import type { Priority } from './types';

export const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function highlightMatch(text: string, query: string): { plain: string; highlighted: string }[] {
  if (!query.trim()) return [{ plain: text, highlighted: '' }];
  const q = query.toLowerCase();
  const result: { plain: string; highlighted: string }[] = [];
  let i = 0;
  while (i < text.length) {
    const matchStart = text.toLowerCase().indexOf(q, i);
    if (matchStart === -1) {
      result.push({ plain: text.slice(i), highlighted: '' });
      break;
    }
    if (matchStart > i) {
      result.push({ plain: text.slice(i, matchStart), highlighted: '' });
    }
    result.push({ plain: text.slice(matchStart, matchStart + q.length), highlighted: 'mark' });
    i = matchStart + q.length;
  }
  return result;
}

const TAG_COLORS = [
  { bg: 'rgba(237, 155, 109, 0.15)', text: '#ed9b6d' },
  { bg: 'rgba(102, 187, 106, 0.15)', text: '#66bb6a' },
  { bg: 'rgba(100, 181, 246, 0.15)', text: '#64b5f6' },
  { bg: 'rgba(186, 104, 200, 0.15)', text: '#ba68c8' },
  { bg: 'rgba(255, 183, 77, 0.15)', text: '#ffb74d' },
  { bg: 'rgba(77, 182, 172, 0.15)', text: '#4db6ac' },
  { bg: 'rgba(229, 115, 115, 0.15)', text: '#e57373' },
  { bg: 'rgba(149, 117, 205, 0.15)', text: '#9575cd' },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getTagColor(tag: string) {
  return TAG_COLORS[hashStr(tag) % TAG_COLORS.length];
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDeadline(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getDeadlineStatus(dateStr: string, completed: boolean): 'overdue' | 'today' | 'soon' | 'normal' | '' {
  if (!dateStr || completed) return '';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr + 'T00:00:00');
  const diff = deadline.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'normal';
}

export const MAX_SUBTASK_DEPTH = 3;

export function getTaskDepth(taskId: string, taskMap: Map<string, { parentId: string | null }>): number {
  let depth = 0;
  let current = taskMap.get(taskId);
  while (current?.parentId) {
    depth++;
    current = taskMap.get(current.parentId);
  }
  return depth;
}

export function canAddSubtask(childId: string, targetId: string, taskMap: Map<string, { parentId: string | null }>): boolean {
  const targetDepth = getTaskDepth(targetId, taskMap);
  if (targetDepth >= MAX_SUBTASK_DEPTH) return false;
  let current = taskMap.get(childId);
  while (current?.parentId) {
    if (current.parentId === targetId) return false;
    current = taskMap.get(current.parentId);
  }
  return true;
}
