import { randomKey } from "./randomKey";

export function getDayName(
  locale: string,
  dayOffset: number,
  option: "narrow" | "long" | "short" = "narrow",
) {
  const fristDay = 3 - dayOffset;
  const monday = new Date(Date.UTC(2022, 0, fristDay));
  const days = [];
  for (let i = 0; i < 7; ++i) {
    days.push(monday.toLocaleDateString(locale, { weekday: option }));
    monday.setDate(monday.getDate() + 1);
  }
  return days;
}

export function getFristDayPos(date: Date, dayOffset: number) {
  const fristDay = date.toLocaleDateString("en-EN", { weekday: "long" });
  const days = getDayName("en-EN", dayOffset, "long");
  return days.indexOf(fristDay);
}

export function getDayContent(
  year: number,
  month: number,
  locale: string,
  dayOffset: number,
) {
  const date = new Date(year, month);
  const dayCount = new Date(year, month + 1, 0).getDate();
  const spaces = getFristDayPos(date, dayOffset);
  const button = date
    .toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
    })
    .toUpperCase();
  return { days: dayCount, spaces: spaces, button: button };
}

export function getYearContent(currentYear: number) {
  const keys: string[] = [];
  const startYears: number[] = [];
  let index = 0;
  for (let i = 0; i < currentYear; ++i) {
    if (index === 24) {
      index = 0;
      startYears.push(i);
    }
    ++index;
  }
  const startYear = startYears.pop()!;
  for (let i = 0; i < 24; ++i) {
    let key = randomKey();
    keys.push(key);
  }

  return { startYear, keys };
}

export function getMonthName(index: number, locale: string) {
  const month = new Date(1, index)
    .toLocaleDateString(locale, { month: "short" })
    .toUpperCase();
  return month;
}
