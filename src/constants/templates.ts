export interface TemplateTask {
  key: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TemplateSection {
  key: string;
  tasks: TemplateTask[];
}

export interface Template {
  id: string;
  tplKey: string;
  icon: string;
  color: string;
  category: string;
  sections: TemplateSection[];
}

export type TemplateCategory = {
  key: string;
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { key: 'personal' },
  { key: 'health' },
  { key: 'home' },
  { key: 'career' },
  { key: 'finance' },
  { key: 'travel' },
];

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-30day',
    tplKey: '30day',
    icon: 'Flag',
    color: '#ed9b6d',
    category: 'personal',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'low' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'medium' }, { key: 't7', priority: 'medium' }, { key: 't8', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't9', priority: 'medium' }, { key: 't10', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-learning',
    tplKey: 'learning',
    icon: 'SquareAcademicCap',
    color: '#64b5f6',
    category: 'personal',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'medium' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'medium' }, { key: 't10', priority: 'high' }] },
      { key: 's4', tasks: [{ key: 't11', priority: 'medium' }, { key: 't12', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-brand',
    tplKey: 'brand',
    icon: 'StarFall2',
    color: '#ba68c8',
    category: 'personal',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'medium' }, { key: 't8', priority: 'low' }, { key: 't9', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-goals',
    tplKey: 'goals',
    icon: 'PieChart',
    color: '#ffb74d',
    category: 'personal',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't3', priority: 'high' }, { key: 't4', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't5', priority: 'high' }, { key: 't6', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't7', priority: 'medium' }, { key: 't8', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-gratitude',
    tplKey: 'gratitude',
    icon: 'BookmarkSquareMinimalistic',
    color: '#4db6ac',
    category: 'personal',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't3', priority: 'medium' }, { key: 't4', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't5', priority: 'low' }, { key: 't6', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-workout',
    tplKey: 'workout',
    icon: 'Cup',
    color: '#e57373',
    category: 'health',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'medium' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'low' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'low' }, { key: 't8', priority: 'low' }] },
      { key: 's4', tasks: [{ key: 't9', priority: 'medium' }, { key: 't10', priority: 'low' }, { key: 't11', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-weight',
    tplKey: 'weight',
    icon: 'PieChart',
    color: '#ffb74d',
    category: 'health',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }, { key: 't7', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't8', priority: 'medium' }, { key: 't9', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-meditation',
    tplKey: 'meditation',
    icon: 'BookmarkSquareMinimalistic',
    color: '#ba68c8',
    category: 'health',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'medium' }, { key: 't9', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-sleep',
    tplKey: 'sleep',
    icon: 'Alarm',
    color: '#9575cd',
    category: 'health',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }, { key: 't7', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't8', priority: 'medium' }, { key: 't9', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-moving',
    tplKey: 'moving',
    icon: 'Box',
    color: '#4db6ac',
    category: 'home',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }, { key: 't4', priority: 'high' }] },
      { key: 's2', tasks: [{ key: 't5', priority: 'high' }, { key: 't6', priority: 'high' }, { key: 't7', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't8', priority: 'high' }, { key: 't9', priority: 'medium' }, { key: 't10', priority: 'high' }] },
      { key: 's4', tasks: [{ key: 't11', priority: 'medium' }, { key: 't12', priority: 'medium' }, { key: 't13', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-meals',
    tplKey: 'meals',
    icon: 'ChefHat',
    color: '#ffb74d',
    category: 'home',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'medium' }, { key: 't8', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-renovation',
    tplKey: 'renovation',
    icon: 'Box',
    color: '#4db6ac',
    category: 'home',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'high' }, { key: 't10', priority: 'high' }] },
      { key: 's4', tasks: [{ key: 't11', priority: 'high' }, { key: 't12', priority: 'medium' }, { key: 't13', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-storage',
    tplKey: 'storage',
    icon: 'Box',
    color: '#4db6ac',
    category: 'home',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'medium' }, { key: 't8', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-startup',
    tplKey: 'startup',
    icon: 'Programming',
    color: '#64b5f6',
    category: 'career',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }] },
      { key: 's2', tasks: [{ key: 't2', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't3', priority: 'high' }, { key: 't4', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-job',
    tplKey: 'job',
    icon: 'Mailbox',
    color: '#ed9b6d',
    category: 'career',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'high' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'medium' }, { key: 't9', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'high' }, { key: 't11', priority: 'medium' }, { key: 't12', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-skills',
    tplKey: 'skills',
    icon: 'SquareAcademicCap',
    color: '#64b5f6',
    category: 'career',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }, { key: 't3', priority: 'high' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'medium' }, { key: 't9', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'medium' }, { key: 't11', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-automation',
    tplKey: 'automation',
    icon: 'Programming',
    color: '#4db6ac',
    category: 'career',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'medium' }, { key: 't9', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-vacation',
    tplKey: 'vacation',
    icon: 'Clouds',
    color: '#4fc3f7',
    category: 'career',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'high' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'medium' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'low' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'medium' }, { key: 't11', priority: 'low' }, { key: 't12', priority: 'high' }] },
    ],
  },
  {
    id: 'tpl-budget',
    tplKey: 'budget',
    icon: 'WalletMoney',
    color: '#66bb6a',
    category: 'finance',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't3', priority: 'high' }, { key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'high' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'medium' }, { key: 't9', priority: 'low' }, { key: 't10', priority: 'low' }] },
      { key: 's4', tasks: [{ key: 't11', priority: 'high' }, { key: 't12', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-invest',
    tplKey: 'invest',
    icon: 'PieChart',
    color: '#ffb74d',
    category: 'finance',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'medium' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'medium' }, { key: 't11', priority: 'low' }] },
    ],
  },
  {
    id: 'tpl-dream',
    tplKey: 'dream',
    icon: 'MapPoint',
    color: '#4db6ac',
    category: 'travel',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'medium' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'high' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'high' }, { key: 't11', priority: 'high' }, { key: 't12', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-road',
    tplKey: 'road',
    icon: 'MapPoint',
    color: '#ffb74d',
    category: 'travel',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'high' }, { key: 't2', priority: 'high' }, { key: 't3', priority: 'medium' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'high' }, { key: 't5', priority: 'high' }, { key: 't6', priority: 'low' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'high' }, { key: 't8', priority: 'high' }, { key: 't9', priority: 'medium' }] },
    ],
  },
  {
    id: 'tpl-bucket',
    tplKey: 'bucket',
    icon: 'StarFall2',
    color: '#ba68c8',
    category: 'travel',
    sections: [
      { key: 's1', tasks: [{ key: 't1', priority: 'medium' }, { key: 't2', priority: 'low' }, { key: 't3', priority: 'low' }] },
      { key: 's2', tasks: [{ key: 't4', priority: 'medium' }, { key: 't5', priority: 'high' }, { key: 't6', priority: 'medium' }] },
      { key: 's3', tasks: [{ key: 't7', priority: 'low' }, { key: 't8', priority: 'low' }, { key: 't9', priority: 'medium' }] },
      { key: 's4', tasks: [{ key: 't10', priority: 'medium' }, { key: 't11', priority: 'low' }] },
    ],
  },
];
