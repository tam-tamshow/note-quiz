export type Attempt = {
  at: number;
  questionId: string;
  questionMidi: number;
  answerMidi: number;
  correct: boolean;
};

const KEY = "note_quiz_attempts_v1";

export function loadAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Attempt[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(a: Omit<Attempt, "at">) {
  const attempt: Attempt = {
    ...a,
    at: Date.now(),
  };

  const current = loadAttempts();
  current.push(attempt);
  localStorage.setItem(KEY, JSON.stringify(current));
}

export function clearAttempts() {
  localStorage.removeItem(KEY);
}
