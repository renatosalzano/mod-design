import {
  ChangeEvent,
  createContext,
  FC,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DateRange, isValidRange, toDateRange } from "../utils/DateRange";
import { DateX, indexToDateX, preventDayOverflow, toDate, toDateX } from "../utils/DateX";
import { CoreProps, ModuleCore, useModuleCore } from "./ModuleCore";
import "./SCSS/mod-core-inputdate.scss";

type DateFormat = "D/M/Y" | "M/D/Y" | "Y/M/D";
type DateSeparator = "/" | "." | "-" | " ";
type DatePlaceholder = { dd: string; mm: string; yyyy: string };
type Value = { start: Date | string | null; end: Date | string | null } | (Date | string | null);
interface Option {
  rangeErrorMessage?: { lessMinDate: string; greaterMaxDate: string };
}

interface Props extends CoreProps {
  name?: string;
  range?: boolean;
  value: Value;
  minDate?: Date | null;
  maxDate?: Date | null;
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  datePlaceholder?: DatePlaceholder;
  rangeSeparator?: string;
  readOnly?: boolean;
  option?: Option;
  returnType?: "date" | "date-string";
  onSpaceDown?: () => void;
  onChange: <T extends Value>(value: T) => void;
  skipCheck?: boolean;
}

type IE = HTMLInputElement;
type InputType = "D" | "M" | "Y";

interface RangeStatus {
  start: InputStatus;
  end: InputStatus;
}
interface InputSetter {
  active(): void;
  idle(): void;
  getIndex: number;
}

interface InputData {
  range?: boolean;
  value: any;
  lenght: number;
  active: number;
  scrollIndex: number;
  rangeStatus: RangeStatus;
  rangeError: boolean;
  returnType: "date" | "date-string";
  rangeValue: { start: Date | null; end: Date | null };
  update(value: any): void;
  scrollActive(scroll: 1 | -1, currIndex: number): void;
  focus(index?: number): void;
  handleChange<T extends Value>(value: T): void;
  handleBlur(): void;
  subscribe(index: number, setter: InputSetter): void;
  unsubscribe(index: number): void;
  setValue(value: any): void;
  setRangeStatus(range: "start" | "end", status: InputStatus): void;
  setRangeValue(type: "start" | "end", value: Date | null): void;
  toDateString(value: any): string | { start: string; end: string };
  set: { [key: number]: InputSetter };
}

const InputDate: FC<Props> = ({
  name,
  range = undefined,
  value,
  dateFormat = "Y/M/D",
  dateSeparator = "/",
  datePlaceholder = { dd: "dd", mm: "mm", yyyy: "yyyy" },
  rangeSeparator = "-",
  returnType = "date",
  minDate = null,
  maxDate = null,
  focused,
  disabled,
  readOnly,
  error,
  onSpaceDown,
  onChange,
  themeColor,
  skipCheck,
  border = false,
}) => {
  const { isFocus, isDisabled, isError, setFocus, setBlur } = useModuleCore({
    focused: focused,
    disabled: disabled,
    error: error,
  });

  const inputData = useRef<InputData>({
    range,
    value,
    lenght: range ? 5 : 2,
    active: -1,
    scrollIndex: 0,
    rangeStatus: { start: "null", end: "null" },
    rangeValue: { start: null, end: null },
    rangeError: false,
    returnType,
    update(value) {
      if (this.range) {
        /* ----- RANGE */
        const { start, end } = clone(value, true);
        if (start) this.rangeStatus.start = "filled";
        if (end) this.rangeStatus.end = "filled";
        this.rangeValue = clone(value, true);
      } else {
        /* ----- NOT RANGE */
      }
    },
    scrollActive(scroll: 1 | -1, currIndex: number) {
      let index = currIndex + scroll;
      if (index < 0) index = 0;
      if (index > this.lenght) index = this.lenght;
      this.scrollIndex = index;
      this.set[currIndex].idle();
      this.set[index].active();
    },
    focus(index) {
      if (index) this.active = index;
      setFocus();
    },
    handleChange(value) {
      switch (returnType) {
        case "date-string":
          const output = this.toDateString(value);
          onChange(output);
          break;
        default:
          onChange(value);
      }
    },
    toDateString(value) {
      if (this.range) {
        const start = value.start ? new DateX(value.start).toStringDigit() : "null";
        const end = value.end ? new DateX(value.end).toStringDigit() : "null";
        return { start, end };
      } else {
        return value ? new DateX(value).toStringDigit() : "null";
      }
    },
    setValue(value) {
      this.value = value;
    },
    setRangeStatus(range, status) {
      this.rangeStatus[range] = status;
    },
    setRangeValue(type: "start" | "end", value: Date | null) {},
    handleBlur() {
      if (this.range) {
        if (this.rangeStatus.start === "unfilled" || this.rangeStatus.end === "unfilled") {
          this.handleChange(this.value);
        }
      } else {
        /* NOT RANGE */
      }

      setBlur();
    },
    subscribe(index, setter) {
      this.set[index] = setter;
    },
    unsubscribe(index) {
      delete this.set[index];
    },
    set: {},
  }).current;

  function clone(value: any, range: boolean): any {
    if (range) {
      const start = value.start ? new Date(value.start) : null;
      const end = value.end ? new Date(value.end) : null;
      const clone = { start, end };
      return { ...clone };
    } else {
      const date = value ? new Date(value) : null;
      return date;
    }
  }

  useEffect(() => {
    inputData.update(value);
  }, [inputData, value]);

  const handleChange = useCallback(
    (value: any) => {
      inputData.handleChange(value);
    },
    [inputData],
  );

  const handleTrigger = useCallback(() => inputData.handleBlur(), [inputData]);

  return (
    <ModuleCore
      cssCustom="mod-inputdate-core"
      focused={isFocus}
      error={isError}
      disabled={isDisabled}
      border={border}
      themeColor={themeColor}>
      <InputDateCore
        value={value}
        range={range}
        dateFormat={dateFormat}
        dateSeparator={dateSeparator}
        datePlaceholder={datePlaceholder}
        error={isError}
        focus={isFocus}
        inputData={inputData}
        onTriggerClick={handleTrigger}
        onSpaceDown={onSpaceDown}>
        {range ? (
          <ModInputDateRange
            value={value}
            rangeSeparator={rangeSeparator}
            defaultMinDate={minDate}
            defaultMaxDate={maxDate}
            disabled={disabled}
            readonly={readOnly}
            onSpaceDown={onSpaceDown}
            onChange={handleChange}
          />
        ) : (
          <ModInputDate
            date={isDate(value)}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            readonly={readOnly}
            onSpaceDown={onSpaceDown}
            onChange={handleChange}
          />
        )}
      </InputDateCore>
    </ModuleCore>
  );
};

export default InputDate;
type InputStatus = "null" | "filled" | "unfilled";

/* 
  ------------------------------------------------------------------------- 
  ----- <INPUT CORE />
  ------------------------------------------------------------------------- 
*/
interface InputDateCoreProps {
  value: any;
  range?: boolean;
  error: boolean;
  focus: boolean;
  dateFormat: DateFormat;
  dateSeparator: DateSeparator;
  datePlaceholder: DatePlaceholder;
  inputData: InputData;
  onTriggerClick: () => void;
  onSpaceDown?: () => void;
}

interface InputDateStore {
  inputData: InputData;
  dateFormat: DateFormat;
  dateSeparator: DateSeparator;
  datePlaceholder: DatePlaceholder;
  error: boolean;
  focus: boolean;
  onSpaceDown?: () => void;
}
const InputDateContext = createContext<InputDateStore>({} as InputDateStore);
const useInputDateCore = () => useContext(InputDateContext);
const InputDateCore: FC<InputDateCoreProps> = ({
  range,
  value,
  error,
  focus,
  dateFormat,
  datePlaceholder,
  dateSeparator,
  inputData,
  onSpaceDown,
  onTriggerClick,
  children,
}) => {
  /* 
  ------------------------------------------------------------------------- 
  ----- INPUT DATA()
  ------------------------------------------------------------------------- 
  */

  return (
    <InputDateContext.Provider
      value={{
        inputData,
        focus,
        error,
        dateFormat,
        dateSeparator,
        datePlaceholder,
        onSpaceDown,
      }}>
      {children}
      {focus && <div className="mod-trigger" onClick={onTriggerClick} />}
    </InputDateContext.Provider>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <INPUT DATE RANGE/>
  ------------------------------------------------------------------------- 
*/

interface InputDateRangeProps {
  value: any;
  defaultMinDate: Date | null;
  defaultMaxDate: Date | null;
  rangeSeparator?: string;
  disabled?: boolean;
  readonly?: boolean;
  onSpaceDown?: () => void;
  onChange: (value: any) => void;
}

const ModInputDateRange: FC<InputDateRangeProps> = ({
  value,
  defaultMinDate,
  defaultMaxDate,
  rangeSeparator = "-",
  disabled,
  readonly,
  onSpaceDown,
  onChange,
}) => {
  const { error } = useInputDateCore();
  const [{ start, end }, setRange] = useState(value);

  /* function init(date: Date | null, defaultDate: Date | null) {
    if (date) return date;
    else return defaultDate;
  }

  const [minDate, setMinDate] = useState(() => init(start, defaultMinDate));
  const [maxDate, setMaxDate] = useState(() => init(end, defaultMaxDate)); */

  const rangeDate = useRef({
    value: { start: null, end: null } as any,
    update(value: any) {
      let tempObj = {} as { [key: string]: any };
      for (var i in value) {
        tempObj[i] = value[i];
      }
      this.value = { ...tempObj };
      setRange({ ...tempObj });
    },
    setStart(value: Date | null) {
      this.value.start = value;
      this.update(this.value);
      this.handleChange();
    },
    setEnd(value: Date | null) {
      this.value.end = value;
      this.update(this.value);
      this.handleChange();
    },
    handleChange() {
      onChange(this.value);
    },
  }).current;

  useEffect(() => {
    if (!error) {
      rangeDate.update(value);
    }
  }, [error, rangeDate, value]);

  const handleMinChange = useCallback(
    (value: Date | null) => {
      rangeDate.setStart(value);
    },
    [rangeDate],
  );
  const handleMaxChange = useCallback(
    (value: Date | null) => {
      rangeDate.setEnd(value);
    },
    [rangeDate],
  );

  return (
    <div className="mod-inputdate-range">
      <ModInputDate
        rangeType="start"
        date={start}
        minDate={defaultMinDate}
        maxDate={end}
        disabled={disabled}
        readonly={readonly}
        onChange={handleMinChange}
        onSpaceDown={onSpaceDown}
      />
      {rangeSeparator && <div className="mod-inputdate-separator">{rangeSeparator}</div>}
      <ModInputDate
        rangeType="end"
        date={end}
        minDate={start}
        maxDate={defaultMaxDate}
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
  rangeType?: "start" | "end";
  date: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  indexOffset?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onSpaceDown?: () => void;
  onChange: (value: Date | null) => void;
}
interface StateData {
  value: DateX | null;
  min: Date | null;
  max: Date | null;
  dayInMonth: number;
  dateIndex: { year: number; month: number; day: number };
  status: "null" | "filled" | "unfilled";
  update(value: DateX | null, minDate: Date | null, maxDate: Date | null): void;
  updateFilled(date: DateX): void;
  renderDate(y?: string | null, m?: string | null, d?: string | null): void;
  checkNaN(): "null" | "filled" | "unfilled";
  checkDate(checkYear?: true): void;
  checkDateInRange(date: DateX): DateX;
  setYear(year: number): void;
  setMonth(month: number): void;
  setDay(day: number): void;
  cancel(type: "Y" | "M" | "D"): void;
  getDayInMonth(): { max: number; maxFristDigit: number };
}
const ModInputDate: FC<InputDateProps> = ({
  rangeType = "start",
  date,
  minDate,
  maxDate,
  indexOffset,
  disabled,
  readonly,
  onSpaceDown,
  onChange,
}) => {
  const {
    inputData,
    focus,
    dateFormat,
    dateSeparator,
    datePlaceholder: { dd, mm, yyyy },
  } = useInputDateCore();
  const inputType = useRef<InputType[]>(dateFormat.split("/") as InputType[]).current;
  const [Y, renderY] = useState(yyyy);
  const [M, renderM] = useState(mm);
  const [D, renderD] = useState(dd);

  const stateData = useRef<StateData>({
    value: null,
    min: minDate,
    max: maxDate,
    dateIndex: { year: NaN, month: NaN, day: NaN },
    dayInMonth: 31,
    status: "null",
    update(value, minDate, maxDate) {
      if (value) {
        this.value = new DateX(value);
        this.dateIndex = this.value.getIndexDate();
        this.updateFilled(this.value);
      } else {
        this.status = "null";
        this.value = null;
        this.dateIndex = { year: NaN, month: NaN, day: NaN };
        this.renderDate(yyyy, mm, dd);
      }
      if (minDate) this.min = minDate;
      if (maxDate) this.max = maxDate;
    },
    updateFilled(date: DateX) {
      this.status = "filled";
      this.value = date;
      this.dateIndex = date.getIndexDate();
      const { year, month, day } = date.toObjectDigit();
      this.renderDate(year, month, day);
      inputData.setRangeStatus(rangeType, "filled");
    },
    renderDate(y, m, d) {
      if (y) renderY(y);
      if (m) renderM(m);
      if (d) renderD(d);
    },
    checkNaN() {
      const { year, month, day } = this.dateIndex;
      switch (true) {
        case isNaN(year) && isNaN(month) && isNaN(day):
          inputData.setRangeStatus(rangeType, "null");
          return "null";
        case isNaN(year) || isNaN(month) || isNaN(day):
          inputData.setRangeStatus(rangeType, "unfilled");
          return "unfilled";
        default:
          inputData.setRangeStatus(rangeType, "filled");
          return "filled";
      }
    },
    checkDateInRange(date) {
      switch (date.compareInRange(this.min, this.max)) {
        case "less min":
          return new DateX(this.min as Date);
        case "greater max":
          return new DateX(this.max as Date);
        default:
          return date;
      }
    },
    checkDate() {
      if (this.checkNaN() === "filled") {
        const { year, month, day } = this.dateIndex;
        const update = preventDayOverflow(year, month, day);
        this.updateFilled(update);
        onChange(new Date(update));
      }
    },
    getDayInMonth() {
      const maxFristDigit = parseInt(`${this.dayInMonth}`[0]);
      return { max: this.dayInMonth, maxFristDigit };
    },
    setYear(year) {
      this.dateIndex.year = year;
      if (this.checkNaN() === "unfilled") {
        const yearStr = `${year}`.padStart(4, "0");
        this.renderDate(yearStr, null, null);
      } else {
        this.checkDate();
      }
    },
    setMonth(month) {
      this.dateIndex.month = month;
      if (this.checkNaN() === "unfilled") {
        const monthStr = `${month + 1}`.padStart(2, "0");
        this.renderDate(null, monthStr, null);
      } else {
        this.checkDate();
      }
    },
    setDay(day) {
      this.dateIndex.day = day;
      if (this.checkNaN() === "unfilled") {
        const dayStr = `${day}`.padStart(2, "0");
        this.renderDate(null, null, dayStr);
      } else {
        this.checkDate();
      }
    },
    cancel(type: "Y" | "M" | "D") {
      switch (type) {
        case "Y":
          this.dateIndex.year = NaN;
          renderY(yyyy);
          break;
        case "M":
          this.dateIndex.month = NaN;
          renderM(mm);
          break;
        case "D":
          this.dateIndex.day = NaN;
          renderD(dd);
          break;
      }
      switch (this.checkNaN()) {
        case "null":
          this.status = "null";
          onChange(null);
          break;
        case "unfilled":
          this.status = "unfilled";
      }
    },
  }).current;

  useEffect(() => {
    stateData.update(toDateX(date), minDate, maxDate);
  }, [date, maxDate, minDate, stateData]);

  const input = {
    Y: (
      <Input
        type="Y"
        value={Y}
        pad={4}
        index={getIndex("Y")}
        stateData={stateData}
        disabled={disabled}
        readonly={readonly}
      />
    ),
    M: (
      <Input
        type="M"
        value={M}
        index={getIndex("M")}
        stateData={stateData}
        disabled={disabled}
        readonly={readonly}
      />
    ),
    D: (
      <Input
        type="D"
        value={D}
        index={getIndex("D")}
        stateData={stateData}
        disabled={disabled}
        readonly={readonly}
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
    if (disabled) classname += " mod-disabled";
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
  type: InputType;
  value: string;
  index: number;
  pad?: number;
  disabled?: boolean;
  readonly?: boolean;
  stateData: StateData;
}
const Input: FC<InputProps> = ({ type, value, index, pad = 2, disabled, readonly, stateData }) => {
  const { inputData, onSpaceDown } = useInputDateCore();
  const [fristDigit, setFristDigit] = useState("");
  const ref = useRef<IE>(null);

  const [active, setActive] = useState(false);

  const select = useRef(() => {
    if (disabled || readonly) return;
    inputData.focus(index);
    setActive(true);
    ref.current!.focus();
  }).current;

  const unselect = useRef(() => {
    if (disabled || readonly) return;
    setActive(false);
    ref.current!.blur();
  }).current;

  useEffect(() => {
    inputData.subscribe(index, {
      active() {
        select();
      },
      idle() {
        unselect();
      },
      getIndex: index,
    });
    return () => {
      inputData.unsubscribe(index);
    };
  }, [index, inputData, select, unselect]);
  interface Handle {
    fristDigit: string;
    scroll: boolean;
    value: string;
    yearDigit: number[];
    update(digit: number): void;
    notDigit(value: string): boolean;
    change(event: ChangeEvent<IE>): any;
    year(digit: number): void;
    month(digit: number): void;
    day(digit: number): void;
    render(digit: number): void;
    scrollInput(prev?: boolean): void;
    checkFristDigit(): void;
    cancel(): void;
  }

  const handle = useRef<Handle>({
    fristDigit: "",
    scroll: false,
    value: "",
    yearDigit: [],
    update(digit) {
      switch (type) {
        case "Y":
          stateData.setYear(digit);
          break;
        case "M":
          stateData.setMonth(digit);
          break;
        case "D":
        default:
          stateData.setDay(digit);
          break;
      }
    },
    notDigit(value) {
      if (value === "" || /^\d+$/.test(value)) return false;
      else return true;
    },
    change(event) {
      const { value } = event.target;
      if (value === "" || /^\d+$/.test(value)) {
        const digit = parseInt(value);
        switch (type) {
          case "Y":
            this.year(digit);
            break;
          case "M":
            this.month(digit);
            break;
          case "D":
          default:
            this.day(digit);
            break;
        }
      }
    },
    year(digit) {
      if (this.fristDigit) {
        if (this.fristDigit.length > 0 && this.fristDigit.length < 3) {
          this.fristDigit = `${digit}`;
          setFristDigit(`${digit}`);
          this.update(digit);
        } else {
          this.update(digit);
          this.fristDigit = "";
          setFristDigit("");
        }
      } else {
        if (digit !== 0) {
          this.fristDigit = `${digit}`;
          setFristDigit(`${digit}`);
          this.update(digit);
        } else {
          this.render(digit);
        }
      }
    },
    month(digit) {
      if (this.fristDigit === "") {
        if (digit >= 0 && digit <= 1) {
          this.fristDigit = `${digit}`;
          setFristDigit(`${digit}`);
          this.render(digit);
        } else {
          this.update(digit - 1);
          this.scrollInput();
        }
      } else {
        switch (true) {
          case digit === 0:
            this.update(0);
            break;
          case digit > 12:
            this.update(11);
            break;
          default:
            this.update(digit - 1);
            break;
        }
        this.scrollInput();
      }
    },
    day(digit) {
      const { max, maxFristDigit } = stateData.getDayInMonth();
      if (this.fristDigit === "") {
        if (digit >= 0 && digit <= maxFristDigit) {
          this.fristDigit = `${digit}`;
          setFristDigit(`${digit}`);
          stateData.renderDate(undefined, null, toDigit(`${digit}`));
        } else {
          this.update(digit);
          this.scrollInput();
        }
      } else {
        switch (true) {
          case digit === 0:
            this.update(1);
            break;
          case digit > max:
            this.update(max);
            break;
          default:
            this.update(digit);
            break;
        }
        this.scrollInput();
      }
    },
    render(digit) {
      const update = toDigit(`${digit}`);

      switch (type) {
        case "Y":
          stateData.renderDate(update, null, null);
          break;
        case "M":
          stateData.renderDate(null, update, null);
          break;
        case "D":
          stateData.renderDate(null, null, update);
          break;
      }
    },
    scrollInput(prev) {
      this.fristDigit = "";
      setFristDigit("");
      if (prev) inputData.scrollActive(-1, index);
      else inputData.scrollActive(1, index);
    },
    checkFristDigit() {
      if (this.fristDigit) {
        const digit = parseInt(this.fristDigit);
        switch (type) {
          case "Y":
            if (digit === 0) {
              this.update(1);
            } else {
              this.update(digit);
            }
            break;
          case "M":
            if (digit === 0) {
              this.update(0);
            } else {
              this.update(digit - 1);
            }
            break;
          case "D":
            if (digit === 0) {
              this.update(1);
            } else {
              this.update(digit);
            }
            break;
        }
        this.fristDigit = "";
        setFristDigit("");
      }
    },
    cancel() {
      this.fristDigit = "";
      setFristDigit("");
      stateData.cancel(type);
    },
  }).current;

  /* 
             CONTROLLARE FRIST DIGIT NEL BLUR E NEL CAMBIO FOCUS
           */

  const handleKeydown = useCallback(
    (event: KeyboardEvent<IE>) => {
      if (disabled || readonly) return;
      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (onSpaceDown) onSpaceDown();
          break;
        case "Backspace":
        case "Delete":
          event.preventDefault();
          handle.cancel();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handle.scrollInput(true);
          inputData.scrollActive(-1, index);
          break;
        case "ArrowRight":
          event.preventDefault();
          inputData.scrollActive(1, index);
          break;
        case "ArrowUp":
          event.preventDefault();
          break;
        case "ArrowDown":
          event.preventDefault();
          break;
      }
    },
    [disabled, handle, index, inputData, onSpaceDown, readonly],
  );

  const handleBlur = useCallback(() => {
    if (disabled || readonly) return;
    handle.checkFristDigit();
    setActive(false);
  }, [disabled, handle, readonly]);

  const handleChange = useCallback(
    (event: ChangeEvent<IE>) => {
      return handle.change(event);
    },
    [handle],
  );
  const toDigit = (value: string) => {
    return value.padStart(pad, "0");
  };
  function setClassName() {
    let classname = `mod-input-core ${type}`;
    if (active) classname += " mod-active";
    if (readonly) classname += " mod-readonly";
    if (disabled) classname += " mod-disabled";
    return classname;
  }
  return (
    <span className={setClassName()} onClick={select}>
      {toDigit(value)}
      <input
        className="mod-input"
        type="text"
        ref={ref}
        value={fristDigit}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeydown}
        disabled={disabled || readonly}
        readOnly={readonly}
      />
    </span>
  );
};

function isDate(value: any) {
  if (value instanceof Date) return value;
  return null;
}
