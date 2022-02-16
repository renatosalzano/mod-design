import { compareDate, DateX, isValidDate } from "./DateX";

/**
 * Date Range
 **/
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export class DateRange {
  public start: Date | null = null;
  public end: Date | null = null;
  private indexStart: number[] = [];
  private indexEnd: number[] = [];
  private startIsGreater = false;
  constructor(start: Date | null, end: Date | null) {
    if (start) {
      if (isValidDate(start)) {
        this.start = start;
        this.indexStart = toIndexDate(start);
      } else {
        this.indexStart = [];
        console.warn("new DateRange( start is invalid Date )");
      }
    }
    if (end) {
      if (isValidDate(end)) {
        this.end = end;
        this.indexEnd = toIndexDate(end);
      } else {
        this.indexEnd = [];
        console.warn("new DateRange( end is invalid Date )");
      }
    }
  }
  getRange() {
    return { start: this.start, end: this.end };
  }
  getIndexStart() {
    return this.indexStart;
  }
  getIndexEnd() {
    return this.indexEnd;
  }
  setStart(date: Date) {
    if (isValidDate(date)) {
      this.start = date;
      this.indexStart = toIndexDate(date);
    }
  }
  setEnd(date: Date) {
    if (isValidDate(date)) {
      this.end = date;
      this.indexEnd = toIndexDate(date);
    }
  }
  resetStart() {
    this.start = null;
    this.indexStart = [];
  }
  resetMaxDate() {
    this.end = null;
    this.indexEnd = [];
  }
  compareMinDate(date: Date) {
    if (this.start) {
      return compareDate(this.start, date);
    } else {
      return null;
    }
  }
  compareMaxDate(date: Date) {
    if (this.end) {
      return compareDate(this.end, date);
    } else {
      return null;
    }
  }
  isMinGreater() {
    return this.startIsGreater;
  }

  isValidRange() {
    return this.start !== null && this.end !== null;
  }
}

function toIndexDate(date: Date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

export function toDateRange(range: any) {
  if (isValidRange(range)) {
    return new DateRange(range.start, range.end);
  } else {
    return new DateRange(null, null);
  }
}

export function isValidRange(range: any) {
  if (range) {
    let hasStart = "start" in range;
    let hasEnd = "end" in range;

    if (!hasStart || !hasEnd) return false;
    let startIsValid = range.start instanceof Date || range.start === null;
    let endIsValid = range.end instanceof Date || range.end === null;
    if (!startIsValid || !endIsValid) return false;
    return true;
  } else {
    return false;
  }
}

export function checkIsRange(range: any) {
  if (range) {
    let hasMin = "start" in range;
    let hasMax = "end" in range;

    if (!hasMin || !hasMax) return "not range";
    let minIsValid = range.start instanceof Date || range.start === null;
    let maxIsValid = range.end instanceof Date || range.end === null;
    if (!minIsValid || !maxIsValid) return "not range";
    return "is range";
  } else {
    return "not range";
  }
}

export function toRange(value: any): { start: Date | null; end: Date | null } {
  return { start: value.start, end: value.end };
}

export function checkRange(
  range: { start: Date | null; end: Date | null },
  minDate: Date | null = null,
  maxDate: Date | null = null,
) {
  let error = "";
  let invalidRange = false;
  let startLessMinDate = false;
  let startGreaterMaxDate = false;
  let endLessMinDate = false;
  let endGreaterMaxDate = false;
  let errorMessage: string[] = [];
  const minRange = range.start ? new DateX(range.start) : null;
  const maxRange = range.end ? new DateX(range.end) : null;
  const minDateString = minDate ? minDate.toLocaleDateString() : "";
  const maxDateString = maxDate ? maxDate.toLocaleDateString() : "";
  if (minRange && maxRange) {
    switch (minRange.compare(maxRange)) {
      case "greater":
      case "equal":
        errorMessage.push(`Start Date must be less than End Date`);
        invalidRange = true;
    }
  }
  if (minRange) {
    switch (minRange.compareInRange(minDate, maxDate)) {
      case "less min":
        errorMessage.push(`Start Date must be greater than ${minDateString}`);
        startLessMinDate = true;
        break;
      case "greater max":
        startGreaterMaxDate = true;
        errorMessage.push(`Start Date must be less than ${maxDateString}`);
        break;
    }
  }
  if (maxRange) {
    switch (maxRange.compareInRange(minDate, maxDate)) {
      case "less min":
        endLessMinDate = true;
        errorMessage.push(`End Date must be greater than ${minDateString}`);
        break;
      case "greater max":
        endGreaterMaxDate = true;
        errorMessage.push(`End Date must be less than ${maxDateString}`);
        break;
    }
  }
  if (errorMessage.length > 0) {
    errorMessage.forEach((message, index) => {
      if (index < errorMessage.length) {
        error += `${message}\n`;
      } else {
        error += message;
      }
    });
  }
  return {
    error,
    invalidRange,
    startGreaterMaxDate,
    startLessMinDate,
    endLessMinDate,
    endGreaterMaxDate,
  };
}
