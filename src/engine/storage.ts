import { GameState } from './types.ts';

const SAVE_KEY = 'ledger-save-v1';
const SETTINGS_KEY = 'ledger-settings-v1';
const REGISTER_KEY = 'ledger-register-v1';
const PROGRESS_KEY = 'ledger-progress-v1';

export type SaveData = {
  folioId: string;
  state: GameState;
};

export type Settings = {
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
  colorBlind: boolean;
};

export type ProgressData = {
  completedFolios: string[];
  unlockedFolios: string[];
};

export function defaultSettings(): Settings {
  return { sound: true, music: true, reducedMotion: false, colorBlind: false };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { completedFolios: [], unlockedFolios: [] };
  } catch {
    return { completedFolios: [], unlockedFolios: [] };
  }
}

export function saveProgress(progress: ProgressData): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadRegister(): Set<string> {
  try {
    const raw = localStorage.getItem(REGISTER_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function saveRegister(register: Set<string>): void {
  localStorage.setItem(REGISTER_KEY, JSON.stringify(Array.from(register)));
}

export function loadGame(): { folioId: string; state: GameState } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.state.register = loadRegister();
    parsed.state.selectedTube = null;
    parsed.state.pendingState = 'none';
    return parsed;
  } catch {
    return null;
  }
}

export function saveGame(folioId: string, state: GameState): void {
  const snapshot = {
    ...state,
    register: Array.from(state.register)
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify({ folioId, state: snapshot }));
}


export function clearGame(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function resetAll(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(REGISTER_KEY);
}
