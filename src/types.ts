export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

export type FilterType = 'all' | 'active' | 'completed';
