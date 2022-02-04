import {
  ChangeEvent,
  Dispatch,
  FC,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DateRange, isValidRange } from "../utils/DateRange";
import { isValidDate } from "../utils/testDate";
import "./SCSS/mod-core-inputdate.scss";

type DateFormat = "D/M/Y" | "M/D/Y" | "Y/M/D";
type DateSeparator = "/" | "." | "-" | " ";
type DatePlaceholder = { dd: string; mm: string; yyyy: string };
type ScrollFocus = (index: 1 | -1, currentIndex: number) => void;
type OnChangeDate = (value: Date | null) => void;
type OnChangeDateRange = (value: DateRange) => void;
type OnChange = OnChangeDate | OnChangeDateRange;
interface Setter {
  focus: () => void;
  unfocus: () => void;
  getIndex: number;
}
interface ActiveInput {
  curr: number;
}
interface SetInput {
  [key: number]: Setter;
}

interface Props {
  name: string;
  range?: boolean;
  value: DateRange | (Date | null);
  minDate?: Date | null;
  maxDate?: Date | null;
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  datePlaceholder?: DatePlaceholder;
  rangeSeparator?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onSpaceDown?: () => void;
  onChange: OnChange;
}

type IE = HTMLInputElement;
type InputType = "D" | "M" | "Y";

const InputDate: FC<Props> = ({
  name,
  range = undefined,
  value,
  dateFormat = "D/M/Y",
  dateSeparator = "/",
  datePlaceholder = { dd: "dd", mm: "mm", yyyy: "yyyy" },
  rangeSeparator = "-",
  minDate = null,
  maxDate = null,
  disabled,
  readOnly,
  onSpaceDown,
  onChange,
}) => {
  function isDate(value: any) {
    if (value instanceof Date && isValidDate(value)) return value;
    else return null;
  }
  function isDateRange(value: any) {
    if (value instanceof DateRange && isValidRange(value)) {
      return new DateRange(value.min, value.max);
    } else return new DateRange(null, null);
  }
  /* ----- INPUT SETTER() ------------------------------------------ */

  const maxLenght = useRef(range ? 5 : 2).current;
  const activeInput = useRef<ActiveInput>({ curr: -1 }).current;
  const setInput = useRef<SetInput>({}).current;
  const scrollIndex = useRef({ curr: 0 }).current;
  const scrollFocus = useCallback(
    (scroll: 1 | -1, currentIndex: number) => {
      let index = currentIndex + scroll;
      if (index < 0) index = 0;
      if (index > maxLenght) index = maxLenght;
      scrollIndex.curr = index;
      setInput[currentIndex].unfocus();
      setInput[index].focus();
    },
    [maxLenght, scrollIndex, setInput],
  );
  const handleDateRangeChange = useCallback(
    (value: DateRange) => {
      onChange(value as any);
    },
    [onChange],
  );
  const handleDateChange = useCallback(
    (value: Date | null) => {
      onChange(value as any);
    },
    [onChange],
  );
  return (
    <Fragment>
      {range ? (
        <ModInputDateRange
          dateRange={isDateRange(value)}
          dateFormat={dateFormat}
          dateSeparator={dateSeparator}
          datePlaceholder={datePlaceholder}
          rangeSeparator={rangeSeparator}
          defaultMinDate={minDate}
          defaultMaxDate={maxDate}
          activeInput={activeInput}
          setInput={setInput}
          scrollFocus={scrollFocus}
          disabled={disabled}
          readonly={readOnly}
          onSpaceDown={onSpaceDown}
          onChange={handleDateRangeChange}
        />
      ) : (
        <ModInputDate
          date={isDate(value)}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={dateFormat}
          dateSeparator={dateSeparator}
          datePlaceholder={datePlaceholder}
          activeInput={activeInput}
          setInput={setInput}
          scrollFocus={scrollFocus}
          disabled={disabled}
          readonly={readOnly}
          onSpaceDown={onSpaceDown}
          onChange={handleDateChange}
        />
      )}
    </Fragment>
  );
};

export default InputDate;

/* 
  ------------------------------------------------------------------------- 
  ----- <INPUT DATE RANGE/>
  ------------------------------------------------------------------------- 
*/

interface InputDateRangeProps {
  dateRange: DateRange;
  defaultMinDate: Date | null;
  defaultMaxDate: Date | null;
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  datePlaceholder?: DatePlaceholder;
  rangeSeparator?: string;
  activeInput: ActiveInput;
  setInput: SetInput;
  scrollFocus: ScrollFocus;
  disabled?: boolean;
  readonly?: boolean;
  onSpaceDown?: () => void;
  onChange: (value: DateRange) => void;
}

const ModInputDateRange: FC<InputDateRangeProps> = ({
  dateRange,
  defaultMinDate,
  defaultMaxDate,
  rangeSeparator = "-",
  dateFormat = "D/M/Y",
  dateSeparator,
  datePlaceholder,
  activeInput,
  setInput,
  scrollFocus,
  disabled,
  readonly,
  onSpaceDown,
  onChange,
}) => {
  const [minDate, setMinDate] = useState(dateRange.min);
  const [maxDate, setMaxDate] = useState(dateRange.max);
  const handleMinChange = useCallback(
    (value: Date | null) => {
      setMinDate(value);
      onChange(new DateRange(value, maxDate));
    },
    [maxDate, onChange],
  );
  const handleMaxChange = useCallback(
    (value: Date | null) => {
      setMaxDate(value);
      onChange(new DateRange(minDate, value));
    },
    [minDate, onChange],
  );
  return (
    <div className="mod-inputdate-range">
      <ModInputDate
        date={dateRange.min}
        minDate={defaultMinDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        dateSeparator={dateSeparator}
        datePlaceholder={datePlaceholder}
        activeInput={activeInput}
        setInput={setInput}
        scrollFocus={scrollFocus}
        disabled={disabled}
        readonly={readonly}
        onChange={handleMinChange}
        onSpaceDown={onSpaceDown}
      />
      {rangeSeparator && (
        <div className="mod-inputdate-separator">{rangeSeparator}</div>
      )}
      <ModInputDate
        date={dateRange.max}
        minDate={minDate}
        maxDate={defaultMaxDate}
        dateFormat={dateFormat}
        dateSeparator={dateSeparator}
        datePlaceholder={datePlaceholder}
        activeInput={activeInput}
        setInput={setInput}
        scrollFocus={scrollFocus}
        disabled={disabled}
        readonly={readonly}
        onSpaceDown={onSpaceDown}
        onChange={handleMaxChange}
        indexOffset
      />
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <INPUT DATE/>
  ------------------------------------------------------------------------- 
*/
interface InputDateProps {
  date: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  datePlaceholder?: DatePlaceholder;
  setInput: SetInput;
  activeInput: ActiveInput;
  indexOffset?: boolean;
  scrollFocus: ScrollFocus;
  disabled?: boolean;
  readonly?: boolean;
  onSpaceDown?: () => void;
  onChange: (value: Date | null) => void;
}
const ModInputDate: FC<InputDateProps> = ({
  date,
  minDate,
  maxDate,
  dateFormat = "D/M/Y",
  dateSeparator = "/",
  datePlaceholder = { dd: "dd", mm: "mm", yyyy: "yyyy" },
  indexOffset,
  activeInput,
  setInput,
  scrollFocus,
  disabled,
  readonly,
  onSpaceDown,
  onChange,
}) => {
  const [focus, setFocus] = useState(false);
  const { dd, mm, yyyy } = datePlaceholder;
  const inputType = useRef<InputType[]>(
    dateFormat.split("/") as InputType[],
  ).current;
  const [year, setYear] = useState(yyyy);
  const [month, setMonth] = useState(mm);
  const [day, setDay] = useState(dd);

  const [rangeYear, setRangeYear] = useState(() => {
    let min = 0;
    let max = 9999;
    if (minDate) min = dateToNumber(minDate).year;
    if (maxDate) max = dateToNumber(maxDate).year;
    return { min, max };
  });

  const [rangeMonth, setRangeMonth] = useState({ min: 1, max: 11 });
  const [rangeDay, setRangeDay] = useState({ min: 1, max: 31 });

  const checkDate = useRef((year: string, month: string, day: string) => {
    const check = validDate(year, month, day);
    switch (check) {
      case "invalid":
        if (date) {
          const { Y, M, D } = dateToString(date);
          setYear(Y);
          setMonth(M);
          setDay(D);
        }
        break;
      case null:
        if (date) onChange(null);
        break;
      default:
        break;
    }
    console.log(year, month, day);
  });

  const checkIsValidDate = useCallback(
    (digit: number, type: InputType) => {
      let currDate: Date | null = null;
      switch (type) {
        case "Y":
          currDate = new Date(digit);
          break;
        case "M":
          break;
        case "D":
          console.log(year, month, digit);
          break;
      }
    },
    [month, year],
  );

  const handleYear = useCallback((year: number, index: number) => {}, []);
  const handleMonth = useCallback((month: number, index: number) => {}, []);
  const handleDay = useCallback(
    (day: number, index: number) => {
      console.log(day);
      const { min, max } = rangeDay;
      switch (true) {
        case day >= 4 && day <= 9:
          setDay(`${day}`);
          scrollFocus(1, index);
          break;
        case day >= 10 && day < max:
          setDay(`${day}`);
          scrollFocus(1, index);
          break;
        case day >= max:
          setDay(`${max}`);
          scrollFocus(1, index);
          break;
        default:
          setDay(`${day}`);
          break;
      }
      checkIsValidDate(day, "D");
    },
    [checkIsValidDate, rangeDay, scrollFocus],
  );
  const handleKeydown = useCallback(
    (
      event: KeyboardEvent<IE>,
      value: number,
      type: InputType,
      index: number,
    ) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          console.log("space");
          if (onSpaceDown) onSpaceDown();
          break;
        case "Backspace":
        case "Delete":
          event.preventDefault();
          switch (type) {
            case "Y":
              setYear(yyyy);
              break;
            case "M":
              setMonth(mm);
              break;
            case "D":
              setDay(dd);
              break;
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          checkIsValidDate(value, type);
          scrollFocus(-1, index);
          break;
        case "ArrowRight":
          event.preventDefault();
          checkIsValidDate(value, type);
          scrollFocus(1, index);
          break;
        case "ArrowUp":
          event.preventDefault();
          break;
        case "ArrowDown":
          event.preventDefault();
          break;
      }
    },
    [checkIsValidDate, dd, mm, onSpaceDown, scrollFocus, yyyy],
  );
  const handleBlur = useCallback((digit: number, _type: InputType) => {}, []);

  const fristRender = useRef(true);
  useEffect(() => {
    if (fristRender.current) {
      fristRender.current = false;
    } else {
      if (!focus) {
        checkDate.current(year, month, day);
      }
    }
  }, [day, focus, month, year]);

  const updateValue = useCallback(() => {
    console.log(date);
    if (date) {
      const { Y, M, D } = dateToString(date);
      setYear(Y);
      setMonth(M);
      setDay(D);
    } else {
      setYear(yyyy);
      setMonth(mm);
      setDay(dd);
    }
  }, [dd, mm, date, yyyy]);
  useEffect(() => {
    updateValue();
  }, [updateValue]);
  const input = {
    Y: (
      <Input
        id="Y"
        value={year}
        index={getIndex("Y")}
        onChange={handleYear}
        setInput={setInput}
        activeInput={activeInput}
        disabled={disabled}
        readonly={readonly}
        setFocus={setFocus}
        onKeydown={handleKeydown}
        onBlur={handleBlur}
      />
    ),
    M: (
      <Input
        id="M"
        value={month}
        index={getIndex("M")}
        onChange={handleMonth}
        setInput={setInput}
        activeInput={activeInput}
        disabled={disabled}
        readonly={readonly}
        setFocus={setFocus}
        onKeydown={handleKeydown}
        onBlur={handleBlur}
      />
    ),
    D: (
      <Input
        id="D"
        value={day}
        index={getIndex("D")}
        onChange={handleDay}
        setInput={setInput}
        activeInput={activeInput}
        disabled={disabled}
        readonly={readonly}
        setFocus={setFocus}
        onKeydown={handleKeydown}
        onBlur={handleBlur}
      />
    ),
  };
  function getIndex(input: InputType) {
    let index = inputType.indexOf(input);
    if (indexOffset) {
      return index + 3;
    }
    return index;
  }
  function setClassName() {
    let classname = "mod-inputdate";
    if (focus) classname += " mod-focus";
    if (readonly) classname += "mod-readonly";
    if (disabled) classname += "mod-disabled";
    return classname;
  }
  return (
    <div className={setClassName()}>
      {input[inputType[0]]}
      <div className="mod-input-date-separator">{dateSeparator}</div>
      {input[inputType[1]]}
      <div className="mod-input-date-separator">{dateSeparator}</div>
      {input[inputType[2]]}
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <INPUT />
  ------------------------------------------------------------------------- 
*/
type HandleKeydown = (
  event: KeyboardEvent<IE>,
  value: number,
  type: InputType,
  index: number,
) => void;

interface InputProps {
  id: InputType;
  value: string;
  index: number;
  pad?: number;
  activeInput: ActiveInput;
  setInput: SetInput;
  disabled?: boolean;
  readonly?: boolean;
  setFocus: Dispatch<SetStateAction<boolean>>;
  onChange: (value: number, index: number) => void;
  onKeydown: HandleKeydown;
  onBlur: (digit: number, type: InputType) => void;
}
const Input: FC<InputProps> = ({
  id,
  value,
  index,
  pad = 2,
  activeInput,
  setInput,
  disabled,
  readonly,
  setFocus,
  onChange,
  onKeydown,
  onBlur,
}) => {
  const ref = useRef<IE>(null);
  const [active, setActive] = useState(false);
  const handleChange = (event: ChangeEvent<IE>) => {
    if (disabled || readonly) return;
    event.target.focus();
    const digit = event.target.value;
    if (digit === "" || /^\d+$/.test(digit)) {
      onChange(parseInt(digit), index);
    }
  };
  const select = () => {
    if (disabled || readonly) return;
    setFocus(true);
    setActive(true);
    ref.current!.select();
    activeInput.curr = index;
  };

  const unselect = () => {
    if (disabled || readonly) return;
    setFocus(false);
    setActive(false);
    ref.current!.blur();
    activeInput.curr = -1;
  };
  const handleKeydown = (event: KeyboardEvent<IE>) => {
    if (disabled || readonly) return;
    onKeydown(event, parseInt(value), id, index);
  };
  const handleBlur = () => {
    if (disabled || readonly) return;
    unselect();
    onBlur(parseInt(value), id);
  };

  const subscribe = useRef(() => {
    setInput[index] = {
      focus: () => select(),
      unfocus: () => setFocus(false),
      getIndex: index,
    };
  });
  const unsubscribe = useCallback(() => {
    delete setInput[index];
  }, [index, setInput]);
  useEffect(() => {
    subscribe.current();
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);
  const renderValue = (value: string) => {
    return value.padStart(pad, "0");
  };
  function setClassName() {
    let classname = "mod-input-core";
    if (active) classname += " mod-active";
    if (readonly) classname += " mod-readonly";
    if (disabled) classname += " mod-disabled";
    return classname;
  }
  return (
    <Fragment>
      <input
        id={id}
        className={setClassName()}
        type="text"
        ref={ref}
        value={renderValue(value)}
        onChange={handleChange}
        onClick={select}
        onFocus={select}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        disabled={disabled || readonly}
        readOnly={readonly}
      />
    </Fragment>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- TEST FUNCTION()
  ------------------------------------------------------------------------- 
*/

function dateToNumber(date: Date) {
  const clone = new Date(date);
  return {
    year: clone.getFullYear(),
    month: clone.getMonth(),
    day: clone.getDate(),
  };
}
function dateToString(date: Date) {
  const cloneDate = new Date(date);
  const Y = cloneDate.getFullYear().toString();
  const M = `${cloneDate.getMonth() + 1}`.padStart(2, "0");
  const D = `${cloneDate.getDate()}`.padStart(2, "0");
  return { Y, M, D };
}
function validDate(year: string, month: string, day: string) {
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);
  if (isNaN(y) && isNaN(m) && isNaN(d)) return null;
  if (isNaN(y) || isNaN(m) || isNaN(d)) return "invalid";
  const date = new Date(y, m, d);
  if (isValidDate(date)) return date;
  else return "invalid";
}

function isDateRange(value: any) {
  if (value instanceof DateRange) {
    return value;
  }
  return new DateRange(null, null);
}
function isDate(value: any) {
  if (value instanceof Date) return value;
  return null;
}
