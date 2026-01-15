// lib/quiz/staff.ts
export type Clef = "treble";

const LETTER_INDEX: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// 白鍵前提のmidi→レター（#無し）
function midiToWhiteLetter(midi: number): keyof typeof LETTER_INDEX {
  // C=0, D=2, E=4, F=5, G=7, A=9, B=11
  const pc = ((midi % 12) + 12) % 12;
  switch (pc) {
    case 0:
      return "C";
    case 2:
      return "D";
    case 4:
      return "E";
    case 5:
      return "F";
    case 7:
      return "G";
    case 9:
      return "A";
    case 11:
      return "B";
    default:
      // 今は白鍵のみ出題なので来ない想定
      return "C";
  }
}

function midiToOctave(midi: number) {
  return Math.floor(midi / 12) - 1; // 60(C4) => 4
}

/**
 * ト音記号: 下の線(E4)を step=0 とする。
 * step は 1増えるごとに「線/間」が1つ上がる（= 半音ではなく“音名の段”）。
 * 例: E4(step0), F4(step1), G4(step2)...
 */
export function trebleStepFromMidi(midi: number): number {
  const letter = midiToWhiteLetter(midi);
  const octave = midiToOctave(midi);

  const diatonic = octave * 7 + LETTER_INDEX[letter];
  const baseE4 = 4 * 7 + LETTER_INDEX["E"]; // E4
  return diatonic - baseE4;
}

type Accidental = "#" | "b" | null;

const PC_TO_STEP: { letter: keyof typeof LETTER_INDEX; accidental: Accidental }[] =
  [
    { letter: "C", accidental: null },
    { letter: "C", accidental: "#" },
    { letter: "D", accidental: null },
    { letter: "D", accidental: "#" },
    { letter: "E", accidental: null },
    { letter: "F", accidental: null },
    { letter: "F", accidental: "#" },
    { letter: "G", accidental: null },
    { letter: "G", accidental: "#" },
    { letter: "A", accidental: null },
    { letter: "A", accidental: "#" },
    { letter: "B", accidental: null },
  ];

export function trebleStepFromMidiWithAccidental(midi: number): {
  step: number;
  accidental: Accidental;
} {
  const pc = ((midi % 12) + 12) % 12;
  const mapping = PC_TO_STEP[pc];
  const octave = midiToOctave(midi);
  const diatonic = octave * 7 + LETTER_INDEX[mapping.letter];
  const baseE4 = 4 * 7 + LETTER_INDEX["E"];
  return { step: diatonic - baseE4, accidental: mapping.accidental };
}

/**
 * staff steps: 0..8 が五線内
 * step0=E4(下線), step8=F5(上線)
 */
export function ledgerLineStepsForTreble(step: number): number[] {
  const lines: number[] = [];
  const min = 0;
  const max = 8;

  if (step < min) {
    // 0より下は 0, -2, -4... の「線」の位置に加線
    for (let s = 0; s >= step; s -= 2) lines.push(s);
  } else if (step > max) {
    // 8より上は 8, 10, 12... の「線」の位置に加線
    for (let s = 8; s <= step; s += 2) lines.push(s);
  }
  return lines;
}
