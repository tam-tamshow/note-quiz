"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  loadChordAttempts,
  clearChordAttempts,
  type ChordAttempt,
} from "@/lib/quiz/chordStorage";
import { formatChordName } from "@/lib/quiz/chords";
import { basePath } from "@/lib/quiz/paths";

function chordIdToLabel(chordId: string) {
  const [pcRaw, typeId] = chordId.split(":");
  const pc = Number(pcRaw);
  return formatChordName(pc, typeId);
}

export default function ChordStatsPage() {
  const [attempts, setAttempts] = useState<ChordAttempt[]>(() =>
    loadChordAttempts()
  );

  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const accuracy = total === 0 ? 0 : correct / total;

    const byChord = new Map<string, { total: number; correct: number }>();
    for (const a of attempts) {
      const v = byChord.get(a.questionChordId) ?? { total: 0, correct: 0 };
      v.total += 1;
      if (a.correct) v.correct += 1;
      byChord.set(a.questionChordId, v);
    }

    const weak = Array.from(byChord.entries())
      .map(([chordId, v]) => ({
        chordId,
        total: v.total,
        rate: v.correct / v.total,
      }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5);

    return { total, correct, accuracy, weak };
  }, [attempts]);

  function onClear() {
    clearChordAttempts();
    setAttempts([]);
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Chord Stats</h1>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <div>
          総回答数: <b>{stats.total}</b>
        </div>
        <div>
          正解数: <b>{stats.correct}</b>
        </div>
        <div>
          正答率: <b>{(stats.accuracy * 100).toFixed(1)}%</b>
        </div>

        <div style={{ marginTop: 16, fontWeight: 700 }}>苦手Top 5</div>
        {stats.weak.length === 0 ? (
          <div style={{ opacity: 0.7, marginTop: 8 }}>
            まだデータがありません
          </div>
        ) : (
          <ol style={{ marginTop: 8 }}>
            {stats.weak.map((w) => (
              <li key={w.chordId}>
                {chordIdToLabel(w.chordId)} — {(w.rate * 100).toFixed(1)}%（
                {w.total}回）
              </li>
            ))}
          </ol>
        )}

        <button
          onClick={onClear}
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        >
          記録をリセット
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href={`${basePath}/chords`}>和音クイズへ</Link>
        <Link href={`${basePath}/`}>トップへ</Link>
      </div>
    </main>
  );
}
