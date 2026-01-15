// app/chords/ChordScoreSvg.tsx
import {
  ledgerLineStepsForTreble,
  trebleStepFromMidiWithAccidental,
} from "@/lib/quiz/staff";
import { basePath } from "@/lib/quiz/paths";

type Props = {
  midis: number[];
  width?: number;
  height?: number;
};

export default function ChordScoreSvg({
  midis,
  width = 350,
  height = 180,
}: Props) {
  const padding = 16;
  const staffLeft = 64;
  const staffRight = width - 16;
  const staffWidth = staffRight - staffLeft;

  const lineGap = 14;
  const stepH = lineGap / 2;
  const yBottomLine = padding + 120;
  const xNote = staffLeft + staffWidth * 0.62;

  const sorted = [...midis].sort((a, b) => a - b);
  const notes = sorted.map((m) => trebleStepFromMidiWithAccidental(m));

  const staffLinesY = Array.from(
    { length: 5 },
    (_, i) => yBottomLine - i * lineGap
  );

  const ledgerSteps = new Set<number>();
  for (const note of notes) {
    for (const s of ledgerLineStepsForTreble(note.step)) ledgerSteps.add(s);
  }

  const ledgerLines = [...ledgerSteps].map((s) => ({
    y: yBottomLine - s * stepH,
  }));

  const clefW = 100;
  const clefH = 100;
  const clefX = staffLeft - 20;
  const clefY = yBottomLine - 5 * lineGap - 10;

  const stepOrder = notes
    .map((note, i) => ({ step: note.step, i }))
    .sort((a, b) => a.step - b.step);

  const xOffsets = new Map<number, number>();
  let idx = 0;
  while (idx < stepOrder.length) {
    let end = idx;
    while (
      end + 1 < stepOrder.length &&
      stepOrder[end + 1].step - stepOrder[end].step === 1
    ) {
      end += 1;
    }

    if (end === idx) {
      xOffsets.set(stepOrder[idx].i, 0);
    } else {
      for (let j = idx; j <= end; j++) {
        const offset = (j - idx) % 2 === 1 ? 16 : 0;
        xOffsets.set(stepOrder[j].i, offset);
      }
    }
    idx = end + 1;
  }
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="score"
    >
      <rect x="0" y="0" width={width} height={height} fill="white" />

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

      <image
        href={`${basePath}/treble_clef.svg`}
        x={clefX}
        y={clefY}
        width={clefW}
        height={clefH}
        preserveAspectRatio="xMidYMid meet"
      />

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

      {notes.map((note, i) => {
        const yNote = yBottomLine - note.step * stepH;
        const x = xNote + (xOffsets.get(i) ?? 0);
        return (
          <g key={`${note.step}-${i}`}>
            {note.accidental && (
              <text
                x={x - 22 - (xOffsets.get(i) ?? 0)}
                y={yNote + 8.5}
                fontSize={24}
                fontFamily="serif"
              >
                {note.accidental}
              </text>
            )}
            <ellipse
              cx={x}
              cy={yNote}
              rx={9}
              ry={7}
              fill="black"
              transform={`rotate(-20 ${x} ${yNote})`}
            />
          </g>
        );
      })}
    </svg>
  );
}
