import type { ChordAttempt } from "./chordStorage";
import type { ChordQuizSettings } from "./chordSettings";
import { CHORD_TYPES, buildChordId, getEnabledChordTypes } from "./chords";

export type ChordQuestion = {
  id: string;
  rootMidi: number;
  typeId: string;
  notes: number[];
  chordId: string;
};

type ChordCandidate = Omit<ChordQuestion, "id">;

const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

export function generateChordQuestion(
  settings: ChordQuizSettings,
  attempts: ChordAttempt[]
): ChordQuestion {
  const pool = buildChordCandidates(settings);
  const weights = buildWeights(pool, attempts, settings.weakBias);
  const chord = weightedPick(pool, weights);
  return { ...chord, id: crypto.randomUUID() };
}

export function listChordAnswerIds(settings: ChordQuizSettings): string[] {
  const pool = buildChordCandidates(settings);
  const unique = new Set(pool.map((q) => q.chordId));
  return unique.size > 0 ? [...unique] : [buildChordId(0, "maj")];
}

function buildChordCandidates(settings: ChordQuizSettings): ChordCandidate[] {
  const min = Math.min(settings.minMidi, settings.maxMidi);
  const max = Math.max(settings.minMidi, settings.maxMidi);
  const enabledTypes = getEnabledChordTypes(settings.enabledChordTypeIds);

  const pool: ChordCandidate[] = [];
  for (let root = min; root <= max; root++) {
    const pc = ((root % 12) + 12) % 12;
    if (!WHITE_PCS.has(pc)) continue;

    for (const type of enabledTypes) {
      const notes = type.intervals.map((i) => root + i);
      const fitsRange = notes.every((n) => n >= min && n <= max);
      if (!fitsRange) continue;

      const chordId = buildChordId(pc, type.id);
      pool.push({ rootMidi: root, typeId: type.id, notes, chordId });
    }
  }

  if (pool.length > 0) return pool;

  const fallback = CHORD_TYPES.find((t) => t.id === "maj") ?? CHORD_TYPES[0];
  const root = 60;
  return [
    {
      rootMidi: root,
      typeId: fallback.id,
      notes: fallback.intervals.map((i) => root + i),
      chordId: buildChordId(0, fallback.id),
    },
  ];
}

/**
 * weakBias=0 なら一様ランダム
 * weakBias>0 なら「苦手（正答率低い/試行少ない）」を少し優遇
 */
function buildWeights(
  pool: ChordCandidate[],
  attempts: ChordAttempt[],
  weakBias: number
): number[] {
  if (weakBias <= 0) return pool.map(() => 1);

  const stats = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    const v = stats.get(a.questionChordId) ?? { total: 0, correct: 0 };
    v.total += 1;
    if (a.correct) v.correct += 1;
    stats.set(a.questionChordId, v);
  }

  const weights: number[] = [];
  for (const q of pool) {
    const v = stats.get(q.chordId);
    const rate = v ? v.correct / v.total : 0.5;
    const exploreBoost = v
      ? Math.min(0.3, (1 / Math.sqrt(v.total + 1)) * 0.3)
      : 0.2;
    const weakness = 1 - rate;
    const score = clamp01(weakness + exploreBoost);
    const w = (1 - weakBias) * 1 + weakBias * (1 + score);
    weights.push(w);
  }

  return weights;
}

function weightedPick(
  items: ChordCandidate[],
  weights: number[]
): ChordCandidate {
  let sum = 0;
  for (const w of weights) sum += w;

  let r = Math.random() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
