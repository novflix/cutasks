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

export type ProjectStatus = 'active' | 'paused' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface ProjectTask extends Task {
  projectId: string;
  sectionId: string | null;
}

export type Page = 'home' | 'tasks' | 'projects' | 'project-detail' | 'settings';
