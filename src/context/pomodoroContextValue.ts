export interface PomodoroSettings {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  showInNav: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface HabitSettings {
  showInNav: boolean;
}

export interface PomodoroContextValue {
  settings: PomodoroSettings;
  update: (patch: Partial<PomodoroSettings>) => void;
}