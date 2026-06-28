import {
  Book, Running, Meditation, WalletMoney,
  GamepadNoCharge, StickerSquare, Alarm,
  TrashBinTrash, Broom, Flag, Gift,
  MagicStick2, JarOfPills, Pills,
  CartLarge2, SquareAcademicCap, Backpack,
  Palette2, TeaCup, Bottle, Archive,
  Waterdrop, DumbbellLargeMinimalistic,
  DocumentAdd, Mailbox, MusicNote3,
  Cloud, Planet, EmojiFunnySquare,
  SleepingSquare, Paw, Box,

} from '@solar-icons/react';
import type { ComponentType } from 'react';

export const HABIT_ICONS: { name: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { name: 'Book', icon: Book },
  { name: 'Running', icon: Running },
  { name: 'Meditation', icon: Meditation },
  { name: 'WalletMoney', icon: WalletMoney },
  { name: 'GamepadNoCharge', icon: GamepadNoCharge },
  { name: 'StickerSquare', icon: StickerSquare },
  { name: 'Alarm', icon: Alarm },
  { name: 'TrashBinTrash', icon: TrashBinTrash },
  { name: 'Broom', icon: Broom },
  { name: 'Flag', icon: Flag },
  { name: 'Gift', icon: Gift },
  { name: 'MagicStick2', icon: MagicStick2 },
  { name: 'JarOfPills', icon: JarOfPills },
  { name: 'Pills', icon: Pills },
  { name: 'CartLarge2', icon: CartLarge2 },
  { name: 'SquareAcademicCap', icon: SquareAcademicCap },
  { name: 'Backpack', icon: Backpack },
  { name: 'Palette2', icon: Palette2 },
  { name: 'TeaCup', icon: TeaCup },
  { name: 'Bottle', icon: Bottle },
  { name: 'Archive', icon: Archive },
  { name: 'Waterdrop', icon: Waterdrop },
  { name: 'DumbbellLargeMinimalistic', icon: DumbbellLargeMinimalistic },
  { name: 'DocumentAdd', icon: DocumentAdd },
  { name: 'Mailbox', icon: Mailbox },
  { name: 'MusicNote3', icon: MusicNote3 },
  { name: 'Cloud', icon: Cloud },
  { name: 'Planet', icon: Planet },
  { name: 'EmojiFunnySquare', icon: EmojiFunnySquare },
  { name: 'SleepingSquare', icon: SleepingSquare },
  { name: 'Paw', icon: Paw },
  { name: 'Box', icon: Box },

];

export const HABIT_COLORS = [
  '#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d',
  '#4db6ac', '#e57373', '#9575cd', '#4fc3f7', '#f06292',
  '#aed581', '#ff8a65',
];
