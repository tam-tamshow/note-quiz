// lib/quiz/generator.ts
import type { Attempt } from "./storage";
import type { QuizSettings } from "./settings";

export type Question = { id: string; midi: number };

// 12音のうち白鍵（#無し）
const WHITE_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

export const ANSWER_CHOICES = [60, 62, 64, 65, 67, 69, 71] as const;

export function generateQuestion(
  settings: QuizSettings,
  attempts: Attempt[]
): Question {
  const pool = buildMidiPool(settings);
  const weights = buildWeights(pool, attempts, settings.weakBias);
  const midi = weightedPick(pool, weights);
  return { id: crypto.randomUUID(), midi };
}

function buildMidiPool(settings: QuizSettings): number[] {
  const min = Math.min(settings.minMidi, settings.maxMidi);
  const max = Math.max(settings.minMidi, settings.maxMidi);

  const pool: number[] = [];
  for (let m = min; m <= max; m++) {
    const pc = ((m % 12) + 12) % 12;
    if (!WHITE_PCS.has(pc)) continue;
    pool.push(m);
  }

  // 万一プールが空なら、最小限のフォールバック（C4）
  return pool.length > 0 ? pool : [60];
}

/**
 * weakBias=0 なら一様ランダム
 * weakBias>0 なら「苦手（正答率低い/試行少ない）」を少し優遇
 */
function buildWeights(
  pool: number[],
  attempts: Attempt[],
  weakBias: number
): number[] {
  if (weakBias <= 0) return pool.map(() => 1);

  // 音ごとの stats
  const stats = new Map<number, { total: number; correct: number }>();
  for (const a of attempts) {
    const v = stats.get(a.questionMidi) ?? { total: 0, correct: 0 };
    v.total += 1;
    if (a.correct) v.correct += 1;
    stats.set(a.questionMidi, v);
  }

  // “苦手度” = 1 - 正答率。試行が少ないものは少し苦手寄りに。
  // 例: total=0 => rate=0.5扱い（未知なので中間）
  const weights: number[] = [];
  for (const m of pool) {
    const v = stats.get(m);
    const rate = v ? v.correct / v.total : 0.5;

    // 少ない試行は少し優遇（探索）
    const exploreBoost = v
      ? Math.min(0.3, (1 / Math.sqrt(v.total + 1)) * 0.3)
      : 0.2;

    const weakness = 1 - rate; // 0(得意)〜1(苦手)
    const score = clamp01(weakness + exploreBoost);

    // 一様(1) と 苦手スコア(1〜2) を混ぜる
    const w = (1 - weakBias) * 1 + weakBias * (1 + score);
    weights.push(w);
  }
  return weights;
}

function weightedPick(items: number[], weights: number[]): number {
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
