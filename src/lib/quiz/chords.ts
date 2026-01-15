export type ChordType = {
  id: string;
  label: string;
  suffix: string;
  intervals: number[];
};

export const CHORD_TYPES: ChordType[] = [
  { id: "maj", label: "メジャー", suffix: "", intervals: [0, 4, 7] },
  { id: "min", label: "マイナー", suffix: "m", intervals: [0, 3, 7] },
];

const WHITE_ROOTS = [0, 2, 4, 5, 7, 9, 11] as const;

export function whiteRootPitchClasses(): number[] {
  return [...WHITE_ROOTS];
}

export function rootPcToLetter(pc: number): string {
  switch (((pc % 12) + 12) % 12) {
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
      return "C";
  }
}

export function formatChordName(rootPc: number, typeId: string): string {
  const type = CHORD_TYPES.find((t) => t.id === typeId);
  const suffix = type?.suffix ?? "";
  return `${rootPcToLetter(rootPc)}${suffix}`;
}

export function buildChordId(rootPc: number, typeId: string): string {
  return `${((rootPc % 12) + 12) % 12}:${typeId}`;
}

export function getEnabledChordTypes(ids: string[]): ChordType[] {
  const set = new Set(ids);
  const types = CHORD_TYPES.filter((t) => set.has(t.id));
  return types.length > 0 ? types : CHORD_TYPES;
}
