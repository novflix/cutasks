import {
  Book, Running, Meditation, Waterdrop, Heart, MoonStars,
  CupHot, Flame, Target, MedalStar, Shield, Leaf, Star, Bolt, Alarm,
  SmileCircle, Football, CodeSquare, Palette, MusicNote, Notes,
} from '@solar-icons/react';
import type { ComponentType } from 'react';

export const HABIT_ICONS: { name: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { name: 'Book', icon: Book },
  { name: 'Running', icon: Running },
  { name: 'Meditation', icon: Meditation },
  { name: 'Waterdrop', icon: Waterdrop },
  { name: 'Heart', icon: Heart },
  { name: 'MoonStars', icon: MoonStars },
  { name: 'CupHot', icon: CupHot },
  { name: 'Flame', icon: Flame },
  { name: 'Target', icon: Target },
  { name: 'MedalStar', icon: MedalStar },
  { name: 'Shield', icon: Shield },
  { name: 'Leaf', icon: Leaf },
  { name: 'Star', icon: Star },
  { name: 'Bolt', icon: Bolt },
  { name: 'Alarm', icon: Alarm },
  { name: 'SmileCircle', icon: SmileCircle },
  { name: 'Football', icon: Football },
  { name: 'CodeSquare', icon: CodeSquare },
  { name: 'Palette', icon: Palette },
  { name: 'MusicNote', icon: MusicNote },
  { name: 'Notes', icon: Notes },
];

export const HABIT_COLORS = [
  '#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d',
  '#4db6ac', '#e57373', '#9575cd', '#4fc3f7', '#f06292',
  '#aed581', '#ff8a65',
];
