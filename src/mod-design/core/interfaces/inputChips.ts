export type HandleChip = (value: string, index: number) => any;
export type IndexChip = {
  [key: number]: { focus: () => void; blur: () => void };
};
export type FocusChip = (indexPrev: number | null, indexCurr: number) => void;
