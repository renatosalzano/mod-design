import {
  Dispatch,
  KeyboardEvent,
  MutableRefObject,
  ReactElement,
  SetStateAction,
} from "react";
import { IndexChip as IC, HandleChip } from "./inputChips";

export type RE = ReactElement;
export type SetOption = (option: any) => { label: string; value: any };
export type HandleOptionClick = (
  label: string,
  value: any,
  _index: number,
) => void;
export type IndexChip = IC;
export interface IndexOption {
  [key: number]: {
    focus: () => void;
    blur: () => void;
    select: () => void;
    unselect: () => void;
  };
}

export interface RenderData {
  select: string;
  multiple: string[];
}

export interface IndexValue {
  valid: any[];
  invalid: any[];
}

export interface SelectCore {
  value: any | null;
  options?: any[];
  emptyOptionLabel?: string;
  noOptionLabel?: string;
  multiple?: boolean;
  disabledValues?: any[];
  setOption: SetOption;
  setRenderChips: Dispatch<SetStateAction<string[]>>;
  onChange: (value: any | null) => any;
}

export type UseSelectCore = (arg: SelectCore) => {
  list: boolean;
  listRef: MutableRefObject<HTMLUListElement | null>;
  renderLabel: string;
  optionList: any[];
  indexPrev: number;
  indexMultiple: number[];
  indexOption: IndexOption;
  indexChip: IndexChip;
  setList: Dispatch<SetStateAction<boolean>>;
  handleKeyboard: (event: KeyboardEvent) => void;
  handleOptionClick: HandleOptionClick;
  handleChipClick: HandleChip;
};
