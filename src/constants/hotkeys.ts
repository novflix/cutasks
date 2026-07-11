export type HotkeyAction =
  | 'createTask'
  | 'createProject'
  | 'createHabit'
  | 'togglePomodoro'
  | 'focusSearch'
  | 'openCalendar'
  | 'toggleSidebar'
  | 'goHome'
  | 'goTasks'
  | 'goProjects'
  | 'goSettings';

export interface HotkeyCombo {
  code: string;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
}

export interface HotkeyItem {
  id: HotkeyAction;
  combo: HotkeyCombo;
  labelKey: string;
}

export const DEFAULT_HOTKEYS: HotkeyItem[] = [
  { id: 'createTask',     combo: { code: 'KeyT',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.createTask' },
  { id: 'createProject',  combo: { code: 'KeyP',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.createProject' },
  { id: 'createHabit',    combo: { code: 'KeyH',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.createHabit' },
  { id: 'togglePomodoro', combo: { code: 'KeyM',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.togglePomodoro' },
  { id: 'focusSearch',    combo: { code: 'KeyF',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.focusSearch' },
  { id: 'openCalendar',   combo: { code: 'KeyC',      alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.openCalendar' },
  { id: 'toggleSidebar',  combo: { code: 'Slash',     alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.toggleSidebar' },
  { id: 'goHome',         combo: { code: 'Digit1',    alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.goHome' },
  { id: 'goTasks',        combo: { code: 'Digit2',    alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.goTasks' },
  { id: 'goProjects',     combo: { code: 'Digit3',    alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.goProjects' },
  { id: 'goSettings',     combo: { code: 'Digit4',    alt: true, ctrl: false, shift: false }, labelKey: 'hotkeys.goSettings' },
];

export function getDefaultHotkeyConfig(): Record<HotkeyAction, HotkeyCombo> {
  return Object.fromEntries(DEFAULT_HOTKEYS.map(h => [h.id, { ...h.combo }])) as Record<HotkeyAction, HotkeyCombo>;
}

export function codeToDisplay(code: string): string {
  const map: Record<string, string> = {
    KeyA: 'A', KeyB: 'B', KeyC: 'C', KeyD: 'D', KeyE: 'E', KeyF: 'F',
    KeyG: 'G', KeyH: 'H', KeyI: 'I', KeyJ: 'J', KeyK: 'K', KeyL: 'L',
    KeyM: 'M', KeyN: 'N', KeyO: 'O', KeyP: 'P', KeyQ: 'Q', KeyR: 'R',
    KeyS: 'S', KeyT: 'T', KeyU: 'U', KeyV: 'V', KeyW: 'W', KeyX: 'X',
    KeyY: 'Y', KeyZ: 'Z',
    Digit0: '0', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
    Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
    Slash: '/',
    Space: 'Space',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Backquote: '`',
  };
  return map[code] || code;
}

export function comboToDisplay(combo: HotkeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.alt) parts.push('Alt');
  if (combo.shift) parts.push('Shift');
  parts.push(codeToDisplay(combo.code));
  return parts.join(' + ');
}

export function matchCombo(e: KeyboardEvent, combo: HotkeyCombo): boolean {
  return e.code === combo.code
    && e.altKey === combo.alt
    && e.ctrlKey === combo.ctrl
    && e.shiftKey === combo.shift;
}
