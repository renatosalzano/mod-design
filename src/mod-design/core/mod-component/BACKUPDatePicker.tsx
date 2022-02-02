import {
  createContext,
  createElement,
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ModDateInput from "../component/ModDateInput";
import {
  ActiveSelector,
  ContentElement,
  IndexButton,
  IndexDate,
  IndexRange,
  IndexSelector,
  SetContent,
  RE,
  Key,
  SetIndex,
  RenderContent,
  Scroll,
} from "../interfaces/datePicker";
import { ModuleCore } from "./ModuleCore";
import "../SCSS/mod-core-date-picker.scss";
import { Button } from "./Button";

type Mode = "year" | "month" | "day";
type DateNull = Date | null;

/* 
  -------------------------------------------------------------------------
  ---- DATE PICKER
  -------------------------------------------------------------------------
*/

interface Props {
  value: Date | null;
  range?: boolean;
  maxDate?: Date;
  minDate?: Date;
  openTo?: Mode;
  localization?: string;
  dayOffset?: 0 | 1;
  disableFuture?: boolean;
  disablePast?: boolean;
  actionButton?: boolean;
  onChange: (value: any) => void;
}
export const DatePicker: FC<Props & Range> = ({
  value,
  range,
  maxDate,
  minDate,
  localization,
  openTo = "day",
  dayOffset = 1,
  disableFuture = false,
  disablePast = false,
  actionButton = false,
  onChange,
}) => {
  const [actionBtn, setActionBtn] = useState(actionButton);
  const [calendar, openCalendar] = useState(false);
  const [locale, setLocale] = useState("");
  const [maxIndexDate, setMaxDate] = useState<DateNull>(null);
  const [minIndexDate, setMinDate] = useState<DateNull>(null);

  const init = useRef(() => {
    const lang = testLocale(localization);
    const _maxDate = testMaxDate(disableFuture, maxDate);
    const _minDate = testMinDate(disablePast, minDate);
    setMaxDate(_maxDate);
    setMinDate(_minDate);
    setLocale(lang);
  });

  const testValue = useRef((value: Date | null) => {
    if (value && !testValidDate(value, "value")) {
      /* 
        INVALID DATE PROVIDED
      */
      onChange(null);
    }
  });

  useEffect(() => {
    init.current();
  }, []);

  useEffect(() => {
    console.log(value);
    testValue.current(value);
  }, [value]);

  function setMobile() {
    setActionBtn(true);
  }

  return (
    <ModuleCore border>
      <ModDateInput
        setFocus={() => null}
        onIconClick={() => openCalendar(!calendar)}
        onIconTouch={setMobile}
      />
      <ModCalendar
        value={value}
        maxDate={maxIndexDate}
        minDate={minIndexDate}
        calendar={calendar}
        defaultMode={openTo}
        locale={locale}
        dayOffset={dayOffset}
        actionBtn={actionBtn}
      />
    </ModuleCore>
  );
};
interface CalendarProps {
  value: Date | null;
  maxDate: Date | null;
  minDate: Date | null;
  locale: string;
  calendar: boolean;
  defaultMode: Mode;
  dayOffset: 0 | 1;
  actionBtn: boolean;
}
const ModCalendar: FC<CalendarProps> = ({
  value,
  minDate,
  maxDate,
  locale,
  calendar,
  defaultMode,
  dayOffset,
  actionBtn,
}) => {
  return (
    <div className="mod-drop-down-container">
      {calendar && (
        <DatePickerProvider
          mode={defaultMode}
          value={value}
          maxDate={maxDate}
          minDate={minDate}
          locale={locale}
          dayOffset={dayOffset}
          actionBtn={actionBtn}>
          <CalendarDropDown defaultMode={defaultMode} />
        </DatePickerProvider>
      )}
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- DATE PICKER FLAT
  ------------------------------------------------------------------------- 
*/

const DatePickerFlat: FC = () => {
  return null;
};

/* 
  ------------------------------------------------------------------------- 
  ----- DATE PICKER RANGE
  ------------------------------------------------------------------------- 
*/

interface DatePickerRange {}
const DatePickerRange: FC<DatePickerRange> = ({}) => {
  return null;
};

/* 
  ------------------------------------------------------------------------- 
  ----- CONTEXT 
  ------------------------------------------------------------------------- 
*/

interface Input {
  mode: Mode;
  maxDate: DateNull;
  minDate: DateNull;
  value: DateNull;
  locale: string;
  dayOffset: 0 | 1;
  actionBtn: boolean;
}
interface Output {
  set: SetContent;
  maxDate: DateNull;
  minDate: DateNull;
  render: MutableRefObject<Mode>;
  locale: string;
  dayOffset: 0 | 1;
  indexDate: IndexDate;
  indexRange: IndexRange;
  indexSelector: IndexSelector;
  activeSelector: ActiveSelector;
  renderContent: RenderContent;
  setIndex: SetIndex;
  scroll: Scroll;
  actionBtn: boolean;
}
const DatePickerContext = createContext({} as Output);
const useDatePickerContext = () => useContext(DatePickerContext);
const DatePickerProvider: FC<Input> = ({
  mode,
  value,
  maxDate,
  minDate,
  locale,
  dayOffset,
  actionBtn,
  children,
}) => {
  /*  
  ----- RENDER DATA --------------------------------
  */
  const render = useRef<Mode>(mode);
  const content = useRef<ContentElement>({
    year: { curr: [], next: [] },
    month: { curr: [], next: [] },
    day: [],
  }).current;
  /* 
  ----- INDEX DATA --------------------------------
  */
  const indexDate = useRef<IndexDate>({
    curr: { year: 0, month: 0, day: 1 },
    next: { year: 0, month: 0 },
  }).current;
  const indexRange = useRef<IndexRange>({
    curr: {
      year: { min: 0, max: 9999 },
      month: { min: 0, max: 11 },
      day: { min: 1, max: 31 },
    },
    next: { year: { min: 0, max: 9999 } },
  }).current;
  const indexButton = useRef<IndexButton>({
    curr: { year: "", month: "", day: "" },
    next: { year: "", month: "" },
  }).current;
  const indexSelector = useRef<IndexSelector>({
    year: {},
    month: {},
    day: {},
  }).current;
  const activeSelector = useRef<ActiveSelector>({
    prev: { year: "", month: "", day: "" },
    curr: { year: "", month: "", day: "" },
    next: { year: "", month: "" },
  }).current;
  /* 
  ----- FUNCTION -----------------------------------
  */

  const set = useRef<SetContent>({
    mode: null,
    content: null,
    button: null,
    header: null,
  }).current;
  const setContent = useCallback(
    (content: RE[], button: string) => {
      if (!!set.content) set.content(content);
      if (!!set.button) set.button(button);
      if (!!set.header) set.header(button);
    },
    [set],
  );
  const setMode = useCallback(
    (mode: Mode) => {
      if (!!set.mode) {
        render.current = mode;
        set.mode(mode);
      }
    },
    [set],
  );

  const testIndexDate = useRef((year: number, month: number) => {
    switch (true) {
      case month < 0:
        --year;
        const { min } = indexRange.curr.year;
        if (year < min) {
          getYearContent(year);
        }
        return { year: year, month: 11 };
      case month > 11:
        ++year;
        const { max } = indexRange.curr.year;
        if (year > max) {
          getYearContent(year);
        }
        return { year: year, month: 0 };
      default:
        return { year, month };
    }
  });
  /* 
  --------------------------------------------------
  ----- GET CALENDAR CONTENT -----------------------
  --------------------------------------------------
  */
  const getYearContent = useCallback(
    (year: number) => {
      const { yearContent, startYear, lastYear, yearButton } = getYear(
        year,
        minDate,
        maxDate,
      );
      content.year.next = yearContent;
      indexButton.next.year = yearButton;
      indexRange.next.year = { min: startYear, max: lastYear };
      if (render.current === "year") {
        setContent(yearContent, yearButton);
      }
      return { startYear, lastYear, yearContent, yearButton };
    },
    [
      minDate,
      maxDate,
      content.year,
      indexButton.next,
      indexRange.next,
      setContent,
    ],
  );

  const getMonthContent = useCallback(
    (currentYear: number) => {
      const { monthContent, monthButton } = getMonth(
        locale,
        currentYear,
        minDate,
        maxDate,
      );
      content.month.next = monthContent;
      indexButton.next.month = monthButton;
      if (render.current === "month") {
        setContent(monthContent, monthButton);
      }

      return { monthContent, monthButton };
    },
    [locale, minDate, maxDate, content.month, indexButton.next, setContent],
  );

  const getDayContent = useCallback(
    (_year: number, _month: number) => {
      const { year, month } = testIndexDate.current(_year, _month);
      const { dayContent, lastDay, dayButton } = getDay(
        year,
        month,
        locale,
        dayOffset,
        minDate,
        maxDate,
      );

      indexRange.curr.day.max = lastDay;
      content.day = dayContent;
      indexButton.curr.day = dayButton;
      if (render.current === "day") {
        setContent(dayContent, dayButton);
      }
      return { lastDay, dayButton, dayContent, year, month };
    },
    [
      content,
      indexButton.curr,
      indexRange.curr.day,
      minDate,
      maxDate,
      dayOffset,
      locale,
      setContent,
    ],
  );
  /* 
  --------------------------------------------------
  ----- RENDER CONTENT FUNCTION -----------------------
  --------------------------------------------------
  */

  const renderYear = useCallback(() => {
    if (content.year.curr.length === 0) {
      const { min } = indexRange.curr.year;
      const { yearContent, yearButton } = getYearContent(min);
      content.year.curr = yearContent;
      indexButton.curr.year = yearButton;
      setContent(yearContent, yearButton);
    } else {
      setContent(content.year.curr, indexButton.curr.year);
    }
  }, [
    content.year,
    indexRange.curr.year,
    getYearContent,
    indexButton.curr,
    setContent,
  ]);
  const renderMonth = useCallback(() => {
    if (content.month.curr.length === 0) {
      const { year } = indexDate.next;
      const { monthContent, monthButton } = getMonthContent(year);
      content.month.curr = monthContent;
      indexButton.curr.month = monthButton;
      setContent(monthContent, monthButton);
    } else {
      setContent(content.month.next, indexButton.next.month);
    }
  }, [
    content.month,
    indexButton.curr,
    indexButton.next.month,
    indexDate.next,
    getMonthContent,
    setContent,
  ]);
  const renderDay = useCallback(() => {
    if (content.day.length === 0) {
      const { year, month } = indexDate.curr;
      const { dayContent, dayButton } = getDayContent(year, month);
      setContent(dayContent, dayButton);
    } else {
      setContent(content.day, indexButton.curr.day);
    }
  }, [
    content.day,
    getDayContent,
    indexButton.curr.day,
    indexDate.curr,
    setContent,
  ]);
  const renderContent = useRef({
    year: renderYear,
    month: renderMonth,
    day: renderDay,
  }).current;

  /* 
  --------------------------------------------------
  ----- SET INDEX FUNCTION -------------------------
  --------------------------------------------------
  */

  const toIndex = useRef((year: Number, month: Number, day: number) => {
    return `${year}${month}${day}`;
  });

  const focusSelector = useRef({
    year: (index: string) => {
      const { year } = activeSelector.next;
      if (indexSelector.year[year]) {
        indexSelector.year[year].blur();
      }
      activeSelector.next.year = index;
      indexSelector.year[index].focus();
    },
    month: (index: string) => {
      const { month } = activeSelector.next;

      if (indexSelector.month[month]) {
        indexSelector.month[month].blur();
      }
      console.log(activeSelector.next.month);
      activeSelector.next.month = index;
      console.log(month);
      indexSelector.month[index].focus();
    },
    day: (index: string) => {
      const { day } = activeSelector.curr;
      if (indexSelector.day[day]) {
        indexSelector.day[day].blur();
      }
      activeSelector.curr.day = index;
      indexSelector.day[index].focus();
    },
  });

  const setYear = useCallback(
    (prev = false) => {
      const { min } = indexRange.next.year;
      if (prev) {
        getYearContent(min - 24);
      } else {
        getYearContent(min + 24);
      }
    },
    [getYearContent, indexRange.next.year],
  );

  const setMonth = useCallback(
    (year: number) => {
      const { min, max } = indexRange.next.year;
      indexDate.next.year = year;
      if (year < min) setYear(true);
      if (year > max) setYear();
      getMonthContent(year);
    },
    [getMonthContent, indexDate.next, indexRange.next.year, setYear],
  );

  const setDay = useCallback(
    (_year: number, _month: number) => {
      const { lastDay, year, month } = getDayContent(_year, _month);
      indexDate.curr.year = year;
      indexDate.next.year = year;
      indexDate.curr.month = month;
      indexDate.next.month = month;
      activeSelector.curr.year = year.toString();
      activeSelector.next.year = year.toString();
      activeSelector.curr.month = `${year}${month}`;
      activeSelector.next.month = `${year}${month}`;
      return { lastDay, year, month };
    },
    [
      getDayContent,
      indexDate.curr,
      indexDate.next,
      activeSelector.curr,
      activeSelector.next,
    ],
  );

  const scroll = useRef({
    year: setYear,
    month: setMonth,
    day: setDay,
  }).current;

  const setIndexYear = useCallback(
    (year: number) => {
      const { min, max } = indexRange.next.year;
      switch (true) {
        case year < min:
          setYear(true);
          focusSelector.current.year(year.toString());
          break;
        case year > max:
          setYear();
          focusSelector.current.year(year.toString());
          break;
        default:
          focusSelector.current.year(year.toString());
          break;
      }
    },
    [indexRange.next.year, setYear],
  );

  const setIndexMonth = useCallback(
    (year: number, month: number) => {
      let offset = 0;
      switch (true) {
        case month < 0:
          setMonth(--year);
          console.log(month);
          offset = month + 12;
          indexDate.next.month = offset;
          focusSelector.current.month(`${year}${offset}`);
          break;
        case month > 11:
          setMonth(++year);
          offset = month - 12;
          indexDate.next.month = offset;
          focusSelector.current.month(`${year}${offset}`);
          break;
        default:
          focusSelector.current.month(`${year}${month}`);
          break;
      }
    },
    [setMonth, indexDate.next],
  );

  const setIndexDay = useCallback(
    ({ year, month, day }) => {
      const max = indexRange.curr.day.max;
      let offset = 0;

      switch (true) {
        case day < 1:
          const x = setDay(year, --month);
          offset = x.lastDay + day;
          indexDate.curr.day = offset;
          focusSelector.current.day(toIndex.current(x.year, x.month, offset));
          break;
        case day > max:
          const y = setDay(year, ++month);
          offset = day - max;
          indexDate.curr.day = offset;
          focusSelector.current.day(toIndex.current(y.year, y.month, offset));
          break;
        default:
          indexDate.curr.day = day;
          focusSelector.current.day(toIndex.current(year, month, day));
          break;
      }
    },
    [indexDate.curr, indexRange.curr.day.max, setDay],
  );

  const setIndex = useRef({
    year: setIndexYear,
    month: setIndexMonth,
    day: setIndexDay,
  }).current;
  /* 
  --------------------------------------------------
  ----- HANDLE SELECTOR  ---------------------------
  --------------------------------------------------
  */

  const onYearClick = useCallback((value: number) => {
    setMode("month");
  }, []);
  const onMonthClick = useCallback((value: number) => {
    setMode("day");

    // CONTINUA...
  }, []);
  const onDayClick = useCallback((value: number) => {
    if (actionBtn) {
    }
  }, []);

  const handleSelector = useRef({
    year: onYearClick,
    month: onMonthClick,
    day: onDayClick,
  }).current;

  /* 
  --------------------------------------------------
  ----- INIT DATE PICKER  --------------------------
  --------------------------------------------------
  */
  const initIndexYear = (year: number) => {
    const min = initYear(year);
    const max = min + 23;
    indexRange.curr.year = { min, max };
    indexRange.next.year = { min, max };
  };

  const initActiveSelector = (year: number, month: number, day: number) => {
    const y = year.toString();
    const m = `${year}${month}`;
    const d = `${year}${month}${day}`;
    activeSelector.prev = { year: y, month: m, day: d };
    activeSelector.curr = { year: y, month: m, day: d };
    activeSelector.next = { year: y, month: m };
  };

  const toIndexDate = useRef((_date: Date | null) => {
    let validDate = _date && testValidDate(_date, "value");
    const date = validDate ? validDate : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const index = { year, month, day };
    return index;
  });

  const init = useRef(() => {
    const index = toIndexDate.current(value);
    const { year, month, day } = index;

    indexDate.curr = index;
    indexDate.next = { year: index.year, month: index.month };
    initIndexYear(index.year);
    initActiveSelector(year, month, day);
    switch (mode) {
      case "year":
        const { yearContent, yearButton } = getYearContent(
          indexRange.curr.year.min,
        );
        content.year.curr = yearContent;
        indexButton.curr.year = yearButton;
        break;
      case "month":
        const { monthContent, monthButton } = getMonthContent(year);
        content.month.curr = monthContent;
        indexButton.curr.month = monthButton;
        break;
      case "day":
        getDayContent(year, month);
        break;
    }
  });
  useEffect(() => {
    init.current();
  }, []);

  return createElement(
    DatePickerContext.Provider,
    {
      value: {
        set,
        minDate,
        maxDate,
        render,
        locale,
        dayOffset,
        indexDate,
        indexRange,
        indexSelector,
        activeSelector,
        renderContent,
        setIndex,
        scroll,
        actionBtn,
      },
    },
    children,
  );
};

/* 
  -------------------------------------------------------------------------
  ----- END PROVIDER
  -------------------------------------------------------------------------
*/

/* 
  -------------------------------------------------------------------------
  ----- CALENDAR COMPONENT
  -------------------------------------------------------------------------
*/

interface DropDownProps {
  defaultMode: Mode;
}

const CalendarDropDown: FC<DropDownProps> = ({ defaultMode }) => {
  const {
    set,
    render,
    minDate,
    maxDate,
    setIndex,
    indexDate,
    indexRange,
    indexSelector,
    activeSelector,
    actionBtn,
  } = useDatePickerContext();
  const [mode, setMode] = useState(defaultMode);
  const key = useRef<Key>(null);

  /* 
  --------------------------------------------------
  ----- TEST INDEX FUNCTION
  --------------------------------------------------
  */

  const testYear = {
    isOutMax: (year: number) => {
      if (maxDate) return year > maxDate.getFullYear();
      return false;
    },
    isOutMin: (year: number) => {
      if (minDate) return year < minDate.getFullYear();
      return false;
    },
  };
  const testMonth = {
    isOutMax: (year: number, month: number) => {
      const date = new Date(year, month);
      if (maxDate) return date > maxDate;
      return false;
    },
    isOutMin: (year: number, month: number) => {
      const date = new Date(year, month);
      if (minDate) return date < minDate;
      return false;
    },
  };

  const testDay = {
    isOutMax: (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      if (maxDate) return date > maxDate;
      return false;
    },
    isOutMin: (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      if (minDate) return date < minDate;
      return false;
    },
  };

  const testIndex = useRef({
    year: (year: number) => {
      let isOutMax,
        isOutMin = false;
      if (maxDate) isOutMax = testYear.isOutMax(year);
      if (minDate) isOutMin = testYear.isOutMin(year);
      return isOutMax || isOutMin;
    },
    month: (year: number, month: number) => {
      let isOutMax,
        isOutMin = false;
      if (maxDate) isOutMax = testMonth.isOutMax(year, month);
      if (minDate) isOutMin = testMonth.isOutMin(year, month);
      return isOutMax || isOutMin;
    },
    day: (year: number, month: number, day: number) => {
      let isOutMax,
        isOutMin = false;
      if (maxDate) isOutMax = testDay.isOutMax(year, month, day);
      if (minDate) isOutMin = testDay.isOutMin(year, month, day);
      return isOutMax || isOutMin;
    },
  });

  const checkSelector = useRef({
    year: (_year: number) => {
      const { year } = activeSelector.next;
      if (indexSelector.year[year] === undefined) {
        const { min, max } = indexRange.next.year;
        let index = "";
        if (key.current === "ArrowUp" || key.current === "ArrowLeft") {
          index = max.toString();
          activeSelector.next.year = index;
          return max;
        } else {
          index = min.toString();
          activeSelector.next.year = index;
          return min;
        }
      }
      return _year;
    },
    month: (year: number, _month: number) => {
      const { month } = activeSelector.next;
      if (indexSelector.month[month] === undefined) {
        let index = year.toString();
        if (key.current === "ArrowUp" || key.current === "ArrowLeft") {
          index += "11";
          activeSelector.next.month = index;
          return 11;
        } else {
          index += "0";
          activeSelector.next.month = index;
          return 0;
        }
      }
      return _month;
    },
    day: (year: number, month: number, _day: number) => {
      const { day } = activeSelector.curr;
      if (indexSelector.day[day] === undefined) {
        const { min, max } = indexRange.curr.day;
        let index = `${year}${month}`;
        if (key.current === "ArrowUp" || key.current === "ArrowLeft") {
          index += max.toString();
          activeSelector.curr.day = index;
          return max;
        } else {
          index += min.toString();
          activeSelector.curr.day = index;
          return min;
        }
      }
      return _day;
    },
  });

  /* 
  --------------------------------------------------
  ----- KEYBOARD FUNCTION
  --------------------------------------------------
  */

  const setIndexYear = useCallback(
    (i: number) => {
      const { next } = indexDate;
      if (testIndex.current.year(next.year + i)) return;
      next.year = checkSelector.current.year(next.year + i);
      setIndex.year(next.year);
    },
    [indexDate, setIndex],
  );
  const setIndexMonth = useCallback(
    (i: number) => {
      const { next } = indexDate;
      if (testIndex.current.month(next.year, next.month + i)) return;
      next.month = checkSelector.current.month(next.year, next.month + i);
      setIndex.month(next.year, next.month);
      //
    },
    [indexDate, setIndex],
  );
  const setIndexDay = useCallback(
    (i: number) => {
      const { curr } = indexDate;
      const { year, month } = curr;
      if (testIndex.current.day(year, month, curr.day + i)) return;
      curr.day = checkSelector.current.day(year, month, curr.day + i);
      setIndex.day({ year, month, day: curr.day });
    },
    [indexDate, setIndex],
  );

  const update = useRef({
    year: setIndexYear,
    month: setIndexMonth,
    day: setIndexDay,
  });

  /* 
  --------------------------------------------------
  ----- HANDLE KEYBOARD
  --------------------------------------------------
  */

  const onKeydown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          key.current = "ArrowUp";
          const offsetUp = mode === "day" ? -7 : -4;
          update.current[mode](offsetUp);
          break;
        case "ArrowDown":
          event.preventDefault();
          key.current = "ArrowDown";
          const offsetDown = mode === "day" ? 7 : 4;
          update.current[mode](offsetDown);
          break;
        case "ArrowLeft":
          event.preventDefault();
          key.current = "ArrowLeft";
          update.current[mode](-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          key.current = "ArrowRight";
          update.current[mode](+1);
          break;
      }
    },
    [mode],
  );

  const init = useRef(() => {
    render.current = defaultMode;
    set.mode = (mode: Mode) => setMode(mode);
  });

  useEffect(() => {
    init.current();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeydown, true);
    return () => {
      document.removeEventListener("keydown", onKeydown, true);
    };
  }, [onKeydown]);

  return (
    <div className="mod-calendar">
      <CalendarHeader setMode={setMode} />
      <CalendarSeparator mode={mode} />
      <CalendarContent mode={mode} />
      {actionBtn && <CalendarFooter mode={mode} />}
    </div>
  );
};

interface HeaderProps {
  setMode: Dispatch<SetStateAction<Mode>>;
}

const CalendarHeader: FC<HeaderProps> = ({ setMode }) => {
  /* 
  --------------------------------------------------
  ----- CALENDAR HEADER
  --------------------------------------------------
  */
  const { render, renderContent, indexDate, scroll } = useDatePickerContext();
  const handleButton = useCallback(() => {
    if (render.current !== "day") {
      render.current = "day";
      renderContent.day();
      setMode("day");
    } else {
      render.current = "year";
      renderContent.year();
      setMode("year");
    }
  }, [render, renderContent, setMode]);
  /* 
  --------------------------------------------------
  ----- HANDLE ARROWS
  --------------------------------------------------
  */
  const handleArrow = useCallback(
    (i: 1 | -1) => {
      switch (render.current) {
        case "year":
          const next = i !== 1 ? true : false;
          scroll.year(next);
          break;
        case "month":
          indexDate.next.year += i;
          scroll.month(indexDate.next.year);
          break;
        case "day":
          const { curr } = indexDate;
          curr.month += i;
          scroll.day(curr.year, curr.month);
          break;
      }
    },
    [indexDate, render, scroll],
  );
  const onArrowL = useCallback(() => handleArrow(-1), [handleArrow]);
  const onArrowR = useCallback(() => handleArrow(1), [handleArrow]);
  return (
    <div className="mod-calendar-header">
      <CalendarModeButton onClick={handleButton} />
      <CalendarArrow onArrowL={onArrowL} onArrowR={onArrowR} />
    </div>
  );
};

/* 
  --------------------------------------------------
  ----- CALENDAR MODE BUTTON
  --------------------------------------------------
*/
interface ModeBtnProps {
  onClick: () => void;
}
const CalendarModeButton: FC<ModeBtnProps> = ({ onClick }) => {
  const { set, render } = useDatePickerContext();
  const [label, setLabel] = useState("");

  useEffect(() => {
    set.button = (label: string) => setLabel(label);
    return () => {
      set.button = null;
    };
  }, [set]);
  return (
    <button className="mod-mode-button" onClick={onClick}>
      {label}
      <svg
        viewBox="0 0 10 5"
        focusable="false"
        className={setArrowClassName(render.current)}>
        <polygon fill="currentColor" points="0,0 5,5 10,0"></polygon>
      </svg>
    </button>
  );
};

function setArrowClassName(mode: Mode) {
  let className = "mod-calendar-arrow";
  if (mode !== "day") {
    className += " filp-arrow";
  }
  return className;
}
interface ArrowProps {
  onArrowL: () => void;
  onArrowR: () => void;
}
/* 
  --------------------------------------------------
  ---- CALENDAR ARROWS
  --------------------------------------------------
*/
const CalendarArrow: FC<ArrowProps> = ({ onArrowL, onArrowR }) => {
  return (
    <div className="mod-calendar-arrows">
      <div className="mod-arrow-trigger" onClick={onArrowL}>
        <div className="mod-arrow-L" />
      </div>
      <div className="mod-arrow-trigger" onClick={onArrowR}>
        <div className="mod-arrow-R" />
      </div>
    </div>
  );
};

interface ContentProps {
  mode: Mode;
}
/* 
  --------------------------------------------------
  ---- CALENDAR SEPARATOR
  --------------------------------------------------
*/
const CalendarSeparator: FC<ContentProps> = ({ mode }) => {
  const { dayOffset, locale } = useDatePickerContext();
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const renderWeekdays = useRef((weekdays: string[]) => {
    return weekdays.map((day, index) => {
      return <span key={day + index}>{day}</span>;
    });
  }).current;
  const getWeekdays = useRef(() => {
    const fristDay = 2 + dayOffset;
    const dayNames: string[] = [];
    for (let day = 0; day < 7; ++day) {
      const dayName = new Date(2022, 0, fristDay + day)
        .toLocaleDateString(locale, { weekday: "narrow" })
        .toUpperCase();
      dayNames.push(dayName);
    }
    setWeekdays(dayNames);
  });

  useEffect(() => {
    getWeekdays.current();
  }, []);

  return (
    <div className={`mod-calendar-separator ${mode}-content`}>
      {mode === "day" && renderWeekdays(weekdays)}
    </div>
  );
};
/* 
  --------------------------------------------------
  ---- CALENDAR CONTENT
  --------------------------------------------------
*/
const CalendarContent: FC<ContentProps> = ({ mode }) => {
  const {
    set,
    indexDate: {
      curr: { year },
    },
  } = useDatePickerContext();
  const [content, setContent] = useState<RE[]>([]);
  const onMount = useRef(() => {
    set.content = (content: RE[]) => setContent(content);
  });
  const onUnmount = useRef(() => {
    set.content = null;
  }).current;

  useEffect(() => {
    onMount.current();
    return () => {
      onUnmount();
    };
  }, [onUnmount]);
  return (
    <>
      {mode === "month" && <MonthHeader />}
      <div className={`mod-calendar-content ${mode}-content`}>{content}</div>
    </>
  );
};

/* 
  --------------------------------------------------
  ---- CONTENT HEADER
  --------------------------------------------------
*/

const MonthHeader: FC = () => {
  const { set } = useDatePickerContext();
  const [header, setHeader] = useState("");
  const init = useRef(() => {
    set.header = (header: string) => setHeader(header);
  });
  const destroy = useRef(() => {
    console.log("exec");
    set.header = null;
  }).current;
  useEffect(() => {
    init.current();
    return () => {
      destroy();
    };
  }, [destroy]);
  return (
    <div className="mod-month-header">
      <span className="mod-month-label">{header}</span>
    </div>
  );
};
/* 
  --------------------------------------------------
  ---- CALENDAR FOOTER
  --------------------------------------------------
*/
interface CalFooter extends ContentProps {
  actionButtonName?: { cancel: string; apply: string };
}

const CalendarFooter: FC<CalFooter> = ({
  mode,
  actionButtonName = { cancel: "Cancel", apply: "Apply" },
}) => {
  return (
    <div className="mod-calendar-footer">
      <Button onClick={() => null}>{actionButtonName.cancel}</Button>
      <Button
        onClick={(_evt, value) => console.log(value)}
        disabled={mode !== "day"}>
        {actionButtonName.apply}
      </Button>
    </div>
  );
};

function setApplyClassName(mode: Mode) {
  let className = "";
  if (mode !== "day") {
    className += "mod-button-disabled";
  }
  return className;
}

/* 
  -------------------------------------------------------------------------
  ----- END CALENDAR COMPONENT
  -------------------------------------------------------------------------
*/

/* 
  -------------------------------------------------------------------------
  ----- SUBSCRIBE SELECTOR
  -------------------------------------------------------------------------
*/

const useSubscribe = (
  index: string,
  mode: Mode,
  setActive: Dispatch<SetStateAction<boolean>>,
) => {
  const { indexSelector } = useDatePickerContext();
  const sub = useRef(() => {
    indexSelector[mode] = {
      ...indexSelector[mode],
      [index]: { focus: () => setActive(true), blur: () => setActive(false) },
    };
  });
  const unsub = useRef(() => {
    delete indexSelector[mode][index];
  }).current;
  useEffect(() => {
    sub.current();
    return () => unsub();
  }, [unsub]);
};

/* 
  -------------------------------------------------------------------------
  ----- SELECTOR WRAPPER
  -------------------------------------------------------------------------
*/

interface SelectorWrapper {
  label: string;
  index: string;
  value: number;
  disabled: boolean;
}

const Year: FC<SelectorWrapper> = ({ label, index, value, disabled }) => {
  const { activeSelector } = useDatePickerContext();
  const initState = () => activeSelector.next.year === index;
  const [active, setActive] = useState(initState);
  const selected = useRef(activeSelector.prev.year === index).current;
  useSubscribe(index, "year", setActive);
  return (
    <Selector
      label={label}
      active={active}
      selected={selected}
      disabled={disabled}
    />
  );
};

const Month: FC<SelectorWrapper> = ({ label, index, value, disabled }) => {
  const { activeSelector } = useDatePickerContext();
  const initState = () => activeSelector.curr.month === index;
  const [active, setActive] = useState(initState);

  useSubscribe(index, "month", setActive);
  return (
    <Selector
      label={label}
      active={active}
      selected={activeSelector.prev.month === index}
      disabled={disabled}
    />
  );
};

const Day: FC<SelectorWrapper> = ({ label, index, value, disabled }) => {
  const { activeSelector } = useDatePickerContext();
  const initState = () => activeSelector.curr.day === index;
  const [active, setActive] = useState(initState);
  const selected = useRef(activeSelector.prev.day === index).current;
  useSubscribe(index, "day", setActive);

  return (
    <Selector
      label={label}
      active={active}
      selected={selected}
      disabled={disabled}
    />
  );
};
interface SelectorProps {
  label: string;
  active: boolean;
  selected: boolean;
  disabled: boolean;
}
const Selector: FC<SelectorProps> = ({ label, active, selected, disabled }) => {
  return (
    <div className={setClassName(active, selected, disabled)}>
      {active && <div className="mod-selector-bg" />}
      <span className="mod-selector">{label}</span>
    </div>
  );
};
function setClassName(active: boolean, selected: boolean, disabled: boolean) {
  let className = "mod-selector-box";
  if (active) {
    className += " mod-active";
  }
  if (selected) {
    className += " mod-selected";
  }
  if (disabled) {
    className += " mod-disabled";
  }
  return className;
}

const EmptySelector = () => {
  return <div className="mod-date-selector blank" />;
};

/* 
  -------------------------------------------------------------------------
  ----- GET CONTENT FUNCTION
  -------------------------------------------------------------------------
*/

function initYear(year: number) {
  const startYears: number[] = [];
  for (let index = 0; index < year; ) {
    startYears.push(index);
    index += 24;
  }
  return startYears.pop()!;
}

function getYear(
  year: number,
  disablePast: Date | null,
  disableFuture: Date | null = null,
) {
  const yearContent: RE[] = [];
  for (let i = 0; i < 24; ++i) {
    const yearString = `${year + i}`;
    let isPast,
      isFuture = false;
    if (disablePast) {
      isPast = testYear.past(disablePast, year + i);
    }
    if (disableFuture) {
      isFuture = testYear.future(disableFuture, year + i);
    }
    const disabled = isPast || isFuture;
    yearContent.push(
      <Year
        key={yearString}
        disabled={disabled}
        value={year + i}
        label={yearString}
        index={yearString}
      />,
    );
  }
  const lastYear = year + 23;
  const yearButton = `${year} - ${lastYear}`;
  return { yearContent, startYear: year, lastYear, yearButton };
}

function getMonth(
  locale: string,
  currentYear: number,
  disablePast: Date | null = null,
  disableFuture: Date | null = null,
) {
  const lang = testLocale(locale);
  const monthContent: RE[] = [];
  const monthButton = currentYear.toString();
  for (let i = 0; i < 12; ++i) {
    const month = new Date(0, i)
      .toLocaleDateString(lang, { month: "short" })
      .toUpperCase();
    let isPast,
      isFuture = false;
    if (disablePast) {
      isPast = testMonth.past(disablePast, currentYear, i);
    }
    if (disableFuture) {
      isFuture = testMonth.future(disableFuture, currentYear, i);
    }
    const index = `${currentYear}${i}`;
    const disabled = isPast || isFuture;
    monthContent.push(
      <Month
        key={index}
        disabled={disabled}
        value={i}
        label={month}
        index={index}
      />,
    );
  }
  return { monthContent, monthButton };
}

function getDay(
  year: number,
  month: number,
  locale: string,
  dayOffset: 0 | 1,
  disablePast: Date | null = null,
  disableFuture: Date | null = null,
) {
  const date = new Date(year, month, 1);
  const offset = date.getDay() - dayOffset;
  const spaces = offset < 0 ? 7 + offset : offset;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dayButton = date
    .toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
    })
    .toUpperCase();
  const dayContent: RE[] = [];
  for (let index = 1; index <= lastDay + spaces; ++index) {
    if (index <= spaces) {
      dayContent.push(<EmptySelector key={"blank-" + index} />);
    } else {
      const day = index - spaces;
      const stringIndex = `${year}${month}${day}`;
      let isFuture,
        isPast = false;
      if (disableFuture) {
        isFuture = testDay.future(disableFuture, year, month, day);
      }
      if (disablePast) {
        isPast = testDay.past(disablePast, year, month, day);
      }
      dayContent.push(
        <Day
          disabled={isFuture || isPast}
          key={stringIndex}
          value={day}
          label={day.toString()}
          index={stringIndex}
        />,
      );
    }
  }
  return { dayContent, lastDay, dayButton };
}

/* 
  --------------------------------------------------
  ----- TEST FUNCTION
  --------------------------------------------------
*/

const testYear = {
  future: (date: Date, year: number) => {
    return year > date.getFullYear();
  },
  past: (date: Date, year: number) => {
    return year < date.getFullYear();
  },
};

const testMonth = {
  future: (date: Date, y: number, m: number) => {
    if (date.getMonth() === m && date.getFullYear() === y) return false;
    const currentDate = new Date(y, m);
    return currentDate > date;
  },
  past: (date: Date, y: number, m: number) => {
    if (date.getMonth() === m && date.getFullYear() === y) return false;
    const currentDate = new Date(y, m);
    return currentDate < date;
  },
};

const testDay = {
  future: (date: Date, y: number, m: number, d: number) => {
    const currentDate = new Date(y, m, d);
    return currentDate > date;
  },
  past: (date: Date, y: number, m: number, d: number) => {
    const currentDate = new Date(y, m, d);
    return currentDate < date;
  },
};

function testLocale(locale?: string) {
  if (locale) {
    const split = locale.split("-");
    const lenghtTest = split.length <= 1 || split.length > 2;
    const stringTest = split[0].toUpperCase() !== split[1];
    if (lenghtTest || stringTest) {
      const systemLang = navigator.language;
      console.warn(
        `"${locale}" is incorrect locale information.\nDont worry "${systemLang}" has been set up according to your system settings`,
      );
      return systemLang;
    } else {
      return locale;
    }
  } else {
    return navigator.language;
  }
}

function testMaxDate(disableFuture?: boolean, maxDate?: Date) {
  if (disableFuture) {
    if (maxDate) {
      console.warn(propsWarn("minDate", "disablePast"));
      return testValidDate(maxDate, "maxDate");
    } else {
      return new Date();
    }
  } else {
    if (maxDate) {
      return testValidDate(maxDate, "maxDate");
    } else {
      return null;
    }
  }
}

function testMinDate(disablePast?: boolean, minDate?: Date) {
  if (disablePast) {
    if (minDate) {
      console.warn(propsWarn("minDate", "disablePast"));
      return testValidDate(minDate, "minDate");
    } else {
      return new Date();
    }
  } else {
    if (minDate) {
      return testValidDate(minDate, "minDate");
    } else {
      return null;
    }
  }
}

function testValidDate(
  date: Date | null,
  props: "minDate" | "maxDate" | "value",
) {
  if (date) {
    /* 
      TEST DATE 
    */
    if (isNaN(date.getTime())) {
      console.warn(
        `You have provided "${props}" with an invalid date.\n"${props}" has been set to null`,
      );
      return null;
    } else {
      return date;
    }
  } else {
    return null;
  }
}

function propsWarn(
  prop: "minDate" | "maxDate",
  prop1: "disablePast" | "disableFuture",
) {
  return `You cannot pass as props "${prop}" and "${prop1}" at the same time.\nThis is not an error don't worry, by default it will only pass "${prop}"`;
}
