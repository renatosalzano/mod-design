import {
  createContext,
  createElement,
  Dispatch,
  FC,
  Fragment,
  memo,
  MutableRefObject,
  ReactElement,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { CoreProps, ModuleCore, useModuleCore } from "./ModuleCore";
import { Button, MatArrow } from "./Button";
import InputDate from "./InputDate";
import { ArrowIcon, CalendarIcon } from "../icons";
import "./SCSS/mod-core-datepicker.scss";
import { useScrollBlock } from "../utils/blockScroll";
import { checkRange, checkIsRange, toRange } from "../utils/DateRange";
import { DateX, toDate, isEqualDate, testLocale } from "../utils/DateX";
import { usePrevious } from "../utils/usePrevious";
import { ClickInRange } from "../utils/useDebounce";

type RangeType = "start" | "end";
type RE = ReactElement;
type Mode = "day" | "month" | "year";
type DateFormat = "D/M/Y" | "M/D/Y" | "Y/M/D";
type DateSeparator = "/" | "." | "-" | " ";
type DatePlaceholder = { dd: string; mm: string; yyyy: string };
interface Option {
  weekday?: "narrow" | "short";
  headerButton?: "2-button";
  monthOption?: { button?: "short" | "long"; calendar?: "short" | "long" };
}
interface Localization {
  locale: string | undefined;
  fristDayWeek: "saturday" | "sunday" | "monday";
  startDate: string;
  endDate: string;
  selectDate: string;
  apply: string;
  cancel: string;
  fix: string;
  today: string;
  mustBeLessThan: string;
  mustBeGreaterThan: string;
}

interface InputProps {
  dateSeparator?: DateSeparator;
  datePlaceholder?: DatePlaceholder;
  rangeSeparator?: string;
  readOnly?: boolean;
}

type TRange = { start: Date | null; end: Date | null };
type TDate = Date | null;

interface Props extends CoreProps {
  name?: string;
  /**
   * @param value
   * @warning In range mode, value must be { start: Date | null, end: Date | null }
   * @example <DatePicker range value={{start,end}} />
   */
  value: TRange | TDate;
  /**
   * Enable range mode.
   * @param range Can be set to "2-calendar" to display two calendars.
   * @warning In this mode, value must be { start: Date | null, end: Date | null }
   * @example <DatePicker value={Date()} onChange={(value:Date()) => {...}} />
   * <DatePicker range value={{start,end}} onChange={(value:{start,end}) => {...}} />
   */
  range?: boolean | "2-calendar";
  openTo?: "day" | "month" | "year";
  dateFormat?: DateFormat;
  /**
   * Translate calendar.
   * @example <DatePicker localization={{
   * locale: "it-IT",
   * fristDayWeek: "monday",
   * startDate: "data di inizio",
   * endDate: "data di fine",
   * selectDate: "Seleziona Data",
   * today: "oggi",
   * apply: "Conferma",
   * cancel: "Annulla",
   * fix: "Aggiusta",
   * mustBeLessThan: "deve essere minore di",
   * mustBeGreaterThan: "deve essere maggiore di",
   * }} />
   *
   */
  localization?: Localization;
  /**
   * Set minimum date selectable.
   */
  minDate?: Date;
  /**
   * Set maximum date selectable.
   */
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  option?: Option;
  actionButton?: boolean;
  inputProps?: InputProps;
  onChange:
    | ((value: Date | null) => void)
    | ((value: { start: Date | null; end: Date | null }) => void);
}

const DatePicker: FC<Props> = ({
  name = "UNKNOWN",
  value,
  range = undefined,
  minDate = null,
  maxDate = null,
  openTo = "day",
  dateFormat = "Y/M/D",
  option = {
    weekday: "narrow",
    monthOption: { button: "long", calendar: "short" },
  },
  inputProps,
  actionButton = false,
  localization = {
    locale: undefined,
    fristDayWeek: "sunday",
    startDate: "start date",
    endDate: "end date",
    selectDate: "select date",
    apply: "apply",
    cancel: "cancel",
    fix: "fix",
    today: "today",
    mustBeLessThan: "must be less than",
    mustBeGreaterThan: "must be greater than",
  },
  focused,
  disabled,
  error,
  helperText,
  themeColor,
  onChange,
}) => {
  /* 
  ------------------------------------------------------------------------- 
  ----- RENDER DATA ()
  ------------------------------------------------------------------------- 
  */

  const [dropdown, setDropdown] = useState(false);
  const [close, setClose] = useState(false);
  const [stateValue, setStateValue] = useState<any>(value);

  /* 
  ------------------------------------------------------------------------- 
  ----- CORE PROPS
  ------------------------------------------------------------------------- 
  */

  const { isFocus, isError, isDisabled, helperTextCore, setError, clearError } = useModuleCore({
    focused: focused || dropdown,
    disabled: disabled,
    error: error,
    helper: helperText,
  });

  /* 
  ------------------------------------------------------------------------- 
  ----- CHECK PROPS
  ------------------------------------------------------------------------- 
  */

  const [checked, setChecked] = useState(false);
  const [locale, setLocale] = useState("");
  const [checkedMinDate, setMinDate] = useState<Date | null>(minDate);

  const info = useRef({
    tag: "<DatePicker ",
    rangeTag: "<DatePicker range ",
    invalid: "INVALID PROPS:\n",
    name: `INPUT NAME: ${name}\n`,
    warning: "WARNING: ",
    error: "ERROR: ",
    value: "\n\tvalue={ ",
    attr(name: string) {
      return `${name}={ `;
    },
    warn() {
      return this.invalid + this.name;
    },
  }).current;

  const check = useRef(() => {
    let warning = "";
    /* 
      CHECK LANGUAGE
    */
    const [lang, warn] = testLocale(localization.locale);
    if (warn) {
      warning += `\n\tlocalization={ locale: ${warn} }`;
    }
    setLocale(lang);
    /* 
      CHECK MIN DATE IS LESS THAN MAX DATE
    */
    if (minDate && maxDate) {
      if (new DateX(minDate).compare(maxDate) === "greater") {
        warning += "\n\tminDate={ CANNOT BE GREATER THAN maxDate }";
        setMinDate(null);
      }
    }

    let minDateStr = minDate ? minDate.toLocaleDateString() : "";
    let maxDateStr = maxDate ? maxDate.toLocaleDateString() : "";
    if (range) {
      /* 
        CALENDAR RANGE CHECK 
      */
      let rangeWarning = "";

      switch (checkIsRange(value)) {
        case "is range":
          const {
            invalidRange,
            startLessMinDate,
            startGreaterMaxDate,
            endLessMinDate,
            endGreaterMaxDate,
          } = checkRange(toRange(value), minDate, maxDate);
          let startStr = "";
          let endStr = "";
          if (!(value instanceof Date) && value !== null) {
            startStr = value.start ? value.start.toLocaleDateString() : "";
            endStr = value.end ? value.end.toLocaleDateString() : "";
          }

          if (invalidRange) {
            rangeWarning += `\n\t\tstart: ${startStr} CANNOT BE GREATER OR EQUAL THAN end: ${endStr}`;
          }
          if (startLessMinDate && minDate) {
            rangeWarning += `\n\t\tstart: ${startStr} CANNOT BE LESS THAN minDate: ${minDateStr}`;
          }
          if (startGreaterMaxDate && maxDate) {
            rangeWarning += `\n\t\tstart: ${startStr} CANNOT BE GREATER THAN maxDate: ${maxDateStr}`;
          }
          if (endLessMinDate && minDate) {
            rangeWarning += `\n\t\tend: ${endStr} CANNOT BE LESS THAN minDate: ${minDateStr}`;
          }
          if (endGreaterMaxDate) {
            rangeWarning += `\n\t\tend: ${endStr} CANNOT BE GREATER THAN maxDate: ${maxDateStr}`;
          }
          break;
        case "not range":
          rangeWarning += info.value + "MUST BE { start: Date | null, end: Date | null } }";
          break;
      }
      if (rangeWarning) {
        /* 
          RESET VALUE
        */
        warning += info.value + rangeWarning + " }";
        onChange({ start: null, end: null } as any);
        setStateValue({ start: null, end: null });
      }
    } else {
      /* 
        CALENDAR CHECK (NOT RANGE)
      */
      if (value instanceof Date) {
        const date = new DateX(value);
        let propsWarning = "";
        let dateString = value.toLocaleDateString();
        switch (date.compareInRange(minDate, maxDate)) {
          case "less min":
            propsWarning += `${dateString} CANNOT BE LESS THAN MIN DATE: ${minDateStr}`;
            break;
          case "greater max":
            propsWarning += `${dateString} CANNOT BE GREATER THAN MAX DATE: ${maxDateStr}`;
            break;
        }
        if (propsWarning) {
          warning += info.value + propsWarning + " }";
          setStateValue(null);
          onChange(null as any);
        }
      }
    }
    /* 
        HANDLE WARNING
    */
    if (warning) {
      const tag = range ? info.rangeTag : info.tag;
      const outputWarning = info.warn() + tag + warning + " />\n ";
      console.warn(outputWarning);
    } else {
      /* OK */
      setStateValue(value);
    }
    /* 
        END CHECK
    */
    setChecked(true);
  });

  useEffect(() => {
    check.current();
  }, []);

  const data = useRef({
    inputName: name,
    prevValue: null as any,
    inputValue: "" as any,
    minDate: minDate,
    maxDate: maxDate,
    range: !!range,
    error: isError,
    locale: "",
    localDate: "null",
    localMinDate: "null",
    localMaxDate: "null",
    init() {
      this.prevValue = clone(value, this.range);
      this.locale = locale;
      this.minDate = checkedMinDate;
      this.maxDate = maxDate;
      if (minDate) {
        this.localMinDate = minDate.toLocaleDateString(this.locale);
      }
      if (maxDate) {
        this.localMaxDate = maxDate.toLocaleDateString(this.locale);
      }
      this.log();
    },
    handleInputValue(value: any) {
      this.inputValue = value;
      if (this.range) {
        const rangeDate = this.toRangeDate(value);
        const { startDate, endDate, mustBeLessThan, mustBeGreaterThan } = localization;
        const {
          invalidRange,
          startLessMinDate,
          startGreaterMaxDate,
          endLessMinDate,
          endGreaterMaxDate,
        } = checkRange(rangeDate, minDate, maxDate);
        /* 
          CHECK INPUT RANGE ERRORS 
        */
        let errorMessage: string[] = [];
        if (invalidRange) {
          errorMessage.push(`${startDate} ${mustBeLessThan} ${endDate}`);
        }
        if (startLessMinDate && minDate) {
          errorMessage.push(`${startDate} ${mustBeGreaterThan} ${this.localMinDate}`);
        }
        if (startGreaterMaxDate && maxDate) {
          errorMessage.push(`${startDate} ${mustBeLessThan} ${this.localMaxDate}`);
        }
        if (endLessMinDate && minDate) {
          errorMessage.push(`${endDate} ${mustBeGreaterThan} ${this.localMinDate}`);
        }
        if (endGreaterMaxDate) {
          errorMessage.push(`${endDate} ${mustBeLessThan} ${this.localMaxDate}`);
        }
        if (errorMessage.length > 0) {
          this.handleError(true, errorMessage);
          setStateValue(rangeDate);
          this.log();
        } else {
          this.handleError(false);
          this.handleChange(rangeDate);
        }
      } else {
        /* 
          CHECK INPUT VALUE
        */
      }
    },
    toRangeDate(value: { start: string; end: string }) {
      const start = value.start === "null" ? null : new Date(value.start);
      const end = value.end === "null" ? null : new Date(value.end);
      return { start, end };
    },
    resetValue(): any {
      if (this.range) return { start: null, end: null };
      else return null;
    },
    handleError(error: boolean, message?: string | string[]) {
      this.error = error;
      if (error) {
        setError(message);
      } else {
        clearError();
      }
    },
    handleApply(value: any) {
      this.handleChange(value);
      this.log();
    },
    handleCancel() {
      setStateValue(this.prevValue);
    },
    handleFix() {
      this.handleChange(clone(this.prevValue, this.range));
      this.handleClose(true);
    },
    handleReset() {
      this.handleChange(this.resetValue());
    },
    handleChange(value: any) {
      setStateValue(value);
      onChange(value);
      this.prevValue = clone(value, this.range);
      this.log();
    },
    handleSelector(value: any) {
      setStateValue(value);
      console.log(value);
    },
    handleClose(clearError?: boolean) {
      setClose(true);
      setTimeout(() => {
        setClose(false);
        setDropdown(false);
        if (clearError) {
          this.handleError(false);
        }
      }, 100);
    },
    log() {
      console.table(this);
    },
  }).current;

  function clone(value: any, range: boolean): any {
    if (range) {
      const start = value.start ? new Date(value.start) : null;
      const end = value.end ? new Date(value.end) : null;
      const clone = { start, end };
      Object.freeze(clone);
      return clone;
    } else {
      const date = value ? new Date(value) : null;
      return date;
    }
  }

  useEffect(() => {
    if (checked) {
      data.init();
    }
  }, [checked, data]);

  function setClassName() {
    let classname = "mod-datepicker";
    if (actionButton) classname += " mod-action-button";
    return classname;
  }

  const handleInputValue = useCallback((value: any) => data.handleInputValue(value), [data]);
  const handleApply = useCallback((value: any) => data.handleApply(value), [data]);
  const handleCancel = useCallback(() => data.handleCancel(), [data]);
  const handleFix = useCallback(() => data.handleFix(), [data]);
  const handleReset = useCallback(() => data.handleReset(), [data]);
  const handleChange = useCallback((value: any) => data.handleChange(value), [data]);
  const handleSelector = useCallback((value: any) => data.handleSelector(value), [data]);
  const handleClose = useCallback(() => data.handleClose(), [data]);

  return (
    <ModuleCore
      cssCustom={setClassName()}
      themeColor={themeColor}
      focused={isFocus}
      error={isError}
      disabled={isDisabled}
      helperText={helperTextCore}
      border>
      {checked && locale && (
        <ConstStore
          error={isError}
          range={range}
          value={stateValue}
          stateValue={stateValue}
          locale={locale}
          localization={localization}
          actionButton={range ? false : actionButton}
          option={option}
          helperText={helperTextCore}
          closeAnimation={close}
          handleApply={handleApply}
          handleCancel={handleCancel}
          handleReset={handleReset}
          handleFix={handleFix}
          handleSelector={handleSelector}
          handleClose={handleClose}
          onChange={handleChange}>
          <DatePickerInput
            range={range}
            name={name}
            value={stateValue}
            minDate={checkedMinDate}
            maxDate={maxDate}
            dateFormat={dateFormat}
            inputProps={inputProps}
            themeColor={themeColor}
            onIconClick={() => setDropdown(true)}
            onIconTouch={() => null}
            onSpaceDown={() => setDropdown(true)}
            onChange={handleInputValue}
            error={isError}
          />
          <DatePickerDropdown
            range={range}
            value={value}
            minDate={checkedMinDate}
            maxDate={maxDate}
            openTo={openTo}
            dropdown={dropdown}
            handleCancel={handleCancel}
          />
        </ConstStore>
      )}
    </ModuleCore>
  );
};

export default DatePicker;
interface GetConstProps {
  value: any;
  stateValue: any;
  range?: boolean | "2-calendar";
  option: Option;
  actionButton: boolean;
  error: boolean;
  locale: string;
  localization: Localization;
  helperText: string | string[];
  closeAnimation: boolean;
  handleApply: (value: any) => void;
  handleCancel: () => void;
  handleReset: () => void;
  handleFix: () => void;
  handleSelector: (value: any) => void;
  handleClose: () => void;
  onChange: (value: any) => void;
}

interface UseGetConst {
  value: any;
  stateValue: any;
  weekday: RE[];
  monthsLabel: string[];
  monthsButton: string[];
  today: Date;
  localization: Localization;
  monthOption?: "short" | "long";
  actionButton: boolean;
  dayOffset: -1 | 0 | 1;
  monthButton: boolean;
  rangeMode: boolean;
  locale: string;
  errorMode: boolean;
  helperText: string | string[];
  closeAnimation: boolean;
  handleApply: (value: any) => void;
  handleCancel: () => void;
  handleReset: () => void;
  handleFix: () => void;
  handleSelector: (value: any) => void;
  handleClose: () => void;
  onChange: (value: any) => void;
}

const GetConstStore = createContext<UseGetConst>({} as UseGetConst);
const useGetConst = () => useContext(GetConstStore);
const ConstStore: FC<GetConstProps> = ({
  range,
  value,
  stateValue,
  option,
  actionButton,
  error,
  locale,
  localization,
  helperText,
  closeAnimation,
  handleApply,
  handleCancel,
  handleFix,
  handleReset,
  onChange,
  handleSelector,
  handleClose,
  children,
}) => {
  const dayOffset = () => {
    switch (localization.fristDayWeek) {
      case "saturday":
        return -1;
      case "sunday":
        return 0;
      case "monday":
        return 1;
    }
  };
  const today = new Date();
  const { weekday } = useGetWeekday(locale, dayOffset(), option.weekday);
  const { monthsLabel, monthsButton } = useGetMonth(locale, option.monthOption);
  const monthButton = useRef(option.headerButton === "2-button").current;
  const rangeMode = useRef(range ? true : false).current;

  return createElement(
    GetConstStore.Provider,
    {
      value: {
        value,
        stateValue,
        weekday,
        monthsLabel,
        monthsButton,
        monthOption: option.monthOption?.calendar,
        localization,
        today,
        dayOffset: dayOffset(),
        actionButton,
        monthButton,
        rangeMode,
        locale,
        errorMode: error,
        helperText,
        closeAnimation,
        handleApply,
        handleCancel,
        handleReset,
        handleFix,
        handleSelector,
        handleClose,
        onChange,
      },
    },
    children,
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <DATE PICKER INPUT />
  ------------------------------------------------------------------------- 
*/
interface DatePickerInputProps {
  name?: string;
  value: any;
  minDate: Date | null;
  maxDate: Date | null;
  dateFormat?: DateFormat;
  inputProps?: InputProps;
  range?: boolean | "2-calendar";
  error: boolean;
  themeColor?: string;
  onIconClick: () => void;
  onIconTouch: () => void;
  onSpaceDown: () => void;
  onChange: (value: any) => void;
}
const DatePickerInput: FC<DatePickerInputProps> = ({
  name,
  value,
  minDate,
  maxDate,
  dateFormat,
  error,
  inputProps,
  themeColor,
  onIconClick,
  onIconTouch,
  onSpaceDown,
  onChange,
}) => {
  const { rangeMode } = useGetConst();

  return (
    <div className="mod-inputdate-wrap">
      <InputDate
        {...inputProps}
        range={rangeMode}
        name={name}
        value={value}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        onSpaceDown={onSpaceDown}
        onChange={onChange}
        error={error}
        returnType="date-string"
        themeColor={themeColor}
        skipCheck
      />
      <DatePickerIcon onIconClick={onIconClick} onIconTouch={onIconTouch} />
    </div>
  );
};
interface DatePickerIconProps {
  calendarIcon?: RE;
  onIconClick: () => void;
  onIconTouch: () => void;
}
const DatePickerIcon: FC<DatePickerIconProps> = ({ calendarIcon, onIconClick, onIconTouch }) => {
  function render() {
    if (calendarIcon) return calendarIcon;
    return <CalendarIcon />;
  }
  return (
    <Button cssCustom="mod-datepicker-icon" onClick={onIconClick} onTouch={onIconTouch}>
      {render()}
    </Button>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <DATE PICKER DROPDOWN />
  ------------------------------------------------------------------------- 
*/

interface DatePickerDropdownProps {
  value: any;
  minDate: Date | null;
  maxDate: Date | null;
  range?: boolean | "2-calendar";
  openTo: Mode;
  dropdown: boolean;
  handleCancel: () => void;
}
const DatePickerDropdown: FC<DatePickerDropdownProps> = ({
  range,
  value,
  minDate,
  maxDate,
  openTo,
  dropdown,
  handleCancel,
}) => {
  const { stateValue, actionButton, closeAnimation, onChange, handleClose } = useGetConst();
  const closeDropdown = useRef(() => {
    handleClose();
    handleCancel();
  }).current;

  function render() {
    if (range) {
      return (
        <CalendarRange
          range={range}
          openTo={openTo}
          defaultMinDate={minDate}
          defaultMaxDate={maxDate}
          closeAnimation={closeAnimation}
          closeDropdown={closeDropdown}
          actionButton={actionButton}
          onChange={onChange}
        />
      );
    } else {
      return (
        <Calendar
          date={stateValue}
          minDate={minDate}
          maxDate={maxDate}
          openTo={openTo}
          closeAnimation={closeAnimation}
          closeDropdown={closeDropdown}
          actionButton={actionButton}
        />
      );
    }
  }
  return (
    <div className="mod-dropdown-container">
      {dropdown && render()}
      {dropdown && <div className="mod-trigger" onClick={closeDropdown} />}
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR RANGE />
  ------------------------------------------------------------------------- 
*/

interface CalendarRangeProps {
  range: "2-calendar" | true;
  openTo: Mode;
  defaultMinDate: Date | null;
  defaultMaxDate: Date | null;
  actionButton: boolean;
  closeAnimation: boolean;
  closeDropdown: () => void;
  onChange: (value: any) => void;
}

const CalendarRange: FC<CalendarRangeProps> = ({
  range,
  openTo,
  defaultMinDate,
  defaultMaxDate,
  closeAnimation,
  closeDropdown,
  onChange,
}) => {
  const {
    stateValue,
    errorMode,
    handleSelector,
    handleApply,
    handleCancel,
    handleReset,
    handleFix,
  } = useGetConst();
  const [rangeMode, setRangeMode] = useState<"start" | "end">("start");
  const { start, end } = stateValue;

  function init(date: Date | null, defaultDate: Date | null) {
    if (date) return date;
    else return defaultDate;
  }

  const [minDate, setMinDate] = useState(() => init(start, defaultMinDate));
  const [maxDate, setMaxDate] = useState(() => init(end, defaultMaxDate));

  const [validRange, setValidRange] = useState(() => {
    if (start && end) return true;
    else return false;
  });
  const [blockEnd, setBlock] = useState(() => {
    if (start) return false;
    else return true;
  });

  const handleStartSelectorClick = useCallback(
    (value: any, range: RangeType, type: Mode, index: string) => {
      if (type === "day") {
        if (value instanceof Date && !isEqualDate(value, end)) {
          const updateRange = { start: value, end: end };
          handleSelector(updateRange);
          setMinDate(value);
          setBlock(false);
          if (start && end) setValidRange(true);
        }
        if (new DateX(value).compare(start) === "equal") setRangeMode("end");
      }
    },
    [end, start, handleSelector],
  );
  const handleEndSelectorClick = useCallback(
    (value: any, range: RangeType, type: Mode, index: string) => {
      switch (type) {
        case "day":
          if (value instanceof Date && !isEqualDate(value, end)) {
            const updateRange = { start: start, end: value };
            handleSelector(updateRange);
            setMaxDate(value);
            if (start) setValidRange(true);
          }
          if (isEqualDate(value, end)) setRangeMode("start");
      }
    },
    [end, start, handleSelector],
  );
  /* 
  ----- HANDLE FOOTER BUTTON() -----------------------------------
  */
  const onCancel = useCallback(() => {
    handleCancel();
    closeDropdown();
  }, [closeDropdown, handleCancel]);

  const onApply = useCallback(() => {
    if (!validRange) return;
    const value: any = { start, end };
    handleApply({ ...value });
    closeDropdown();
  }, [validRange, start, end, handleApply, closeDropdown]);

  const onReset = useCallback(() => {
    handleReset();
    closeDropdown();
  }, [closeDropdown, handleReset]);

  const onFix = useCallback(() => {
    handleFix();
  }, [handleFix]);
  function setClassName() {
    let classname = "mod-calendar-wrap";
    if (range === "2-calendar") classname += " mod-double-calendar";
    if (range === true && rangeMode === "start") classname += " mod-start-date";
    if (range === true && rangeMode === "end") classname += " mod-end-date";
    return classname;
  }
  function setCalendarRangeClass() {
    let classname = "mod-calendar-range mod-animation-fadein";
    if (closeAnimation) classname += " mod-animation-fadeout";
    if (errorMode) classname += " mod-error-mode";
    return classname;
  }
  return (
    <div className={setCalendarRangeClass()}>
      {errorMode ? (
        <CalendarError />
      ) : (
        <Fragment>
          {range === true ? (
            <CalendarRangeHeader
              blockEnd={blockEnd}
              rangeMode={rangeMode}
              setRangeMode={setRangeMode}
              minDate={start}
              maxDate={end}
            />
          ) : (
            <CalendarRangePlaceholder blockEnd={blockEnd} minDate={start} maxDate={end} />
          )}
          <div className={setClassName()}>
            <Calendar
              date={start}
              minDate={defaultMinDate}
              maxDate={maxDate}
              openTo={openTo}
              closeAnimation={closeAnimation}
              closeDropdown={closeDropdown}
              handleSelectorClick={handleStartSelectorClick}
              rangeType="start"
              rangeStart={start}
              rangeEnd={end}
            />
            <Calendar
              date={end}
              minDate={minDate}
              maxDate={defaultMaxDate}
              openTo={openTo}
              closeAnimation={closeAnimation}
              closeDropdown={closeDropdown}
              handleSelectorClick={handleEndSelectorClick}
              rangeType="end"
              rangeStart={start}
              rangeEnd={end}
              block={blockEnd}
            />
          </div>
          {range === "2-calendar" && <div className="mod-range-separator" />}
        </Fragment>
      )}
      <CalendarRangeFooter
        range={range}
        validRange={validRange}
        handleCancel={onCancel}
        handleApply={onApply}
        handleReset={onReset}
        handleFix={onFix}
      />
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR RANGE CONTENT/>
  ------------------------------------------------------------------------- 
*/
interface CalendarRangeHeaderProps {
  blockEnd: boolean;
  minDate: Date | null;
  maxDate: Date | null;
}
interface CalendarRangeTabs extends CalendarRangeHeaderProps {
  rangeMode: "start" | "end";
  setRangeMode: Dispatch<SetStateAction<"start" | "end">>;
}
const CalendarRangeHeader: FC<CalendarRangeTabs> = ({
  blockEnd,
  rangeMode,
  minDate,
  maxDate,
  setRangeMode,
}) => {
  const {
    localization: { startDate, endDate, selectDate },
    locale,
  } = useGetConst();
  const handleTabEnd = useCallback(() => {
    if (blockEnd) return;
    setRangeMode("end");
  }, [setRangeMode, blockEnd]);
  function render() {
    if (rangeMode === "start") {
      return contentData(minDate, selectDate, locale);
    } else {
      return contentData(maxDate, selectDate, locale);
    }
  }
  function setStartClassName() {
    let classname = "mod-calendar-tab";
    if (blockEnd) classname += " mod-full-tab";
    switch (rangeMode) {
      case "start":
        classname += " mod-active-tab";
        break;
      case "end":
        classname += " mod-idle-tab";
        break;
    }
    return classname;
  }
  function setEndClassName() {
    let classname = "mod-calendar-tab";
    if (blockEnd) classname += " mod-shrink-tab";
    switch (rangeMode) {
      case "end":
        classname += " mod-active-tab";
        break;
      case "start":
        classname += " mod-idle-tab";
        break;
    }
    return classname;
  }
  return (
    <Fragment>
      <div className="mod-calendar-range-header">
        <Button cssCustom={setStartClassName()} onClick={() => setRangeMode("start")}>
          {startDate}
        </Button>
        <Button cssCustom={setEndClassName()} onClick={handleTabEnd}>
          {endDate}
        </Button>
        <div className="bottom-shadow"></div>
      </div>
      <div className="mod-bar-date">{render()}</div>
    </Fragment>
  );
};
const CalendarRangePlaceholder: FC<CalendarRangeHeaderProps> = ({ blockEnd, minDate, maxDate }) => {
  const {
    localization: { startDate, endDate, selectDate },
    locale,
  } = useGetConst();

  function setClassName() {
    let classname = "mod-static-tab";
    if (blockEnd) classname += " mod-block-calendar";
    return classname;
  }
  return (
    <div className="mod-calendar-range-placeholder">
      <div className="mod-static-tab">
        <div className="mod-tab-label">{startDate}</div>
        <div className="mod-tab-date">{contentData(minDate, selectDate, locale)}</div>
      </div>
      <div className={setClassName()}>
        <div className="mod-tab-label">{endDate}</div>
        <div className="mod-tab-date">{contentData(maxDate, selectDate, locale)}</div>
      </div>
    </div>
  );
};
function contentData(date: Date | null, selectDate: string, locale: string) {
  if (date) {
    return date.toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } else {
    return selectDate;
  }
}
interface CalendarRangeFooterProps {
  validRange: boolean;
  range: true | "2-calendar";
  actionButton?: boolean;
  actionButtonOption?: {
    cancel: string;
    apply: string;
    back: string;
    fix: string;
  };
  handleCancel: () => void;
  handleApply: () => void;
  handleReset: () => void;
  handleFix: () => void;
}
const CalendarRangeFooter: FC<CalendarRangeFooterProps> = ({
  validRange,
  range,
  handleCancel,
  handleApply,
  handleReset,
  handleFix,
}) => {
  const {
    localization: { apply, cancel, fix },
    errorMode,
  } = useGetConst();
  function setClassName() {
    let classname = "mod-calendar-footer range";
    if (range === "2-calendar") classname += "-double";
    if (errorMode) classname += " mod-error-mode";
    return classname;
  }
  return (
    <div className={setClassName()}>
      {!errorMode ? (
        <div className="mod-button-wrap">
          <Button onClick={handleCancel} cssCustom="mat-button-base mod-hover">
            {cancel}
          </Button>
          <Button
            onClick={handleApply}
            cssCustom="mat-button-base mod-primary"
            disabled={!validRange}>
            {apply}
          </Button>
        </div>
      ) : (
        <div className="mod-button-wrap">
          <Button onClick={handleReset} cssCustom="mat-button-base mod-hover">
            Reset
          </Button>
          <Button onClick={handleFix} cssCustom="mat-button-base mod-primary">
            {fix}
          </Button>
        </div>
      )}
    </div>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR />
  ------------------------------------------------------------------------- 
*/
type HandleSelectorClick = (
  value: Date | number,
  range: RangeType,
  type: Mode,
  index: string,
) => void;
interface CalendarProps {
  date: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  openTo: Mode;
  actionButton?: boolean;
  actionButtonOption?: { cancel: string; apply: string; back: string };
  rangeType?: RangeType;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  closeAnimation: boolean;
  block?: boolean;
  handleSelectorClick?: HandleSelectorClick;
  closeDropdown: () => void;
}
const Calendar: FC<CalendarProps> = ({
  date,
  minDate,
  maxDate,
  openTo,
  rangeType,
  rangeStart,
  rangeEnd,
  closeAnimation,
  block,
  handleSelectorClick,
  closeDropdown,
}) => {
  const { allowScroll, blockScroll } = useScrollBlock();
  const { actionButton, errorMode } = useGetConst();
  const [mode, setMode] = useState<Mode>(openTo);

  useEffect(() => {
    blockScroll();
    return () => {
      allowScroll();
    };
  }, [allowScroll, blockScroll]);

  return (
    <CalendarCore
      value={date}
      minDate={minDate}
      maxDate={maxDate}
      mode={mode}
      setMode={setMode}
      rangeType={rangeType}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      handleSelectorClick={handleSelectorClick}
      closeDropdown={closeDropdown}
      closeAnimation={closeAnimation}
      block={block}>
      {errorMode ? (
        <CalendarError />
      ) : (
        <Fragment>
          <CalendarHeader mode={mode} />
          <CalendarSeparator mode={mode} />
          <CalendarContent mode={mode} />
        </Fragment>
      )}
      <CalendarFooter actionButton={actionButton} />
    </CalendarCore>
  );
};
/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR HEADER />
  ------------------------------------------------------------------------- 
*/

interface CalendarContentProps {
  mode: Mode;
}

const CalendarHeader: FC<CalendarContentProps> = ({ mode }) => {
  return (
    <div className="mod-calendar-header">
      <CalendarModeButton mode={mode} />
      <CalendarArrow />
    </div>
  );
};

const CalendarModeButton: FC<CalendarContentProps> = ({ mode }) => {
  const { monthButton } = useGetConst();
  const { setButtonLabel, onSwitchButtonClick, onMonthButtonClick, onYearButtonClick } =
    useCalendarCore();
  const [label, setLabel] = useState("");
  /* handleMonthClick handleYearClick handleModeButton */

  const subscribe = useRef(() => {
    setButtonLabel.current = (label) => setLabel(label);
  });
  const unsubscribe = useCallback(() => {
    setButtonLabel.current = (_label) => null;
  }, [setButtonLabel]);

  useEffect(() => {
    subscribe.current();
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  function split(label: string) {
    const splitted = label.split(" ");
    return splitted;
  }

  function render() {
    if (monthButton && mode === "day") {
      return (
        <div className="mod-button-wrap">
          <Button onClick={onMonthButtonClick} cssCustom="mod-hover">
            {split(label)[0]}
            <ArrowIcon />
          </Button>
          <Button cssCustom="mod-hover" onClick={onYearButtonClick}>
            {split(label)[1]}
            <ArrowIcon />
          </Button>
        </div>
      );
    }
    return (
      <Button onClick={onSwitchButtonClick} cssCustom="mod-hover">
        {label}
        <ArrowIcon flip={mode !== "day"} />
      </Button>
    );
  }
  return render();
};

const CalendarArrow: FC = () => {
  const { onArrowClick, setDisableArrow } = useCalendarCore();
  const [disableArrowL, setDisableL] = useState(false);
  const [disableArrowR, setDisableR] = useState(false);

  const onArrowLeft = () => {
    onArrowClick(-1);
  };
  const onArrowRight = () => {
    onArrowClick(1);
  };
  const subscribe = useRef(() => {
    setDisableArrow.current = (L: boolean, R: boolean) => {
      setDisableL(L);
      setDisableR(R);
    };
  });
  const unsubscribe = useCallback(() => {
    setDisableArrow.current = (_L: boolean, _R: boolean) => null;
  }, [setDisableArrow]);
  useEffect(() => {
    subscribe.current();
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);
  return (
    <div className="mod-calendar-arrow">
      <MatArrow arrow="L" cssCustom="mod-hover" disabled={false} onClick={onArrowLeft} />
      <MatArrow arrow="R" cssCustom="mod-hover" disabled={false} onClick={onArrowRight} />
    </div>
  );
};
/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR CONTENT />
  ------------------------------------------------------------------------- 
*/

const CalendarSeparator: FC<CalendarContentProps> = ({ mode }) => {
  const { weekday } = useGetConst();
  function render() {
    if (mode === "day") return weekday;
    return null;
  }
  return <div className="mod-calendar-separator">{render()}</div>;
};
const CalendarContent: FC<CalendarContentProps> = ({ mode }) => {
  const { monthOption } = useGetConst();
  const { setContent, setHeaderContent, contentTransition } = useCalendarCore();
  const [header, setRenderHeader] = useState<string>("");
  const [content, setRenderContent] = useState<RE[]>([]);
  const [transition, setTransition] = useState<"L" | "R" | "idle">("idle");
  const prevContent = usePrevious(content);
  const test = useRef(new ClickInRange()).current;

  const subscribe = useRef(() => {
    setContent.current = (_content: RE[]) => {
      setRenderContent(_content);
    };
    setHeaderContent.current = (header: string) => setRenderHeader(header);
    contentTransition.subscribe((i: 1 | -1) => {
      const direction = i === 1 ? "R" : "L";
      setTransition(direction);
      if (test.clickInRange(200)) {
        setTransition("idle");
      } else {
        setTimeout(() => setTransition("idle"), 150);
      }
    });
  });
  const unsubscribe = useCallback(() => {
    contentTransition.unsubscribe();
    setContent.current = (_content: RE[]) => null;
    setHeaderContent.current = (_header: string) => null;
  }, [contentTransition, setContent, setHeaderContent]);

  useEffect(() => {
    subscribe.current();
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);
  /* STYLE FUNCTION */
  function setClassName() {
    const longMonth = mode === "month" && monthOption === "long";
    let className = "mod-calendar-content";
    if (mode === "day") className += " day-content";
    if (mode === "month") className += " month-content";
    if (longMonth) className += " month-long";
    return className;
  }
  function setTransitionClass() {
    let classname = "content-transition-wrap";
    if (transition) classname += ` mod-translate-${transition}`;
    return classname;
  }

  function renderContent() {
    switch (transition) {
      case "L":
        return (
          <>
            <div className={setClassName()}>{content}</div>
            <div className={setClassName()}>{prevContent}</div>
          </>
        );
      case "R":
        return (
          <>
            <div className={setClassName()}>{prevContent}</div>
            <div className={setClassName()}>{content}</div>
          </>
        );
      default:
        return (
          <>
            <div className={setClassName()}>{content}</div>
          </>
        );
    }
  }

  return (
    <Fragment>
      {mode === "month" && <div className="mod-content-header">{header}</div>}
      <div className={setTransitionClass()}>{renderContent()}</div>
    </Fragment>
  );
};
/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR FOOTER />
  ------------------------------------------------------------------------- 
*/
interface CalendarFooterProps {
  actionButton: boolean;
}
const CalendarFooter: FC<CalendarFooterProps> = ({ actionButton }) => {
  const {
    localization: { cancel, apply },
  } = useGetConst();
  const { handleCancel, handleApply } = useCalendarCore();

  return (
    <Fragment>
      {actionButton && (
        <div className="mod-calendar-footer">
          <div className="mod-button-wrap">
            <Button onClick={handleCancel} cssCustom="mat-button-base mod-hover">
              {cancel}
            </Button>
            <Button onClick={handleApply} cssCustom="mat-button-base mod-primary">
              {apply}
            </Button>
          </div>
        </div>
      )}
    </Fragment>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR SELECTOR />
  ------------------------------------------------------------------------- 
*/

interface SelectorProps {
  type: "year" | "month" | "day";
  label: string | number;
  value: number | Date;
  index: string;
  disabled?: boolean;
  path?: "start" | "middle" | "end" | "single" | "single-disabled";
}
const Selector: FC<SelectorProps> = memo(
  ({ type, label, value, index, path = undefined, disabled = false }) => {
    const { handleSelector, rangeType, selectorData } = useCalendarCore();

    const [active, setActive] = useState(() => selectorData.initActive(type, index));

    const handleClick = () => {
      if (disabled) return;
      handleSelector(value, rangeType, type, index);
    };

    useEffect(() => {
      selectorData.subscribe(type, index, {
        active() {
          setActive(true);
        },
        idle() {
          setActive(false);
        },
      });
      return () => {
        selectorData.unsubscribe(type, index);
      };
    }, [selectorData, type, index]);

    function setClassName() {
      let classname = `mod-selector insert-${type}`;
      if (selectorData.isToday(type, index)) classname += " mod-today";
      if (active) classname += " mod-active";
      if (active && path) classname += ` mod-active-range-${rangeType}`;
      if (path) classname += ` mod-range-${rangeType}-path-${path}`;
      if (selectorData.isPrevious(type, index)) classname += " mod-previous";
      if (disabled) classname += " mod-disabled";
      return classname;
    }

    return (
      <div className={setClassName()} onClick={handleClick}>
        <div className="mod-insert-label">{label}</div>
        <div className="mod-insert-border" />
        <div className="mod-insert-background" />
        {path && <div className={`mod-insert-path range-${rangeType}-path-${path}`} />}
        {selectorData.isToday(type, index) && <TodayPopup />}
      </div>
    );
  },
);
const TodayPopup: FC = () => {
  const {
    localization: { today },
  } = useGetConst();
  return (
    <div className="mod-today-popup">
      <span className="popup-label">{today}</span>
      <ArrowIcon />
    </div>
  );
};

const EmptySelector: FC = () => {
  return <div className="mod-date-selector blank" />;
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR ERROR CONTENT/>
  ------------------------------------------------------------------------- 
*/

const CalendarError: FC = () => {
  const { helperText } = useGetConst();
  function render(text: string | string[]) {
    if (Array.isArray(text)) {
      return text.map((helper, index) => (
        <span key={index + helper} className="mod-error-item">
          {`- ${helper}`}
        </span>
      ));
    } else {
      return text;
    }
  }
  return <div className="mod-content-error">{render(helperText)}</div>;
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR CORE CONTEXT />
  ------------------------------------------------------------------------- 
*/

interface SetSelector {
  [key: string]: SelectorSetter;
}
interface SelectorSetter {
  active(): void;
  idle(): void;
}

interface SelectorData {
  rangeType: RangeType;
  start: { year: string; month: string; day: string };
  end: { year: string; month: string; day: string };
  today: { year: string; month: string; day: string };
  prev: {
    start: { year: string; month: string; day: string };
    end: { year: string; month: string; day: string };
  };
  init(date: Date | null, rangeType: RangeType): void;
  set(type: Mode, index: string): SelectorSetter;
  toggleActive(type: Mode, prev: string, index: string): void;
  initActive(type: Mode, index: string): boolean;
  isToday(type: Mode, index: string): boolean;
  isPrevious(type: Mode, index: string): boolean;
  subscribe(type: Mode, index: string, setter: SelectorSetter): void;
  unsubscribe(type: Mode, index: string): void;
  setter: {
    start: { year: SetSelector; month: SetSelector; day: SetSelector };
    end: { year: SetSelector; month: SetSelector; day: SetSelector };
  };
}

interface ActiveSelector {
  start: { year: string; month: string; day: string };
  end: { year: string; month: string; day: string };
}
type SetContent = (content: RE[]) => void;
type SetButton = (label: string) => void;
type SetHeader = (header: string) => void;
type HandleSelector = (
  value: Date | number,
  rangeType: RangeType,
  type: Mode,
  indexSelector: string,
) => void;
type SetDisableArrow = (disableL: boolean, disableR: boolean) => void;

interface RenderDate {
  curr: DateX;
  next: DateX;
  init(date: DateX): void;
  set(date: DateX): void;
  update(): void;
  discard(): void;
  setYearMonth(year: number, month: number, minDate: Date | null, maxDate: Date | null): DateX;
  setDay(date: DateX): DateX;
  scrollYearGrid(scroll: "prev" | "next", type?: "override" | "update"): void;
  scrollYear(scroll: 1 | -1): DateX;
  scrollMonth(scroll: 1 | -1): DateX;
  gridYearRange: GridYearRange;
}
interface GridYearRange {
  gridSize: number;
  curr: { gridStart: number; gridEnd: number };
  next: { gridStart: number; gridEnd: number };
  set(gridStart: number, gridEnd: number): void;
  update(): void;
  discard(): void;
  updateGrid(scroll: "prev" | "next", type?: "override" | "update"): void;
}

interface CalendarCoreProps {
  range?: boolean | "2-calendar";
  value: Date | null;
  mode: Mode;
  minDate: Date | null;
  maxDate: Date | null;
  rangeType?: RangeType;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  closeAnimation: boolean;
  block?: boolean;
  setMode: Dispatch<SetStateAction<Mode>>;
  closeDropdown: () => void;
  handleSelectorClick?: HandleSelector;
}

const DatePickerContext = createContext<CalendarStore>({} as CalendarStore);
const useCalendarCore = () => useContext(DatePickerContext);

const CalendarCore: FC<CalendarCoreProps> = ({
  value,
  mode,
  minDate = null,
  maxDate = null,
  rangeType = "start",
  rangeStart = null,
  rangeEnd = null,
  closeAnimation,
  block = false,
  setMode,
  closeDropdown,
  handleSelectorClick = undefined,
  children,
}) => {
  /* ----- RENDER DATA ---------------------------------------------------- */
  const { monthsLabel, monthsButton, dayOffset, actionButton, monthButton, rangeMode, onChange } =
    useGetConst();

  /* ----- SETTERS -------------------------------------------------------- */
  const setContent = useRef<SetContent>((_content: RE[]) => null);
  const setButtonLabel = useRef<SetButton>((_label: string) => null);
  const setHeaderContent = useRef<SetHeader>((_header: string) => null);
  const setDisableArrow = useRef<SetDisableArrow>((_L: boolean, _R: boolean) => null);
  /* 
  ------------------------------------------------------------------------- 
  ----- CONTENT RENDER DATA()
  ------------------------------------------------------------------------- 
  */
  const contentData = useRef<RenderDate>({
    curr: new DateX(),
    next: new DateX(),
    init(date: DateX) {
      const { gridStart, gridEnd } = date.getYearGridRange(this.gridYearRange.gridSize);
      this.gridYearRange.set(gridStart, gridEnd);
      this.set(date);
    },
    set(date: DateX) {
      this.curr = date;
      this.next = date;
    },
    update() {
      this.curr = new DateX(this.next);
      this.gridYearRange.update();
    },
    discard() {
      this.next = new DateX(this.curr);
      this.gridYearRange.discard();
    },
    setYearMonth(year, month, minDate, maxDate) {
      const update = this.next.setYM(year, month, minDate, maxDate);
      this.next = update;
      this.update();
      return update;
    },
    setDay(date: DateX) {
      this.set(date);
      return new DateX();
    },
    scrollYearGrid(scroll: "prev" | "next", type: "override" | "update" = "update") {
      this.gridYearRange.updateGrid(scroll, type);
    },
    scrollYear(scroll: 1 | -1) {
      const { year, month, day } = this.next.getIndexDate();
      this.next = new DateX(year + scroll, month, day);
      const { gridStart, gridEnd } = this.gridYearRange.next;
      if (this.next.yearInRange(gridStart, gridEnd) === "out range") {
        const yearScroll = scroll === 1 ? "next" : "prev";
        this.scrollYearGrid(yearScroll, "update");
      }
      return this.next;
    },
    scrollMonth(scroll: 1 | -1) {
      const { year, month, day } = this.curr.getIndexDate();
      const { gridStart, gridEnd } = this.gridYearRange.curr;
      this.curr = new DateX(year, month + scroll, day);
      if (this.curr.yearInRange(gridStart, gridEnd) === "out range") {
        const yearScroll = scroll === 1 ? "next" : "prev";
        this.scrollYearGrid(yearScroll, "override");
      }
      this.set(this.curr);
      return this.curr;
    },
    gridYearRange: {
      gridSize: 24,
      curr: { gridStart: NaN, gridEnd: NaN },
      next: { gridStart: NaN, gridEnd: NaN },
      set(gridStart, gridEnd) {
        this.curr = { gridStart, gridEnd };
        this.next = { gridStart, gridEnd };
      },
      update() {
        this.curr = { ...this.next };
      },
      discard() {
        this.next = { ...this.curr };
      },
      updateGrid(scroll: "prev" | "next", type: "override" | "update" = "update") {
        const offset = scroll === "next" ? this.gridSize : this.gridSize * -1;
        switch (type) {
          case "override":
            this.curr = {
              gridStart: this.curr.gridStart + offset,
              gridEnd: this.curr.gridEnd + offset,
            };
            this.update();
            break;
          case "update":
            this.next = {
              gridStart: this.next.gridStart + offset,
              gridEnd: this.next.gridEnd + offset,
            };
            break;
        }
      },
    },
  }).current;

  /* 
  ------------------------------------------------------------------------- 
  ----- SELECTOR RENDER DATA()
  ------------------------------------------------------------------------- 
  */
  const selectorData = useRef<SelectorData>({
    rangeType: rangeType,
    start: { year: "", month: "", day: "" },
    end: { year: "", month: "", day: "" },
    today: { year: "", month: "", day: "" },
    prev: {
      start: { year: "", month: "", day: "" },
      end: { year: "", month: "", day: "" },
    },
    init(date, rangeType) {
      this.rangeType = rangeType;
      if (date) {
        const dateX = new DateX(date);
        this[rangeType] = dateX.toStringIndex();
        this.prev[rangeType] = dateX.toStringIndex();
      }
      this.today = new DateX().toStringIndex();
    },
    initActive(type, index) {
      return this[this.rangeType][type] === index;
    },
    isToday(type, index) {
      return this.today[type] === index;
    },
    isPrevious(type, index) {
      return this.prev[this.rangeType][type] === index;
    },
    set(type, index) {
      return this.setter[this.rangeType][type][index];
    },
    toggleActive(type, prev, index) {
      if (this.set(type, prev)) this.set(type, prev).idle();
      this[this.rangeType][type] = index;
      this.set(type, index).active();
    },
    subscribe(type, index, setter) {
      this.setter[this.rangeType][type][index] = setter;
    },
    unsubscribe(type, index) {
      delete this.setter[this.rangeType][type][index];
    },
    setter: {
      start: { year: {}, month: {}, day: {} },
      end: { year: {}, month: {}, day: {} },
    },
  }).current;

  const prevSelector = useRef({
    start: { year: "", month: "", day: "" },
    end: { year: "", month: "", day: "" },
  }).current;
  const contentTransition = useRef({
    prevContent: [] as RE[],
    setDirection(i: 1 | -1) {},
    subscribe(callback: (i: 1 | -1) => void) {
      this.setDirection = callback;
    },
    unsubscribe() {
      this.setDirection = (i: 1 | -1) => {};
    },
  }).current;

  const renderContent = useCallback(
    (mode: Mode, content: RE[], button: string, L: boolean, R: boolean, header?: string) => {
      setMode(mode);
      setContent.current(content);
      setButtonLabel.current(button);
      if (!rangeMode) {
        setDisableArrow.current(L, R);
      }
      if (header) {
        setHeaderContent.current(header);
      }
    },
    [rangeMode, setMode],
  );

  /* 
  ------------------------------------------------------------------------- 
  ----- GET CALENDAR CONTENT()
  ------------------------------------------------------------------------- 
  */

  const renderYear = useCallback(() => {
    const { gridStart, gridEnd } = contentData.gridYearRange.next;

    const content: RE[] = [];
    const { items, yearRangeString } = contentData.next.getYearContent(
      gridStart,
      gridEnd,
      minDate,
      maxDate,
      { rangeStart, rangeEnd, rangeType },
    );
    items.forEach((item) => {
      content.push(<Selector {...item} />);
    });
    renderContent("year", content, yearRangeString, false, false);
  }, [
    maxDate,
    minDate,
    rangeEnd,
    rangeStart,
    rangeType,
    renderContent,
    contentData.gridYearRange.next,
    contentData.next,
  ]);
  const renderMonth = useCallback(() => {
    const { next } = contentData;
    const content: RE[] = [];
    const { items, yearString, arrowL, arrowR } = next.getMonthContent(
      monthsLabel,
      minDate,
      maxDate,
      { rangeStart, rangeEnd, rangeType },
    );
    items.forEach((item) => {
      content.push(<Selector {...item} />);
    });

    renderContent("month", content, yearString, arrowL, arrowR, yearString);
  }, [maxDate, minDate, monthsLabel, rangeEnd, rangeStart, rangeType, renderContent, contentData]);
  const renderDay = useCallback(() => {
    const { curr } = contentData;
    const content: RE[] = [];
    const { items, year, month } = curr.getDayContent(dayOffset, minDate, maxDate, {
      rangeStart,
      rangeEnd,
      rangeType,
    });

    items.forEach((item, index) => {
      if (item === null) {
        content.push(<EmptySelector key={index + "-blank"} />);
      } else {
        content.push(<Selector {...item} />);
      }
    });
    renderContent("day", content, `${monthsButton[month]} ${year}`, true, true);
  }, [
    dayOffset,
    maxDate,
    minDate,
    monthsButton,
    rangeEnd,
    rangeStart,
    rangeType,
    renderContent,
    contentData,
  ]);
  const switchRender = useCallback(() => {
    switch (mode) {
      case "year":
        renderYear();
        break;
      case "month":
        renderMonth();
        break;
      case "day":
        renderDay();
        break;
    }
  }, [mode, renderDay, renderMonth, renderYear]);
  const highlightToday = () => {
    const today = new DateX().toStringIndex();
    prevSelector[rangeType] = today;
  };
  const init = useRef(() => {
    highlightToday();
    selectorData.init(value, rangeType);
    if (value) {
      const date = new DateX(value);
      contentData.init(date);
      switchRender();
    } else {
      let date = new DateX();
      switch (minDate && date.compare(minDate)) {
        case "equal":
        case "less":
          date = new DateX(minDate as Date);
      }
      contentData.init(date);
      switchRender();
    }
  });

  useEffect(() => {
    init.current();
  }, []);
  useEffect(() => {
    switchRender();
  }, [switchRender]);

  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE HEADER BUTTON()
  ------------------------------------------------------------------------- 
  */

  const onSwitchButtonClick = useCallback(() => {
    if (mode !== "day") {
      contentData.discard();
      renderDay();
    } else {
      renderYear();
    }
  }, [mode, contentData, renderDay, renderYear]);

  const onMonthButtonClick = useCallback(() => {
    renderMonth();
  }, [renderMonth]);

  const onYearButtonClick = useCallback(() => {
    renderYear();
  }, [renderYear]);

  const onArrowClick = useCallback(
    (scroll: -1 | 1) => {
      contentTransition.setDirection(scroll);
      switch (mode) {
        case "year":
          const yearScroll = scroll === 1 ? "next" : "prev";
          contentData.scrollYearGrid(yearScroll);
          renderYear();
          break;
        case "month":
          contentData.scrollYear(scroll);
          renderMonth();
          break;
        case "day":
          contentData.scrollMonth(scroll);
          renderDay();
          break;
      }
    },
    [contentTransition, mode, contentData, renderYear, renderMonth, renderDay],
  );

  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE SELECTOR()
  ------------------------------------------------------------------------- 
  */

  const selectYear = useCallback(
    (year: number, month: number, index: string) => {
      contentData.setYearMonth(year, month, minDate, maxDate);
      if (monthButton) {
        renderDay();
      } else {
        renderMonth();
      }
    },
    [contentData, minDate, maxDate, monthButton, renderDay, renderMonth],
  );
  const selectMonth = useCallback(
    (year: number, month: number, index: string) => {
      contentData.setYearMonth(year, month, minDate, maxDate);
      renderDay();
    },
    [contentData, maxDate, minDate, renderDay],
  );
  const selectDay = useCallback(
    (value: Date, index: string) => {
      if (actionButton || rangeMode) {
        const prev = contentData.curr.toStringIndex().day;
        selectorData.toggleActive(mode, prev, index);
        contentData.set(new DateX(value));
      } else {
        const payload: any = value;
        onChange(payload);
        closeDropdown();
      }
    },
    [actionButton, closeDropdown, contentData, mode, onChange, rangeMode, selectorData],
  );
  const handleSelector = useCallback(
    (value: Date | number, rangeType: RangeType, type: Mode, index: string) => {
      if (block) return;
      const { year, month } = contentData.next.getIndexDate();
      switch (mode) {
        case "year":
          if (typeof value === "number") selectYear(value, month, index);
          break;
        case "month":
          if (typeof value === "number") selectMonth(year, value, index);
          break;
        case "day":
          if (value instanceof Date) {
            selectDay(value, index);
            if (handleSelectorClick && rangeType) {
              handleSelectorClick(value, rangeType, type, index);
            }
          }
          break;
      }
    },
    [block, handleSelectorClick, mode, contentData.next, selectDay, selectMonth, selectYear],
  );

  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE FOOTER BUTTON()
  ------------------------------------------------------------------------- 
  */

  const handleCancel = useCallback(() => {
    if (mode === "day") {
      closeDropdown();
    } else {
      /* setDay(); */
    }
  }, [mode, closeDropdown]);
  const handleApply = useCallback(() => {
    switch (mode) {
      case "year":
        if (monthButton) {
          /* setDay(); */
        } else {
          /*  setMonth(); */
        }
        break;
      case "month":
        /* setDay(); */
        break;
      case "day":
        //ON CHANGE
        break;
    }
  }, [mode, monthButton]);

  function setClassName() {
    let classname = "mod-calendar";
    if (block) classname += " mod-block-calendar";
    if (rangeMode) {
      return (classname += " mod-range-mode");
    } else {
      classname += " mod-animation-fadein";
      if (closeAnimation) classname += " mod-animation-fadeout";
      return classname;
    }
  }

  return (
    <div className={setClassName()}>
      {createElement(
        DatePickerContext.Provider,
        {
          value: {
            setContent,
            setButtonLabel,
            setHeaderContent,
            setDisableArrow,
            selectorData,
            rangeType,
            prevSelector,
            contentTransition,
            onSwitchButtonClick,
            onMonthButtonClick,
            onYearButtonClick,
            onArrowClick,
            handleSelector,
            handleCancel,
            handleApply,
          },
        },
        children,
      )}
    </div>
  );
};
interface PrevSelector extends ActiveSelector {}
interface CalendarStore {
  setButtonLabel: MutableRefObject<SetButton>;
  setContent: MutableRefObject<SetContent>;
  setHeaderContent: MutableRefObject<SetHeader>;
  setDisableArrow: MutableRefObject<SetDisableArrow>;
  selectorData: SelectorData;
  prevSelector: PrevSelector;
  rangeType: RangeType;
  contentTransition: {
    prevContent: RE[];
    setDirection(direction: 1 | -1): void;
    subscribe(callback: (i: 1 | -1) => void): void;
    unsubscribe(): void;
  };
  onSwitchButtonClick: () => void;
  onMonthButtonClick: () => void;
  onYearButtonClick: () => void;
  onArrowClick: (scroll: 1 | -1) => void;
  handleCancel: () => void;
  handleApply: () => void;
  handleSelector: HandleSelector;
}
/* 
  ------------------------------------------------------------------------- 
  ----- GET CONST CONTENT FUNCTION
  ------------------------------------------------------------------------- 
*/

const useGetMonth = (
  locale: string,
  option: { button?: "short" | "long"; calendar?: "short" | "long" } = {
    button: "short",
    calendar: "long",
  },
) => {
  function initMonth() {
    const buttonOption = option.button ? option.button : "short";
    const calendarOption = option.calendar ? option.calendar : "long";
    const monthsLabel: string[] = [];
    const monthsButton: string[] = [];
    for (let i = 0; i < 12; ++i) {
      const monthButton = new Date(0, i)
        .toLocaleDateString(locale, { month: buttonOption })
        .toUpperCase();
      const monthLabel = new Date(0, i)
        .toLocaleDateString(locale, { month: calendarOption })
        .toUpperCase();
      monthsLabel.push(monthLabel);
      monthsButton.push(monthButton);
    }
    return { monthsButton, monthsLabel };
  }
  const [monthsLocale] = useState<{ monthsButton: string[]; monthsLabel: string[] }>(initMonth);
  return {
    monthsLabel: monthsLocale.monthsLabel,
    monthsButton: monthsLocale.monthsButton,
  };
};

const useGetWeekday = (
  locale: string,
  dayOffset: -1 | 0 | 1,
  option: "narrow" | "short" = "narrow",
) => {
  function initWeekday() {
    const fristDay = 2 + dayOffset;
    const dayNames: RE[] = [];
    for (let day = 0; day < 7; ++day) {
      const dayName = new Date(2022, 0, fristDay + day)
        .toLocaleDateString(locale, { weekday: option })
        .toUpperCase();
      dayNames.push(
        <span key={dayName + day} className="mod-insert-day">
          {dayName}
        </span>,
      );
    }
    return dayNames; //WEEKDAYS
  }
  const [weekday] = useState<RE[]>(initWeekday);
  return { weekday };
};
