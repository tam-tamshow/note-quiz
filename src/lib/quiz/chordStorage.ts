export type ChordAttempt = {
  at: number;
  questionId: string;
  questionChordId: string;
  questionRootMidi: number;
  answerChordId: string;
  correct: boolean;
};

const KEY = "note_quiz_chord_attempts_v1";

export function loadChordAttempts(): ChordAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChordAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveChordAttempt(a: Omit<ChordAttempt, "at">) {
  const attempt: ChordAttempt = {
    ...a,
    at: Date.now(),
  };

  const current = loadChordAttempts();
  current.push(attempt);
  localStorage.setItem(KEY, JSON.stringify(current));
}

export function clearChordAttempts() {
  localStorage.removeItem(KEY);
}
