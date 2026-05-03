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

export interface ProjectColorTokens {
  /** Dot / accent – vivid, works on both themes */
  dot: string;
  /** Light-theme tinted background */
  bgLight: string;
  /** Dark-theme tinted background */
  bgDark: string;
  /** Light-theme border */
  borderLight: string;
  /** Dark-theme border */
  borderDark: string;
  /** Light-theme label text */
  textLight: string;
  /** Dark-theme label text */
  textDark: string;
}

export const PROJECT_COLOR_TOKENS: Record<ProjectColor, ProjectColorTokens> = {
  terracotta: { dot: '#e07850', bgLight: 'rgba(224,120,80,0.10)', bgDark: 'rgba(224,120,80,0.18)', borderLight: 'rgba(224,120,80,0.30)', borderDark: 'rgba(224,120,80,0.45)', textLight: '#a84420', textDark: '#f0a080' },
  sage:       { dot: '#5ea84e', bgLight: 'rgba(94,168,78,0.10)',  bgDark: 'rgba(94,168,78,0.18)',  borderLight: 'rgba(94,168,78,0.30)',  borderDark: 'rgba(94,168,78,0.45)',  textLight: '#2e7022', textDark: '#8ed080' },
  sky:        { dot: '#3d96e0', bgLight: 'rgba(61,150,224,0.10)', bgDark: 'rgba(61,150,224,0.18)', borderLight: 'rgba(61,150,224,0.30)', borderDark: 'rgba(61,150,224,0.45)', textLight: '#1258a0', textDark: '#7dc4f8' },
  lavender:   { dot: '#9370e0', bgLight: 'rgba(147,112,224,0.10)',bgDark: 'rgba(147,112,224,0.18)',borderLight: 'rgba(147,112,224,0.30)',borderDark: 'rgba(147,112,224,0.45)',textLight: '#5830a0', textDark: '#c4a0f8' },
  blush:      { dot: '#e0546a', bgLight: 'rgba(224,84,106,0.10)', bgDark: 'rgba(224,84,106,0.18)', borderLight: 'rgba(224,84,106,0.30)', borderDark: 'rgba(224,84,106,0.45)', textLight: '#9e2038', textDark: '#f898a8' },
  amber:      { dot: '#d4a030', bgLight: 'rgba(212,160,48,0.10)', bgDark: 'rgba(212,160,48,0.18)', borderLight: 'rgba(212,160,48,0.30)', borderDark: 'rgba(212,160,48,0.45)', textLight: '#8a5c00', textDark: '#f0cc6a' },
  teal:       { dot: '#28b8aa', bgLight: 'rgba(40,184,170,0.10)', bgDark: 'rgba(40,184,170,0.18)', borderLight: 'rgba(40,184,170,0.30)', borderDark: 'rgba(40,184,170,0.45)', textLight: '#0a7068', textDark: '#6ae0d4' },
  slate:      { dot: '#6488c0', bgLight: 'rgba(100,136,192,0.10)',bgDark: 'rgba(100,136,192,0.18)',borderLight: 'rgba(100,136,192,0.30)',borderDark: 'rgba(100,136,192,0.45)',textLight: '#2a4878', textDark: '#9abcee' },
};

/**
 * Returns resolved color tokens for the current theme.
 * Pass `dark = true` for dark/slate themes.
 */
export function resolveProjectColors(color: ProjectColor, dark: boolean): { bg: string; text: string; border: string; dot: string } {
  const t = PROJECT_COLOR_TOKENS[color];
  return {
    dot:    t.dot,
    bg:     dark ? t.bgDark     : t.bgLight,
    border: dark ? t.borderDark : t.borderLight,
    text:   dark ? t.textDark   : t.textLight,
  };
}

/** @deprecated Use resolveProjectColors() instead */
export const PROJECT_COLORS: Record<ProjectColor, { bg: string; text: string; border: string; dot: string }> = Object.fromEntries(
  (Object.keys(PROJECT_COLOR_TOKENS) as ProjectColor[]).map(k => [k, resolveProjectColors(k, false)])
) as Record<ProjectColor, { bg: string; text: string; border: string; dot: string }>;

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
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: ProjectColor;
  emoji?: string; 
  sections: ProjectSection[];
  tasks: ProjectTask[];
  createdAt: string;
}