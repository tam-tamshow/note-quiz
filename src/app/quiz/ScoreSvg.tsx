// app/quiz/ScoreSvg.tsx
import { ledgerLineStepsForTreble, trebleStepFromMidi } from "@/lib/quiz/staff";
import { basePath } from "@/lib/quiz/paths";

type Props = {
  midi: number;
  width?: number;
  height?: number;
};

export default function ScoreSvg({ midi, width = 350, height = 180 }: Props) {
  // レイアウト定数
  const padding = 16;
  const staffLeft = 64;
  const staffRight = width - 16;
  const staffWidth = staffRight - staffLeft;

  const lineGap = 14; // 線と線の間隔
  const stepH = lineGap / 2; // 線/間（段）ごとの高さ
  const yBottomLine = padding + 120; // 下の線のY
  const xNote = staffLeft + staffWidth * 0.62;

  const step = trebleStepFromMidi(midi);
  const yNote = yBottomLine - step * stepH;

  // 五線の線Y（下から5本）
  const staffLinesY = Array.from(
    { length: 5 },
    (_, i) => yBottomLine - i * lineGap
  );

  // 加線
  const ledgerSteps = ledgerLineStepsForTreble(step);
  const ledgerLines = ledgerSteps.map((s) => ({
    y: yBottomLine - s * stepH,
  }));

  const clefW = 100; // 幅（好みで調整）
  const clefH = 100; // 高さ（好みで調整）
  const clefX = staffLeft - 20;
  const clefY = yBottomLine - 5 * lineGap - 10; // だいたい中央寄せ（好みで調整）
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="score"
    >
      {/* 背景 */}
      <rect x="0" y="0" width={width} height={height} fill="white" />

      {/* 五線 */}
      {staffLinesY.map((y, idx) => (
        <line
          key={idx}
          x1={staffLeft}
          x2={staffRight}
          y1={y}
          y2={y}
          stroke="black"
          strokeWidth="1"
        />
      ))}

      {/* ト音記号 */}
      <image
        href={`${basePath}/treble_clef.svg`}
        x={clefX}
        y={clefY}
        width={clefW}
        height={clefH}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* 加線 */}
      {ledgerLines.map((l, i) => (
        <line
          key={i}
          x1={xNote - 18}
          x2={xNote + 18}
          y1={l.y}
          y2={l.y}
          stroke="black"
          strokeWidth="1"
        />
      ))}

      {/* 音符ヘッド */}
      <ellipse
        cx={xNote}
        cy={yNote}
        rx={9}
        ry={7}
        fill="black"
        transform={`rotate(-20 ${xNote} ${yNote})`}
      />

      {/* 参考：ノート位置のガイド（慣れたら消してOK） */}
      {/* <circle cx={xNote} cy={yNote} r={2} fill="red" /> */}
    </svg>
  );
}
