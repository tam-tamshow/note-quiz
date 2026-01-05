"use client";

import type { CSSProperties } from "react";
import { midiToName } from "@/lib/quiz/music";

type Props = {
  onPick: (midi: number) => void;
  disabled?: boolean;
  baseMidi?: number; // 60 = C4
};

/**
 * 1オクターブ（C〜B）の配置定義
 * whiteIndex: 白鍵（C D E F G A B）の何番目の上に黒鍵が来るか
 * 例: C# は C(0)とD(1)の間なので whiteIndex=0 側に寄せる
 */
const WHITE = [
  { name: "C", offset: 0 },
  { name: "D", offset: 2 },
  { name: "E", offset: 4 },
  { name: "F", offset: 5 },
  { name: "G", offset: 7 },
  { name: "A", offset: 9 },
  { name: "B", offset: 11 },
] as const;

const BLACK = [
  { name: "C#", offset: 1, whiteIndex: 0 },
  { name: "D#", offset: 3, whiteIndex: 1 },
  // E# は無い
  { name: "F#", offset: 6, whiteIndex: 3 },
  { name: "G#", offset: 8, whiteIndex: 4 },
  { name: "A#", offset: 10, whiteIndex: 5 },
  // B# は無い
] as const;

export default function PianoKeyboard({
  onPick,
  disabled,
  baseMidi = 60,
}: Props) {
  const whiteKeys = WHITE.map((k) => ({
    midi: baseMidi + k.offset,
    label: k.name.replace("#", "♯"),
  }));

  const blackKeys = BLACK.map((k) => ({
    midi: baseMidi + k.offset,
    label: k.name.replace("#", "♯"),
    whiteIndex: k.whiteIndex,
  }));

  return (
    <div
      className="piano"
      style={
        {
          "--white-count": whiteKeys.length,
        } as CSSProperties
      }
    >
      {/* 白鍵（下段） */}
      <div className="white-keys">
        {whiteKeys.map((k) => (
          <button
            key={k.midi}
            onClick={() => onPick(k.midi)}
            disabled={disabled}
            title={midiToName(k.midi)}
            className="white-key"
          >
            <span className="white-key-label">{k.label}</span>
          </button>
        ))}
        {/* 右端の枠線を戻す（最後だけ） */}
        <div className="white-right-border" />
      </div>

      {/* 黒鍵（上段・絶対配置） */}
      {blackKeys.map((k) => (
        <button
          key={k.midi}
          onClick={() => onPick(k.midi)}
          disabled={disabled}
          title={midiToName(k.midi)}
          className="black-key"
          style={{
            left: `calc(var(--white-w) * (${k.whiteIndex} + 0.68) - var(--black-w) / 2)`,
          }}
        >
          <span className="black-key-label">{k.label}</span>
        </button>
      ))}
      <style jsx>{`
        .piano {
          position: relative;
          width: 100%;
          max-width: 392px;
          height: var(--white-h);
          user-select: none;
          --white-w: calc(100% / var(--white-count));
          --white-h: clamp(120px, 32vw, 170px);
          --black-w: calc(var(--white-w) * 0.6);
          --black-h: calc(var(--white-h) * 0.62);
        }

        .white-keys {
          display: flex;
        }

        .white-key {
          flex: 1 1 0;
          height: var(--white-h);
          border: 1px solid #333;
          border-right: none;
          background: white;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 10px;
        }

        .white-key-label {
          font-size: 14px;
          color: #888;
        }

        .white-right-border {
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
          height: var(--white-h);
          background: #333;
        }

        .black-key {
          position: absolute;
          top: 0;
          width: var(--black-w);
          height: var(--black-h);
          border: 1px solid #111;
          background: #111;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 10px;
        }

        .black-key-label {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
