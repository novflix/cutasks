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

// ── Projects ──────────────────────────────────────────
export type ProjectColor =
  | 'terracotta'
  | 'sage'
  | 'sky'
  | 'lavender'
  | 'blush'
  | 'amber'
  | 'teal'
  | 'slate';

export const PROJECT_COLORS: Record<ProjectColor, { bg: string; text: string; border: string; dot: string }> = {
  terracotta: { bg: 'rgba(205,107,68,0.10)',  text: '#b85a2a', border: 'rgba(205,107,68,0.28)', dot: '#cd6b44' },
  sage:       { bg: 'rgba(100,145,88,0.10)',  text: '#3d7033', border: 'rgba(100,145,88,0.28)', dot: '#649158' },
  sky:        { bg: 'rgba(64,130,188,0.10)',  text: '#1e5f96', border: 'rgba(64,130,188,0.28)', dot: '#4082bc' },
  lavender:   { bg: 'rgba(130,98,188,0.10)',  text: '#5e3a9c', border: 'rgba(130,98,188,0.28)', dot: '#8262bc' },
  blush:      { bg: 'rgba(196,90,105,0.10)',  text: '#9c3045', border: 'rgba(196,90,105,0.28)', dot: '#c45a69' },
  amber:      { bg: 'rgba(190,140,50,0.10)',  text: '#7a5500', border: 'rgba(190,140,50,0.28)', dot: '#be8c32' },
  teal:       { bg: 'rgba(48,158,148,0.10)',  text: '#0e6e66', border: 'rgba(48,158,148,0.28)', dot: '#309e94' },
  slate:      { bg: 'rgba(88,110,148,0.10)',  text: '#324d78', border: 'rgba(88,110,148,0.28)', dot: '#586e94' },
};

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  sectionId?: string;
}

export interface ProjectSection {
  id: string;
  title: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: ProjectColor;
  emoji?: string; // stores icon key string, not actual emoji
  sections: ProjectSection[];
  tasks: ProjectTask[];
  createdAt: string;
}