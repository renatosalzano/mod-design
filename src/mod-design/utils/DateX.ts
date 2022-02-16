/* eslint-disable no-extend-native */
interface IndexDate {
  year: number;
  month: number;
  day: number;
}

type Path = "start" | "middle" | "end" | "single" | "single-disabled" | undefined;

interface Item {
  type: "day" | "month" | "year";
  label: string | number;
  key: string;
  index: string;
  value: Date | number;
  disabled?: boolean;
  path?: Path;
}

export interface DateX extends Date {}

export class DateX extends Date {
  getIndexDate() {
    if (valid(this)) return toIndexDate(this);
    return { year: NaN, month: NaN, day: NaN };
  }
  compare(date: Date | null) {
    if (!valid(this)) return "Invalid Date";
    if (date) {
      return compareDate(this, date);
    } else {
      return null;
    }
  }

  isValid() {
    return isValidDate(this);
  }
  getYM() {
    const { year, month } = toIndexDate(this);
    return new Date(year, month, 1, 0, 0, 0, 0);
  }
  getDayInMonth(date: Date | null = null) {
    let _date = date ? date : this;
    const { year, month } = toIndexDate(_date);
    const lastDay = new Date(year, month + 1, 0).getDate();
    return lastDay;
  }
  setYM(year: number, month: number, minDate: Date | null = null, maxDate: Date | null = null) {
    const { day } = toIndexDate(this);
    const newDate = new DateX(year, month, day);
    switch (newDate.compareInRange(minDate, maxDate)) {
      case "less min":
        return new DateX(minDate as Date).setD(day);
      case "greater max":
        return new DateX(maxDate as Date).setD(day);
      default:
        return newDate;
    }
  }
  setD(day: number) {
    const { year, month } = toIndexDate(this);
    return new DateX(year, month, day);
  }
  updateDate(y: number = 0, m: number = 0, d: number = 0) {
    const { year, month, day } = toIndexDate(this);
    return new DateX(year + y, month + m, day + d);
  }
  setDateX(y: number | null, m: number | null, d: number | null) {
    const { year, month, day } = toIndexDate(this);
    const _year = y !== null ? y : year;
    const _month = m !== null ? m : month;
    const _day = d !== null ? d : day;
    return new DateX(_year, _month, _day);
  }

  yearInRange(start: number, end: number) {
    const { year } = toIndexDate(this);
    switch (true) {
      case year === start:
        return "start";
      case year > start || year < end:
        return "in range";
      case year === end:
        return "end";
      default:
        return "out range";
    }
  }
  compareInRange(minDate: Date | null = null, maxDate: Date | null = null) {
    if (!valid(this)) return "Invalid Date";
    const date = toTime(this);
    const min = minDate ? toTime(minDate) : null;
    const max = maxDate ? toTime(maxDate) : null;
    if (minDate && maxDate && !validRange(minDate, maxDate)) return "Invalid Range";
    switch (true) {
      case min && date < min:
        return "less min";
      case min && date === min:
        return "equal min";
      case min && max && date > min && date < max:
        return "in range";
      case max && date === max:
        return "equal max";
      case max && date > max:
        return "greater max";
      default:
        return "error";
    }
  }

  compareYear(year: number, date: Date) {
    return _compareYear(year, date);
  }
  compareMonth(x: Date, y: Date) {
    const { year, month } = toIndexDate(x);
    return _compareMonth(year, month, y);
  }
  getYearGridRange(gridSize: number) {
    let year = new Date(this).getFullYear();
    let gridStart = 0;
    let gridEnd = 0;
    for (let i = year + 0; i < year + gridSize; ++i) {
      if (i % gridSize === 0) {
        gridStart = i - gridSize;
        gridEnd = i;
        break;
      }
    }
    return { gridStart, gridEnd };
  }
  getYearContent(
    gridStart: number,
    gridEnd: number,
    minDate: Date | null = null,
    maxDate: Date | null = null,
    rangePath: {
      rangeStart: Date | null;
      rangeEnd: Date | null;
      rangeType: "start" | "end";
    },
  ) {
    const items: Item[] = [];
    for (let year = gridStart; year < gridEnd; ++year) {
      const { rangeStart, rangeEnd, rangeType } = rangePath;
      const yearString = year.toString();
      const type = "year";
      const value = year;
      const label = year;
      const key = yearString;
      const index = yearString;
      const path = getPathYear(year, rangeStart, rangeEnd, rangeType);
      let disabled = false;

      if (minDate && maxDate && !validRange(minDate, maxDate)) {
        minDate = null;
      }
      if (minDate && this.compareYear(year, minDate) === "less") {
        disabled = true;
      }
      if (maxDate && this.compareYear(year, maxDate) === "greater") {
        disabled = true;
      }

      items.push({ type, label, index, key, path, disabled, value });
    }
    const yearRangeString = `${gridStart} - ${gridEnd - 1}`;
    return { items, yearRangeString };
  }
  getMonthContent(
    months: string[],
    minDate: Date | null = null,
    maxDate: Date | null = null,
    rangePath: {
      rangeStart: Date | null;
      rangeEnd: Date | null;
      rangeType: "start" | "end";
    },
  ) {
    const { rangeStart, rangeEnd, rangeType } = rangePath;
    const items: Item[] = [];
    const year = new Date(this).getFullYear();
    const yearString = `${year}`;
    let arrowL = false;
    let arrowR = false;
    if (minDate) arrowL = new Date(year, 0, 0) < minDate;
    if (maxDate) arrowR = new Date(year + 1, 0, 1) > maxDate;
    for (let month = 0; month < 12; ++month) {
      const monthString = `${month}`.padStart(2, "0");
      const type = "month";
      const label = months[month];
      const index = monthString;
      const key = `${year}${monthString}`;
      const value = month;
      const path = getPathMonth(date(year, month), rangeStart, rangeEnd, rangeType);
      let disabled = false;
      if (minDate && maxDate && !validRange(minDate, maxDate)) {
        minDate = null;
      }
      if (minDate && this.compareMonth(new Date(year, month), minDate) === "less") {
        disabled = true;
      }
      if (maxDate && this.compareMonth(new Date(year, month), maxDate) === "greater") {
        disabled = true;
      }
      items.push({ type, label, key, path, index, value, disabled });
    }
    return { items, yearString, year, arrowL, arrowR };
  }
  getDayContent(
    dayOffset: number = 0,
    minDate: Date | null = null,
    maxDate: Date | null = null,
    rangePath: {
      rangeStart: Date | null;
      rangeEnd: Date | null;
      rangeType: "start" | "end";
    },
  ) {
    const { rangeStart, rangeEnd, rangeType } = rangePath;
    const days: Array<Item | null> = [];
    const { year, month } = toIndexDate(this);
    const date = new Date(year, month, 1);
    const offset = date.getDay() - dayOffset;
    const spaces = offset < 0 ? 7 + offset : offset;
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let index = 1; index <= lastDay + spaces; ++index) {
      if (index <= spaces) {
        days.push(null);
      } else {
        const day = index - spaces;
        const label = day;
        const value = new Date(year, month, day);
        const key = toStringDate(year, month, day).day;
        const path = getRangePath(value, rangeStart, rangeEnd, rangeType);

        let disabled = false;
        if (minDate && maxDate && !validRange(minDate, maxDate)) {
          minDate = null;
        }
        if (minDate && compareDate(value, minDate) === "less") {
          disabled = true;
        }
        if (maxDate && compareDate(value, maxDate) === "greater") {
          disabled = true;
        }
        switch (rangeType) {
          case "start":
            if (rangeEnd && compareDate(value, rangeEnd) === "equal") {
              disabled = true;
            }
            break;
          case "end":
            if (rangeStart && compareDate(value, rangeStart) === "equal") {
              disabled = true;
            }
            break;
        }
        days.push({
          type: "day",
          index: key,
          label,
          key,
          path,
          disabled,
          value,
        });
      }
    }
    return { items: days, year, month };
  }
  toStringIndex() {
    if (!valid(this)) return { year: "", month: "", day: "" };
    const { year, month, day } = toIndexDate(this);
    return toStringDate(year, month, day);
  }
  toObjectDigit() {
    const { year, month, day } = toIndexDate(this);
    const y = `${year}`.padStart(4, "0");
    const m = `${month + 1}`.padStart(2, "0");
    const d = `${day}`.padStart(2, "0");
    return { year: y, month: m, day: d };
  }
  toStringDigit() {
    const { year, month, day } = toIndexDate(this);
    const y = `${year}`.padStart(4, "0");
    const m = `${month + 1}`.padStart(2, "0");
    const d = `${day}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

function valid(date: Date) {
  if (isValidDate(date)) return true;
  console.warn("DateX:\nWARNING: invalid Date");
  return false;
}

function toIndexDate(date: Date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  return { year, month, day };
}

function date(y: number, m: number) {
  return new Date(y, m, 1);
}

function toStringDate(y: number, m: number, d: number) {
  const year = y.toString();
  const monthStr = `${m}`.padStart(2, "0");
  const dayStr = `${d}`.padStart(2, "0");
  const month = `${year}${monthStr}`;
  const day = `${year}${monthStr}${dayStr}`;
  return { year, month, day };
}

export function preventDayOverflow(year: number, month: number, day: number) {
  const y = `${year}`.padStart(4, "0");
  const m = `${month + 1}`.padStart(2, "0");
  const lastDay = new DateX(`${y}-${m}-01`).getDayInMonth();
  if (day > lastDay) {
    return indexToDateX(year, month, lastDay);
  }
  return indexToDateX(year, month, day);
}

export function isValidDate(date: any) {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      // ERROR
      return false;
    } else {
      return true;
    }
  } else return false;
}

export function indexToDateX(year: number, month: number, day: number) {
  const y = `${year}`.padStart(4, "0");
  const m = `${month + 1}`.padStart(2, "0");
  const d = `${day}`.padStart(2, "0");
  return new DateX(`${y}-${m}-${d}`);
}

function getRangePath(
  date: Date,
  start: Date | null = null,
  end: Date | null = null,
  type?: "start" | "end",
) {
  const min = start ? toTime(start) : null;
  const max = end ? toTime(end) : null;
  const now = toTime(date);
  switch (true) {
    case now === max && min === null:
      return "single-disabled";
    case now === min && max === null:
    case now === min && min === max:
      return "single";
    case now === min:
      return "start";
    case min && max && now > min && now < max:
      return "middle";
    case now === max:
      return "end";
  }
}
function getPathYear(
  year: number,
  start: Date | null = null,
  end: Date | null = null,
  type?: "start" | "end",
) {
  const min = start ? toYear(start) : null;
  const max = end ? toYear(end) : null;

  switch (true) {
    case year === max && min === null:
    case year === min && max === null:
    case year === min && min === max:
      return "single";
    case year === min:
      return "start";
    case min && max && year > min && year < max:
      return "middle";
    case year === max:
      return "end";
  }
}

function getRangeDate(minMaxDate: Date | null, rangeDate: Date | null) {
  switch (true) {
    case !minMaxDate && !rangeDate:
      return null;
    case rangeDate !== null:
      return rangeDate;
    default:
      return minMaxDate;
  }
}

function toYear(date: Date) {
  return new Date(date).getFullYear();
}

function getPathMonth(
  date: Date,
  start: Date | null = null,
  end: Date | null = null,
  type?: "start" | "end",
) {
  const min = start ? resetDay(start) : null;
  const max = end ? resetDay(end) : null;
  return getRangePath(date, min, max, type);
}

function toTime(date: Date) {
  const clone = new Date(date);
  const y = clone.getFullYear();
  const m = clone.getMonth();
  const d = clone.getDate();
  return new Date(y, m, d).getTime();
}
function resetDay(date: Date) {
  const clone = new Date(date);
  const y = clone.getFullYear();
  const m = clone.getMonth();
  return new Date(y, m, 1);
}
function _compareYear(x: number, date: Date) {
  const y = new Date(date).getFullYear();
  switch (true) {
    case x > y:
      return "greater";
    case x === y:
      return "equal";
    case x < y:
      return "less";
    default:
      return "not equal";
  }
}
function _compareMonth(_year: number, _month: number, date: Date) {
  const { year, month } = toIndexDate(date);
  const x = new Date(_year, _month, 1).getTime();
  const y = new Date(year, month, 1).getTime();
  switch (true) {
    case x > y:
      return "greater";
    case x === y:
      return "equal";
    case x < y:
      return "less";
    default:
      return "not equal";
  }
}
export function compareDate(_x: Date, _y: Date) {
  const x = toTime(_x);
  const y = toTime(_y);
  switch (true) {
    case x > y:
      return "greater";
    case x === y:
      return "equal";
    case x < y:
      return "less";
    default:
      return "not equal";
  }
}
function validRange(x: Date, y: Date) {
  switch (compareDate(x, y)) {
    case "equal":
    case "greater":
      console.warn("DateX\nWARNING: min is GREATER or EQUAL than max");
      return false;
    default:
      return true;
  }
}

export function toDate(date: unknown) {
  if (date instanceof Date) {
    return new Date(date);
  } else {
    return null;
  }
}

export function isEqualDate(x: Date | null, y: Date | null) {
  const _x = x ? toTime(x) : null;
  const _y = y ? toTime(y) : null;
  return _x === _y;
}

export function toDateX(date: unknown) {
  if (date instanceof Date && isValidDate(date)) {
    return new DateX(date);
  } else {
    return null;
  }
}

export function testLocale(locale?: string) {
  let warningMessage = "";
  if (locale) {
    const split = locale.split("-");
    const lenghtTest = split.length <= 1 || split.length > 2;
    const stringTest = split[0].toUpperCase() !== split[1];
    if (lenghtTest || stringTest) {
      const systemLang = navigator.language;
      warningMessage = `"${locale}" is incorrect locale information.\n\t\tDont worry "${systemLang}" has been set up according to your system settings`;
      return [systemLang, warningMessage];
    } else {
      return [locale, warningMessage];
    }
  } else {
    return [navigator.language, warningMessage];
  }
}

export function toDateRange(value: any) {
  return { start: value.start, end: value.end };
}

export function toLocaleString(date: any, locale: string) {
  if (date instanceof Date) {
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else {
    return "";
  }
}
