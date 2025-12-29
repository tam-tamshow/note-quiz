// lib/quiz/settings.ts

export type QuizSettings = {
  minMidi: number;
  maxMidi: number;
  whiteKeysOnly: boolean;
  weakBias: number;
};

const KEY = "note_quiz_settings_v1";

export const DEFAULT_SETTINGS: QuizSettings = {
  minMidi: 60,
  maxMidi: 81,
  whiteKeysOnly: true,
  weakBias: 0.4,
};

export function loadSettings(): QuizSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const x = JSON.parse(raw) as Partial<QuizSettings>;

    return {
      minMidi: clampInt(x.minMidi ?? DEFAULT_SETTINGS.minMidi, 0, 127),
      maxMidi: clampInt(x.maxMidi ?? DEFAULT_SETTINGS.maxMidi, 0, 127),
      whiteKeysOnly: x.whiteKeysOnly ?? DEFAULT_SETTINGS.whiteKeysOnly,
      weakBias: clampNum(x.weakBias ?? DEFAULT_SETTINGS.weakBias, 0, 1),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: QuizSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function clampInt(n: number, min: number, max: number) {
  const v = Math.trunc(n);
  return Math.min(max, Math.max(min, v));
}
function clampNum(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
