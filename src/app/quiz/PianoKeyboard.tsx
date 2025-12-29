"use client";

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

  // レイアウト定数（好みで調整）
  const whiteW = 56;
  const whiteH = 170;
  const blackW = 34;
  const blackH = 105;

  // 黒鍵の横位置：白鍵の中心あたりに配置して「間」に見せる
  // whiteIndex の右寄りに置くため、+ whiteW*0.68 くらいを足す
  const blackX = (whiteIndex: number) =>
    whiteIndex * whiteW + whiteW * 0.68 - blackW / 2;

  return (
    <div
      style={{
        position: "relative",
        width: whiteW * whiteKeys.length,
        height: whiteH,
        userSelect: "none",
      }}
    >
      {/* 白鍵（下段） */}
      <div style={{ display: "flex" }}>
        {whiteKeys.map((k) => (
          <button
            key={k.midi}
            onClick={() => onPick(k.midi)}
            disabled={disabled}
            title={midiToName(k.midi)}
            style={{
              width: whiteW,
              height: whiteH,
              border: "1px solid #333",
              borderRight: "none",
              background: "white",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>{k.label}</span>
          </button>
        ))}
        {/* 右端の枠線を戻す（最後だけ） */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 1,
            height: whiteH,
            background: "#333",
          }}
        />
      </div>

      {/* 黒鍵（上段・絶対配置） */}
      {blackKeys.map((k) => (
        <button
          key={k.midi}
          onClick={() => onPick(k.midi)}
          disabled={disabled}
          title={midiToName(k.midi)}
          style={{
            position: "absolute",
            left: blackX(k.whiteIndex),
            top: 0,
            width: blackW,
            height: blackH,
            border: "1px solid #111",
            background: "#111",
            color: "white",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 10,
          }}
        >
          <span style={{ fontSize: 12 }}>{k.label}</span>
        </button>
      ))}
    </div>
  );
}
