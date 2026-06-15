export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  tags: string[];
  completed: boolean;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export type Page = 'tasks' | 'projects';
