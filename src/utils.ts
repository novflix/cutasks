export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
