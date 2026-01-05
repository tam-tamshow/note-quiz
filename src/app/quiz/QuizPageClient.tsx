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
const WHITE_MIDI = new Map([
  ["C", 0],
  ["D", 2],
  ["E", 4],
  ["F", 5],
  ["G", 7],
  ["A", 9],
  ["B", 11],
]);

type Result = {
  answered: true;
  correct: boolean;
  correctMidi: number;
  answerMidi: number;
} | null;

export default function QuizPageClient() {
  const initialSettings = loadSettings();
  const [settings, setSettings] = useState<QuizSettings>(() => initialSettings); // 初期値を関数で設定
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts()); // 初期値を関数で設定
  const [minInput, setMinInput] = useState(() =>
    midiToName(initialSettings.minMidi)
  );
  const [maxInput, setMaxInput] = useState(() =>
    midiToName(initialSettings.maxMidi)
  );
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [q, setQ] = useState<Question | null>(() =>
    generateQuestion(initialSettings, loadAttempts())
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

  function parseWhiteNote(value: string): number | null {
    const trimmed = value.trim().toUpperCase();
    const match = trimmed.match(/^([A-G])(-?\d+)$/);
    if (!match) return null;
    const pc = WHITE_MIDI.get(match[1]);
    if (pc === undefined) return null;
    const octave = Number(match[2]);
    if (!Number.isFinite(octave)) return null;
    return (octave + 1) * 12 + pc;
  }

  function applyNoteInput(
    value: string,
    kind: "min" | "max",
    setError: (msg: string | null) => void
  ) {
    const midi = parseWhiteNote(value);
    if (midi === null) {
      setError("C4 のように入力してください");
      return;
    }
    if (midi < MIN_MIDI || midi > MAX_MIDI) {
      setError(
        `${midiToName(MIN_MIDI)}〜${midiToName(MAX_MIDI)}の範囲で入力してください`
      );
      return;
    }
    setError(null);
    if (kind === "min") {
      updateSettings({ minMidi: midi });
    } else {
      updateSettings({ maxMidi: midi });
    }
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
    setMinInput(midiToName(next.minMidi));
    setMaxInput(midiToName(next.maxMidi));
    saveSettings(next);
    nextQuestion(next);
  }

  return (
    <main
      className="quiz-main"
      style={{ maxWidth: 430, margin: "24px auto", padding: 16, width: "100%" }}
    >
      <h1 className="quiz-title" style={{ fontSize: 28, fontWeight: 700 }}>
        Note Quiz
      </h1>

      {/* ===== 出題設定 ===== */}
      <details
        className="settings-accordion"
        style={{
          marginTop: 12,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <summary className="settings-summary">出題設定</summary>

        <div className="settings-body">
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 120 }}>最低音</span>
              <input
                type="text"
                inputMode="text"
                placeholder="C4"
                value={minInput}
                onChange={(e) => {
                  setMinInput(e.target.value);
                  setMinError(null);
                }}
                onBlur={() => applyNoteInput(minInput, "min", setMinError)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyNoteInput(minInput, "min", setMinError);
                  }
                }}
                style={{ width: 90 }}
              />
            </label>
            {minError && (
              <div style={{ fontSize: 12, color: "#8a2a2a" }}>{minError}</div>
            )}

            <label style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 120 }}>最高音</span>
              <input
                type="text"
                inputMode="text"
                placeholder="G5"
                value={maxInput}
                onChange={(e) => {
                  setMaxInput(e.target.value);
                  setMaxError(null);
                }}
                onBlur={() => applyNoteInput(maxInput, "max", setMaxError)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyNoteInput(maxInput, "max", setMaxError);
                  }
                }}
                style={{ width: 90 }}
              />
            </label>
            {maxError && (
              <div style={{ fontSize: 12, color: "#8a2a2a" }}>{maxError}</div>
            )}

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
        </div>
      </details>

      {/* ===== 出題 ===== */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <div className="score-wrap">
          {q ? <ScoreSvg midi={q.midi} /> : "Loading..."}
        </div>
      </div>

      {/* ===== 回答 ===== */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          答えを選んでください
        </div>

        <div className="keyboard-wrap">
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
      <style jsx>{`
        .quiz-main {
          padding: 16px;
        }

        .score-wrap {
          width: 100%;
          max-width: 350px;
          margin: 0 auto;
        }

        .score-wrap :global(svg) {
          width: 100%;
          height: auto;
          display: block;
        }

        .keyboard-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        @media (max-width: 520px) {
          .quiz-main {
            margin: 12px auto;
            padding: 12px;
          }

          .quiz-title {
            font-size: 24px;
          }
        }

        .settings-summary {
          font-weight: 700;
          cursor: pointer;
          list-style: none;
        }

        .settings-summary::-webkit-details-marker {
          display: none;
        }

        .settings-summary::after {
          content: "▾";
          float: right;
          color: #555;
        }

        .settings-accordion[open] .settings-summary::after {
          content: "▴";
        }

        .settings-body {
          margin-top: 10px;
        }
      `}</style>
    </main>
  );
}
