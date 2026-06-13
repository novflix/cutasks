export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  tags: string[];
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}
