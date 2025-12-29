export function midiToName(midi: number) {
  const names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ] as const;
  const name = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function midiToLetter(midi: number) {
  // ボタン表示用（C D E F G A B）
  const n = midiToName(midi);
  return n
    .replace(/[0-9-]/g, "")
    .replace("#", "♯")
    .replace("b", "♭");
}
