"use client";

import { useState } from "react";
import Link from "next/link";

import ScoreSvg from "./ScoreSvg";

import { midiToLetter, midiToName } from "@/lib/quiz/music";
import { loadAttempts, saveAttempt, type Attempt } from "@/lib/quiz/storage";
import {
  loadSettings,
  saveSettings,
  type QuizSettings,
  MIN_MIDI,
  MAX_MIDI,
} from "@/lib/quiz/settings";
import { generateQuestion, type Question } from "@/lib/quiz/generator";
import PianoKeyboard from "./PianoKeyboard";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Result = {
  answered: true;
  correct: boolean;
  correctMidi: number;
  answerMidi: number;
} | null;

export default function QuizPageClient() {
  const [settings, setSettings] = useState<QuizSettings>(() => loadSettings()); // 初期値を関数で設定
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts()); // 初期値を関数で設定
  const [q, setQ] = useState<Question | null>(() =>
    generateQuestion(loadSettings(), loadAttempts())
  ); // 初期値を計算
  const [result, setResult] = useState<Result>(null);

  /* ---------- 次の問題 ---------- */
  function nextQuestion(nextSettings?: QuizSettings) {
    const s = nextSettings ?? settings;
    const a = loadAttempts();
    setAttempts(a);
    setQ(generateQuestion(s, a));
    setResult(null);
  }

  function samePitchClass(a: number, b: number) {
    return ((a % 12) + 12) % 12 === ((b % 12) + 12) % 12;
  }

  /* ---------- 回答 ---------- */
  function answer(answerMidi: number) {
    if (!q) return;

    const correct = samePitchClass(q.midi, answerMidi);

    saveAttempt({
      questionId: q.id,
      questionMidi: q.midi,
      answerMidi,
      correct,
    });

    const a = loadAttempts();
    setAttempts(a);

    setResult({
      answered: true,
      correct,
      correctMidi: q.midi,
      answerMidi,
    });
  }

  /* ---------- 設定更新 ---------- */
  function updateSettings(patch: Partial<QuizSettings>) {
    const next: QuizSettings = { ...settings, ...patch };

    // min/max 入れ替え対策
    if (next.minMidi > next.maxMidi) {
      [next.minMidi, next.maxMidi] = [next.maxMidi, next.minMidi];
    }

    next.minMidi = Math.min(
      MAX_MIDI,
      Math.max(MIN_MIDI, Math.trunc(next.minMidi))
    );
    next.maxMidi = Math.min(
      MAX_MIDI,
      Math.max(MIN_MIDI, Math.trunc(next.maxMidi))
    );

    setSettings(next);
    saveSettings(next);
    nextQuestion(next);
  }

  return (
    <main style={{ maxWidth: 430, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Note Quiz</h1>

      {/* ===== 出題設定 ===== */}
      <section
        style={{
          marginTop: 12,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>出題設定</div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "flex", gap: 12 }}>
            <span style={{ width: 120 }}>最低音</span>
            <input
              type="number"
              min={MIN_MIDI}
              max={MAX_MIDI}
              value={settings.minMidi}
              onChange={(e) =>
                updateSettings({
                  minMidi: Number(e.target.value),
                })
              }
              style={{ width: 90 }}
            />
            <span style={{ opacity: 0.7 }}>{midiToName(settings.minMidi)}</span>
          </label>

          <label style={{ display: "flex", gap: 12 }}>
            <span style={{ width: 120 }}>最高音</span>
            <input
              type="number"
              min={MIN_MIDI}
              max={MAX_MIDI}
              value={settings.maxMidi}
              onChange={(e) =>
                updateSettings({
                  maxMidi: Number(e.target.value),
                })
              }
              style={{ width: 90 }}
            />
            <span style={{ opacity: 0.7 }}>{midiToName(settings.maxMidi)}</span>
          </label>

          <label style={{ display: "flex", gap: 12 }}>
            <span style={{ width: 120 }}>苦手優先</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.weakBias * 100)}
              onChange={(e) =>
                updateSettings({
                  weakBias: Number(e.target.value) / 100,
                })
              }
            />
            <span style={{ width: 60 }}>
              {Math.round(settings.weakBias * 100)}%
            </span>
          </label>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            これまでの回答数：{attempts.length}
          </div>
        </div>
        {(settings.minMidi === MIN_MIDI || settings.maxMidi === MAX_MIDI) && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#8a5a00" }}>
            {settings.minMidi === MIN_MIDI &&
              `最低音は${midiToName(MIN_MIDI)}が下限です`}
            {settings.minMidi === MIN_MIDI && settings.maxMidi === MAX_MIDI
              ? " / "
              : ""}
            {settings.maxMidi === MAX_MIDI &&
              `最高音は${midiToName(MAX_MIDI)}が上限です`}
          </div>
        )}
      </section>

      {/* ===== 出題 ===== */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        {q ? <ScoreSvg midi={q.midi} /> : "Loading..."}
      </div>

      {/* ===== 回答 ===== */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          答えを選んでください
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PianoKeyboard
            onPick={answer}
            disabled={!q || !!result}
            baseMidi={60} // C4開始（今は固定）
          />
        </div>

        {/* ===== 結果 ===== */}
        {result && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {result.correct ? "✅ 正解" : "❌ 不正解"}
            </div>

            {!result.correct && (
              <div style={{ marginTop: 8 }}>
                正解：
                <b>{midiToName(result.correctMidi)}</b>／ あなた：
                {midiToLetter(result.answerMidi)}
              </div>
            )}

            <button
              onClick={() => nextQuestion()}
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            >
              次の問題
            </button>
          </div>
        )}
      </div>

      {/* ===== ナビ ===== */}
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href={`${base}/stats`}>成績を見る</Link>
        <Link href={`${base}/`}>トップへ</Link>
      </div>
    </main>
  );
}
