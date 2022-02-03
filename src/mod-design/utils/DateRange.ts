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
  private dateMin: { year: number; month: number; day: number } = {
    year: 0,
    month: 0,
    day: 1,
  };
  private dateMax: { year: number; month: number; day: number } = {
    year: 0,
    month: 0,
    day: 1,
  };
  constructor(min: Date | null, max: Date | null) {
    this.min = min;
    this.max = max;
    if (min) {
      if (isValidDate(min)) {
        const minDate = min;
        this.dateMin = toIndexDate(minDate);
      }
    }
    if (max) {
      if (isValidDate(max)) {
        const maxDate = max;
        this.dateMax = toIndexDate(maxDate);
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
    if (isValidDate(date)) this.min = date;
  }
  setMaxDate(date: Date) {
    if (isValidDate(date)) this.max = date;
  }
}

function toIndexDate(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

export function isValidDateRange(value: DateRange) {
  return isValidDate(value.min) && isValidDate(value.max);
}
