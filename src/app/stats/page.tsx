"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadAttempts, clearAttempts, type Attempt } from "@/lib/quiz/storage";
import { midiToName } from "@/lib/quiz/music";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function StatsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setAttempts(loadAttempts());
  }, []);

  const stats = useMemo(() => {
    const total = attempts.length;
    const correct = attempts.filter((a) => a.correct).length;
    const accuracy = total === 0 ? 0 : correct / total;

    // 苦手Top5（音ごとの正答率で低い順、試行が少なすぎる音は除外したければ後で調整）
    const byMidi = new Map<number, { total: number; correct: number }>();
    for (const a of attempts) {
      const v = byMidi.get(a.questionMidi) ?? { total: 0, correct: 0 };
      v.total += 1;
      if (a.correct) v.correct += 1;
      byMidi.set(a.questionMidi, v);
    }
    const weak = Array.from(byMidi.entries())
      .map(([midi, v]) => ({ midi, total: v.total, rate: v.correct / v.total }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 5);

    return { total, correct, accuracy, weak };
  }, [attempts]);

  function onClear() {
    clearAttempts();
    setAttempts([]);
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Stats</h1>

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
              <li key={w.midi}>
                {midiToName(w.midi)} — {(w.rate * 100).toFixed(1)}%（{w.total}
                回）
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
        <Link href={`${base}/quiz`}>クイズへ</Link>
        <Link href={base}>トップへ</Link>
      </div>
    </main>
  );
}
