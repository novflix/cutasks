import { createContext } from 'react';
import type { Task, Project, Section, ProjectTask, Habit, Priority, FilterType } from '../types';

export interface TaskContextValue {
  // State
  tasks: Task[];
  projects: Project[];
  sections: Section[];
  projectTasks: ProjectTask[];
  habits: Habit[];
  dataLoading: boolean;

  // Task operations
  createTask: (title: string) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setSubtaskOf: (childId: string, parentId: string | null) => void;

  // Project operations
  createProject: (name: string) => void;
  updateProject: (id: string, changes: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  // Project task operations
  createProjectTask: (projectId: string, title: string, sectionId?: string | null) => void;
  updateProjectTask: (id: string, changes: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;
  toggleProjectTask: (id: string) => void;

  // Section operations
  updateSections: (sections: Section[]) => void;

  // Habit operations
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;

  // Undo
  undo: () => void;

  // Filters
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  projectSearch: string;
  setProjectSearch: (q: string) => void;
  projectTaskFilter: FilterType;
  setProjectTaskFilter: (f: FilterType) => void;
  projectTaskSearch: string;
  setProjectTaskSearch: (q: string) => void;

  // Derived
  filteredTasks: Task[];
  filteredProjects: Project[];
  allTags: string[];
  allProjectTags: string[];
  taskStats: { total: number; active: number; completed: number; overdue: number };
  projectStats: { label: string; value: number; color?: string }[];
  taskStatsFormatted: { label: string; value: number; color?: string }[];
  taskMap: Map<string, Task>;

  // Settings
  defaultPriority: Priority;
  setDefaultPriority: (p: Priority) => void;
  weekStart: string;
  setWeekStart: (w: string) => void;
  expandProjects: boolean;
  setExpandProjects: (e: boolean) => void;

  // Delete confirmation
  confirmDelete: { type: 'task' | 'project'; id: string; title: string } | null;
  setConfirmDelete: (v: { type: 'task' | 'project'; id: string; title: string } | null) => void;
  confirmDeleteTask: (id: string) => void;
  confirmDeleteProject: (id: string) => void;
  confirmDeleteProjectTask: (id: string) => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
