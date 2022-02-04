import { isValidDate } from "./testDate";

/**
 * Date Range
 **/
export interface DateRange {
  min: Date | null;
  max: Date | null;
}

export class DateRange {
  public min: Date | null = null;
  public max: Date | null = null;
  private dateMin: number[] = [];
  private dateMax: number[] = [];
  private minIsGreater = false;
  constructor(min: Date | null, max: Date | null) {
    if (min) {
      if (isValidDate(min)) {
        this.min = min;
        this.dateMin = toIndexDate(min);
      } else {
        this.dateMin = [];
        console.warn("new DateRange( min is invalid Date )");
      }
    }
    if (max) {
      if (isValidDate(max)) {
        this.max = max;
        this.dateMax = toIndexDate(max);
      } else {
        this.dateMax = [];
        console.warn("new DateRange( max is invalid Date )");
      }
    }
    if (this.min && this.max) {
      const test = compareDate(this.min, this.max);
      if (test === "greater") {
        console.warn("new DateRange( min is GREATER than max )");
        this.minIsGreater = true;
        this.min = new Date(this.max);
      }
    }
  }
  getIndexDateMin() {
    return this.dateMin;
  }
  getIndexDateMax() {
    return this.dateMax;
  }
  setMinDate(date: Date) {
    if (isValidDate(date)) {
      this.min = date;
      this.dateMin = toIndexDate(date);
    }
  }
  setMaxDate(date: Date) {
    if (isValidDate(date)) {
      this.max = date;
      this.dateMax = toIndexDate(date);
    }
  }
  compareMinDate(date: Date) {
    if (this.min) {
      return compareDate(this.min, date);
    } else {
      return null;
    }
  }
  compareMaxDate(date: Date) {
    if (this.max) {
      return compareDate(this.max, date);
    } else {
      return null;
    }
  }
  isMinGreater() {
    return this.minIsGreater;
  }
  isValidRange() {
    return this.min !== null && this.max !== null;
  }
}

function toIndexDate(date: Date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()];
}
function toTime(date: Date) {
  const clone = new Date(date);
  const y = clone.getFullYear();
  const m = clone.getMonth();
  const d = clone.getDate();
  return new Date(y, m, d).getTime();
}

export function compareDate(_x: Date, _y: Date) {
  const x = toTime(_x);
  const y = toTime(_y);
  switch (true) {
    case x === y:
      return "equal";
    case x > y:
      return "greater";
    case x < y:
      return "less";
    default:
      return "error";
  }
}

export function isValidRange(range: any) {
  let hasMin = "min" in range;
  let hasMax = "max" in range;

  if (!hasMin || !hasMax) return false;
  let minIsValid = range.min instanceof Date || range.min === null;
  let maxIsValid = range.max instanceof Date || range.max === null;
  if (!minIsValid || !maxIsValid) return false;
  return true;
}
