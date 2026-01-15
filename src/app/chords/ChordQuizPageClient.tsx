"use client";

import { useState } from "react";
import Link from "next/link";

import ChordScoreSvg from "./ChordScoreSvg";

import { basePath } from "@/lib/quiz/paths";
import {
  CHORD_TYPES,
  formatChordName,
} from "@/lib/quiz/chords";
import {
  loadChordSettings,
  saveChordSettings,
  type ChordQuizSettings,
  MIN_MIDI,
  MAX_MIDI,
} from "@/lib/quiz/chordSettings";
import {
  loadChordAttempts,
  saveChordAttempt,
  type ChordAttempt,
} from "@/lib/quiz/chordStorage";
import {
  generateChordQuestion,
  listChordAnswerIds,
  type ChordQuestion,
} from "@/lib/quiz/chordGenerator";
import { midiToName } from "@/lib/quiz/music";

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
  correctChordId: string;
  answerChordId: string;
} | null;

export default function ChordQuizPageClient() {
  const initialSettings = loadChordSettings();
  const [settings, setSettings] = useState<ChordQuizSettings>(
    () => initialSettings
  );
  const [attempts, setAttempts] = useState<ChordAttempt[]>(() =>
    loadChordAttempts()
  );
  const [minInput, setMinInput] = useState(() =>
    midiToName(initialSettings.minMidi)
  );
  const [maxInput, setMaxInput] = useState(() =>
    midiToName(initialSettings.maxMidi)
  );
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [q, setQ] = useState<ChordQuestion | null>(() =>
    generateChordQuestion(initialSettings, loadChordAttempts())
  );
  const [result, setResult] = useState<Result>(null);

  function nextQuestion(nextSettings?: ChordQuizSettings) {
    const s = nextSettings ?? settings;
    const a = loadChordAttempts();
    setAttempts(a);
    setQ(generateChordQuestion(s, a));
    setResult(null);
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

  function answer(answerChordId: string) {
    if (!q) return;
    const correct = answerChordId === q.chordId;

    saveChordAttempt({
      questionId: q.id,
      questionChordId: q.chordId,
      questionRootMidi: q.rootMidi,
      answerChordId,
      correct,
    });

    const a = loadChordAttempts();
    setAttempts(a);

    setResult({
      answered: true,
      correct,
      correctChordId: q.chordId,
      answerChordId,
    });
  }

  function updateSettings(patch: Partial<ChordQuizSettings>) {
    const next: ChordQuizSettings = { ...settings, ...patch };

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

    if (!next.enabledChordTypeIds || next.enabledChordTypeIds.length === 0) {
      next.enabledChordTypeIds = settings.enabledChordTypeIds;
    }

    setSettings(next);
    setMinInput(midiToName(next.minMidi));
    setMaxInput(midiToName(next.maxMidi));
    saveChordSettings(next);
    nextQuestion(next);
  }

  const availableTypes = CHORD_TYPES;
  const answerOptions = listChordAnswerIds(settings).map((id) => {
    const [pcRaw, typeId] = id.split(":");
    const pc = Number(pcRaw);
    return { id, label: formatChordName(pc, typeId) };
  });

  return (
    <main
      className="quiz-main"
      style={{ maxWidth: 480, margin: "24px auto", padding: 16, width: "100%" }}
    >
      <h1 className="quiz-title" style={{ fontSize: 28, fontWeight: 700 }}>
        Chord Quiz
      </h1>

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

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 120 }}>コード種類</span>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {availableTypes.map((type) => {
                  const checked = settings.enabledChordTypeIds.includes(type.id);
                  const disableToggle =
                    checked && settings.enabledChordTypeIds.length <= 1;
                  return (
                    <label key={type.id} style={{ display: "flex", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disableToggle}
                        onChange={(e) => {
                          const nextIds = new Set(settings.enabledChordTypeIds);
                          if (e.target.checked) {
                            nextIds.add(type.id);
                          } else {
                            nextIds.delete(type.id);
                          }
                          updateSettings({
                            enabledChordTypeIds: [...nextIds],
                          });
                        }}
                      />
                      <span>{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

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

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
        }}
      >
        <div className="score-wrap">
          {q ? <ChordScoreSvg midis={q.notes} /> : "Loading..."}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          和音名を選んでください
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {answerOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => answer(opt.id)}
              disabled={!q || !!result}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                minWidth: 64,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

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
                <b>
                  {formatChordName(
                    Number(result.correctChordId.split(":")[0]),
                    result.correctChordId.split(":")[1]
                  )}
                </b>
                ／ あなた：
                {formatChordName(
                  Number(result.answerChordId.split(":")[0]),
                  result.answerChordId.split(":")[1]
                )}
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

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href={`${basePath}/quiz`}>単音クイズへ</Link>
        <Link href={`${basePath}/chords/stats`}>成績を見る</Link>
        <Link href={`${basePath}/`}>トップへ</Link>
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
