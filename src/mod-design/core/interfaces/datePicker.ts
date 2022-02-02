import { Dispatch, ReactElement, SetStateAction } from "react";

export type RE = ReactElement;
type Mode = "year" | "month" | "day";
export interface IndexDate {
  curr: { year: number; month: number; day: number };
  next: { year: number; month: number };
}
interface MinMax {
  min: number;
  max: number;
}
export interface IndexRange {
  curr: { year: MinMax; month: MinMax; day: MinMax };
  next: { year: MinMax };
}

export interface ContentElement {
  year: { curr: RE[]; next: RE[] };
  month: { curr: RE[]; next: RE[] };
  day: RE[];
}

export interface IndexButton {
  curr: { year: string; month: string; day: string };
  next: { year: string; month: string };
}

export interface SetContent {
  mode: ((content: Mode) => void) | null;
  content: ((content: RE[]) => void) | null;
  button: ((content: string) => void) | null;
  header: ((content: string) => void) | null;
}

export interface IndexSelector {
  year: { [key: string]: { focus: () => void; blur: () => void } };
  month: { [key: string]: { focus: () => void; blur: () => void } };
  day: { [key: string]: { focus: () => void; blur: () => void } };
}

export interface ActiveSelector {
  prev: { year: string; month: string; day: string };
  curr: { year: string; month: string; day: string };
  next: { year: string; month: string };
}

export interface SetIndex {
  year: (year: number) => void;
  month: (year: number, month: number) => void;
  day: ({ year, month, day }: any) => void;
}

export interface RenderContent {
  year: () => void;
  month: () => void;
  day: () => void;
}

export interface Scroll {
  year: (prev?: any) => void;
  month: (year: number) => void;
  day: (
    _year: number,
    _month: number,
  ) => {
    lastDay: number;
    year: number;
    month: number;
  };
}

export type Key =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Escape"
  | "Enter"
  | null;
