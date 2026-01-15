import { CHORD_TYPES } from "./chords";

export type ChordQuizSettings = {
  minMidi: number;
  maxMidi: number;
  weakBias: number;
  enabledChordTypeIds: string[];
};

const KEY = "note_quiz_chord_settings_v1";
export const MIN_MIDI = 55; // G3
export const MAX_MIDI = 95; // B6

export const DEFAULT_CHORD_SETTINGS: ChordQuizSettings = {
  minMidi: 60,
  maxMidi: 81,
  weakBias: 0.4,
  enabledChordTypeIds: CHORD_TYPES.map((t) => t.id),
};

export function loadChordSettings(): ChordQuizSettings {
  if (typeof window === "undefined") return DEFAULT_CHORD_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CHORD_SETTINGS;
    const x = JSON.parse(raw) as Partial<ChordQuizSettings>;

    const enabled = Array.isArray(x.enabledChordTypeIds)
      ? x.enabledChordTypeIds.filter((id) =>
          CHORD_TYPES.some((t) => t.id === id)
        )
      : DEFAULT_CHORD_SETTINGS.enabledChordTypeIds;

    return {
      minMidi: clampInt(x.minMidi ?? DEFAULT_CHORD_SETTINGS.minMidi, MIN_MIDI, MAX_MIDI),
      maxMidi: clampInt(x.maxMidi ?? DEFAULT_CHORD_SETTINGS.maxMidi, MIN_MIDI, MAX_MIDI),
      weakBias: clampNum(x.weakBias ?? DEFAULT_CHORD_SETTINGS.weakBias, 0, 1),
      enabledChordTypeIds:
        enabled.length > 0 ? enabled : DEFAULT_CHORD_SETTINGS.enabledChordTypeIds,
    };
  } catch {
    return DEFAULT_CHORD_SETTINGS;
  }
}

export function saveChordSettings(s: ChordQuizSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function clampInt(n: number, min: number, max: number) {
  const v = Math.trunc(n);
  return Math.min(max, Math.max(min, v));
}
function clampNum(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
