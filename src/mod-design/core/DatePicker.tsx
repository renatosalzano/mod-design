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
  useRef,
  useState,
} from "react";
import { CoreProps, ModuleCore } from "./mod-component/ModuleCore";
import { Button, MatArrow } from "./Button";
import InputDate from "./InputDate";
import { ArrowIcon, CalendarIcon } from "../icons";
import "./SCSS/mod-core-datepicker.scss";
import { useScrollBlock } from "../utils/blockScroll";
import { DateRange, isValidDateRange } from "../utils/DateRange";
import { isEqualDate } from "../utils/testDate";
type OnChangeFlat = (value: Date | null) => void;
type OnChangeRange = (value: DateRange) => void;
type OnChange = OnChangeFlat | OnChangeRange;
type Range =
  | {
      range: true | "2-calendar";
      value: { min: Date | null; max: Date | null };
    }
  | { range?: undefined; value: Date | null };
type RE = ReactElement;
type Mode = "day" | "month" | "year";
type DateFormat = "D/M/Y" | "M/D/Y" | "Y/M/D";
type DateSeparator = "/" | "." | "-" | " ";
interface Option {
  weekday?: "narrow" | "short";
  headerButton?: "2-button";
  actionButton?: { cancel: string; apply: string; back: string };
  headerRange?: { startDate: string; endDate: string };
  monthOption?: { button?: "short" | "long"; calendar?: "short" | "long" };
}

interface Props extends CoreProps {
  name: string;
  openTo?: "day" | "month" | "year";
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  rangeSeparator?: string;
  localization?: string;
  dayOffset?: 0 | 1;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  option?: Option;
  actionButton?: boolean;
  onChange: OnChange;
}

const DatePicker: FC<Props & Range> = ({
  name,
  value,
  range = undefined,
  minDate = null,
  maxDate = null,
  openTo = "day",
  dayOffset = 1,
  dateFormat = "D/M/Y",
  dateSeparator = "/",
  rangeSeparator,
  option = {
    weekday: "narrow",
    monthOption: { button: "long", calendar: "short" },
  },
  actionButton = false,
  localization,
  onChange,
}) => {
  const [checked, date, dateRange, defMinDate, locale, internalError] =
    useCheckProps(name, range, value, minDate, maxDate, localization);
  /*----- SHOW / HIDE DROPDOWN ----------------------------------------------*/
  const [dropdown, setDropdown] = useState(false);

  function setClassName() {
    let classname = "mod-datepicker";
    if (actionButton) classname += " mod-action-button";
    return classname;
  }

  return (
    <ModuleCore cssCustom={setClassName()} error={internalError} border>
      {checked && locale && (
        <ConstStore
          range={range}
          date={date}
          dateRange={dateRange}
          locale={locale}
          dayOffset={dayOffset}
          actionButton={range ? false : actionButton}
          option={option}
          onChange={onChange}>
          <DatePickerInput
            name={name}
            date={date}
            dateRange={dateRange}
            minDate={defMinDate}
            maxDate={maxDate}
            dateFormat={dateFormat}
            dateSeparator={dateSeparator}
            rangeSeparator={rangeSeparator}
            range={range}
            onIconClick={() => setDropdown(true)}
            onIconTouch={() => null}
          />
          <DatePickerDropdown
            range={range}
            date={date}
            dateRange={dateRange}
            minDate={defMinDate}
            maxDate={maxDate}
            openTo={openTo}
            dropdown={dropdown}
            setDropdown={setDropdown}
          />
        </ConstStore>
      )}
    </ModuleCore>
  );
};

export default DatePicker;
interface GetConstProps {
  date: Date;
  dateRange: DateRange;
  range?: true | "2-calendar";
  locale: string;
  dayOffset: 0 | 1;
  option: Option;
  actionButton: boolean;
  onChange: OnChange;
}

interface UseGetConst {
  weekday: RE[];
  monthsLabel: string[];
  monthsButton: string[];
  today: Date;
  monthOption?: "short" | "long";
  actionButtonOption?: { cancel: string; apply: string; back: string };
  actionButton: boolean;
  headerRange?: { startDate: string; endDate: string };
  startYear: number;
  startYearRange: { min: number; max: number };
  dayOffset: 0 | 1;
  monthButton: boolean;
  rangeMode: boolean;
  setSelector: SetSelector;
  activeSelector: ActiveSelector;
  locale: string;
  onChange: OnChange;
}

type SetSelectorFunc = {
  focus: () => void;
  blur: () => void;
  select: () => void;
  unselect: () => void;
  get: {
    value: Date | number;
    index: number;
    indexSelector: string;
    focused: boolean;
    selected: boolean;
  };
};

interface SetSelector {
  min: {
    year: { [key: string]: SetSelectorFunc };
    month: { [key: string]: SetSelectorFunc };
    day: { [key: string]: SetSelectorFunc };
  };
  max: {
    year: { [key: string]: SetSelectorFunc };
    month: { [key: string]: SetSelectorFunc };
    day: { [key: string]: SetSelectorFunc };
  };
}
interface ActiveSelector {
  min: { year: string; month: string; day: string };
  max: { year: string; month: string; day: string };
}

const GetConstStore = createContext<UseGetConst>({} as UseGetConst);
const useGetConst = () => useContext(GetConstStore);
const ConstStore: FC<GetConstProps> = ({
  range,
  date,
  dateRange,
  locale,
  option,
  dayOffset,
  actionButton,
  onChange,
  children,
}) => {
  const today = new Date();
  const { weekday } = useGetWeekday(locale, dayOffset, option.weekday);
  const { monthsLabel, monthsButton } = useGetMonth(locale, option.monthOption);
  const { startYear } = useInitYear(date);
  const { startYearRange } = useInitRangeYear(dateRange);
  const monthButton = useRef(option.headerButton === "2-button").current;
  const rangeMode = useRef(range ? true : false).current;
  const handleChange = useRef(onChange).current;
  const setSelector = useRef<SetSelector>({
    min: { year: {}, month: {}, day: {} },
    max: { year: {}, month: {}, day: {} },
  }).current;
  const activeSelector = useRef<ActiveSelector>({
    min: { year: "", month: "", day: "" },
    max: { year: "", month: "", day: "" },
  }).current;

  return createElement(
    GetConstStore.Provider,
    {
      value: {
        weekday,
        monthsLabel,
        monthsButton,
        monthOption: option.monthOption?.calendar,
        actionButtonOption: option.actionButton,
        headerRange: option.headerRange,
        today,
        startYear,
        startYearRange,
        dayOffset,
        actionButton,
        monthButton,
        rangeMode,
        setSelector,
        activeSelector,
        locale,
        onChange: handleChange,
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
  name: string;
  date: Date;
  minDate: Date | null;
  maxDate: Date | null;
  dateRange: DateRange;
  dateFormat?: DateFormat;
  dateSeparator?: DateSeparator;
  rangeSeparator?: string;
  range?: boolean | "2-calendar";
  onIconClick: () => void;
  onIconTouch: () => void;
}
const DatePickerInput: FC<DatePickerInputProps> = ({
  name,
  date,
  dateRange,
  minDate,
  maxDate,
  dateFormat,
  dateSeparator,
  rangeSeparator,
  onIconClick,
  onIconTouch,
}) => {
  const { rangeMode } = useGetConst();
  return (
    <div className="mod-inputdate-wrap">
      <InputDate
        range={rangeMode}
        name={name}
        value={rangeMode ? dateRange : date}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        dateSeparator={dateSeparator}
        rangeSeparator={rangeSeparator}
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
const DatePickerIcon: FC<DatePickerIconProps> = ({
  calendarIcon,
  onIconClick,
  onIconTouch,
}) => {
  function render() {
    if (calendarIcon) return calendarIcon;
    return <CalendarIcon />;
  }
  return (
    <Button
      cssCustom="mod-datepicker-icon"
      onClick={onIconClick}
      onTouch={onIconTouch}>
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
  date: Date;
  minDate: Date | null;
  maxDate: Date | null;
  dateRange: DateRange;
  range?: boolean | "2-calendar";
  openTo: Mode;
  dropdown: boolean;
  setDropdown: Dispatch<SetStateAction<boolean>>;
}
const DatePickerDropdown: FC<DatePickerDropdownProps> = ({
  range,
  date,
  dateRange,
  minDate,
  maxDate,
  openTo,
  dropdown,
  setDropdown,
}) => {
  const {
    rangeMode,
    startYear,
    startYearRange,
    headerRange,
    actionButton,
    actionButtonOption,
    onChange,
  } = useGetConst();
  const [isClose, setClose] = useState(false);
  const closeDropdown = useRef(() => {
    setClose(true);
    setTimeout(() => {
      setDropdown(false);
      setClose(false);
    }, 100);
  }).current;

  function render() {
    if (range) {
      return (
        <CalendarRange
          range={range}
          dateRange={dateRange}
          headerRange={headerRange}
          openTo={openTo}
          defaultMinDate={minDate}
          defaultMaxDate={maxDate}
          startYearRange={startYearRange}
          isClose={isClose}
          closeDropdown={closeDropdown}
          actionButton={actionButton}
          actionButtonOption={actionButtonOption}
          onChange={onChange}
        />
      );
    } else {
      return (
        <Calendar
          date={date}
          minDate={minDate}
          maxDate={maxDate}
          openTo={openTo}
          startYear={startYear}
          isClose={isClose}
          closeDropdown={closeDropdown}
          actionButton={actionButton}
          actionButtonOption={actionButtonOption}
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
  dateRange: DateRange;
  headerRange?: { startDate: string; endDate: string };
  openTo: Mode;
  defaultMinDate: Date | null;
  defaultMaxDate: Date | null;
  startYearRange: { min: number; max: number };
  actionButton: boolean;
  actionButtonOption?: { cancel: string; apply: string; back: string };
  isClose: boolean;
  closeDropdown: () => void;
  onChange: OnChange;
}

const CalendarRange: FC<CalendarRangeProps> = ({
  range,
  dateRange,
  headerRange = { startDate: "start date", endDate: "end date" },
  openTo,
  defaultMinDate,
  defaultMaxDate,
  startYearRange,
  isClose,
  closeDropdown,
  onChange,
}) => {
  const { actionButton, actionButtonOption } = useGetConst();
  const [rangeMode, setRangeMode] = useState<"start" | "end">("start");
  const [minDate, setMinDate] = useState(dateRange.min as Date);
  const [maxDate, setMaxDate] = useState(dateRange.max as Date);

  const handleStartSelectorClick = useCallback(
    (value: any, range: "min" | "max", type: Mode, index: string) => {
      switch (type) {
        case "year":
          break;
        case "month":
          break;
        case "day":
          if (value instanceof Date && !isEqualDate(value, minDate)) {
            setMinDate(value);
          }
          break;
      }
    },
    [minDate],
  );
  const handleEndSelectorClick = useCallback(
    (value: any, range: "min" | "max", type: Mode, index: string) => {
      switch (type) {
        case "year":
          break;
        case "month":
          break;
        case "day":
          if (value instanceof Date && !isEqualDate(value, maxDate)) {
            setMaxDate(value);
          }
          break;
      }
    },
    [maxDate],
  );

  const handleCancelButton = useCallback(closeDropdown, [closeDropdown]);
  const handleApplyButton = useCallback(() => {
    const value: any = { min: minDate, max: maxDate };
    onChange(value);
    closeDropdown();
  }, [maxDate, minDate, onChange, closeDropdown]);

  function setClassName() {
    let classname = "mod-calendar-wrap";
    if (range === "2-calendar") classname += " mod-double-calendar";
    if (range === true && rangeMode === "start") classname += " mod-start-date";
    if (range === true && rangeMode === "end") classname += " mod-end-date";
    return classname;
  }
  function setAnimationClass() {
    let classname = "mod-calendar-range mod-animation-fadein";
    if (isClose) classname += " mod-animation-fadeout";
    return classname;
  }
  return (
    <div className={setAnimationClass()}>
      {range === true ? (
        <CalendarRangeHeader
          headerRange={headerRange}
          rangeMode={rangeMode}
          setRangeMode={setRangeMode}
          minDate={minDate}
          maxDate={maxDate}
        />
      ) : (
        <CalendarRangePlaceholder
          headerRange={headerRange}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
      <div className={setClassName()}>
        <Calendar
          date={minDate}
          minDate={defaultMinDate}
          maxDate={maxDate}
          startYear={startYearRange.min}
          openTo={openTo}
          isClose={isClose}
          closeDropdown={closeDropdown}
          handleSelectorClick={handleStartSelectorClick}
          rangeIndex="min"
          rangeMinDate={minDate}
          rangeMaxDate={maxDate}
        />
        <Calendar
          date={maxDate}
          minDate={minDate}
          maxDate={defaultMaxDate}
          openTo={openTo}
          startYear={startYearRange.max}
          isClose={isClose}
          closeDropdown={closeDropdown}
          handleSelectorClick={handleEndSelectorClick}
          rangeIndex="max"
          rangeMinDate={minDate}
          rangeMaxDate={maxDate}
        />
      </div>
      {range === "2-calendar" && <div className="mod-range-separator" />}
      <CalendarRangeFooter
        range={range}
        actionButton={actionButton}
        actionButtonOption={actionButtonOption}
        handleCancelButton={handleCancelButton}
        handleApplyButton={handleApplyButton}
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
  headerRange: { startDate: string; endDate: string };
  minDate: Date;
  maxDate: Date;
}
interface CalendarRangeTabs extends CalendarRangeHeaderProps {
  rangeMode: "start" | "end";
  setRangeMode: Dispatch<SetStateAction<"start" | "end">>;
}
const CalendarRangeHeader: FC<CalendarRangeTabs> = ({
  headerRange,
  rangeMode,
  minDate,
  maxDate,
  setRangeMode,
}) => {
  const { locale } = useGetConst();
  const activeClassStart =
    rangeMode === "start" ? " mod-active-tab" : " mod-idle-tab";
  const activeClassEnd =
    rangeMode === "end" ? " mod-active-tab" : " mod-idle-tab";
  function render() {
    if (rangeMode === "start") {
      return renderDate(minDate, locale);
    } else {
      return renderDate(maxDate, locale);
    }
  }
  return (
    <Fragment>
      <div className="mod-calendar-range-header">
        <Button
          cssCustom={"mod-calendar-tab" + activeClassStart}
          onClick={() => setRangeMode("start")}>
          {headerRange.startDate}
        </Button>
        <Button
          cssCustom={"mod-calendar-tab" + activeClassEnd}
          onClick={() => setRangeMode("end")}>
          {headerRange.endDate}
        </Button>
        <div className="bottom-shadow"></div>
      </div>
      <div className="mod-bar-date">{render()}</div>
    </Fragment>
  );
};
const CalendarRangePlaceholder: FC<CalendarRangeHeaderProps> = ({
  headerRange,
  minDate,
  maxDate,
}) => {
  const { locale } = useGetConst();

  return (
    <div className="mod-calendar-range-placeholder">
      <div className="mod-static-tab">
        <div className="mod-tab-label">{headerRange.startDate}</div>
        <div className="mod-tab-date">{renderDate(minDate, locale)}</div>
      </div>
      <div className="mod-static-tab">
        <div className="mod-tab-label">{headerRange.endDate}</div>
        <div className="mod-tab-date">{renderDate(maxDate, locale)}</div>
      </div>
    </div>
  );
};
function renderDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
interface CalendarRangeFooterProps {
  range: true | "2-calendar";
  actionButton?: boolean;
  actionButtonOption?: { cancel: string; apply: string; back: string };
  handleCancelButton: () => void;
  handleApplyButton: () => void;
}
const CalendarRangeFooter: FC<CalendarRangeFooterProps> = ({
  range,
  actionButton,
  actionButtonOption = { cancel: "Cancel", apply: "Apply", back: "Back" },
  handleCancelButton,
  handleApplyButton,
}) => {
  const { cancel, apply } = actionButtonOption;
  function setClassName() {
    let classname = "mod-calendar-footer range";
    if (range === "2-calendar") classname += "-double";
    return classname;
  }
  return (
    <div className={setClassName()}>
      <div className="mod-button-wrap">
        <Button
          onClick={handleCancelButton}
          cssCustom="mat-button-base mod-hover">
          {cancel}
        </Button>
        <Button
          onClick={handleApplyButton}
          cssCustom="mat-button-base mod-primary">
          {apply}
        </Button>
      </div>
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
  range: "min" | "max",
  type: Mode,
  index: string,
) => void;
interface CalendarProps {
  date: Date;
  minDate: Date | null;
  maxDate: Date | null;
  openTo: Mode;
  startYear: number;
  actionButton?: boolean;
  actionButtonOption?: { cancel: string; apply: string; back: string };
  rangeIndex?: "min" | "max";
  rangeMinDate?: Date;
  rangeMaxDate?: Date;
  isClose: boolean;
  handleSelectorClick?: HandleSelectorClick;
  closeDropdown: () => void;
}
const Calendar: FC<CalendarProps> = ({
  date,
  minDate,
  maxDate,
  openTo,
  startYear,
  rangeIndex,
  rangeMinDate,
  rangeMaxDate,
  isClose,
  handleSelectorClick,
  closeDropdown,
}) => {
  const { allowScroll, blockScroll } = useScrollBlock();
  const { actionButton, actionButtonOption } = useGetConst();
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
      startYear={startYear}
      setMode={setMode}
      rangeIndex={rangeIndex}
      rangeMinDate={rangeMinDate}
      rangeMaxDate={rangeMaxDate}
      handleSelectorClick={handleSelectorClick}
      closeDropdown={closeDropdown}
      isClose={isClose}>
      <CalendarHeader mode={mode} />
      <CalendarSeparator mode={mode} />
      <CalendarContent mode={mode} />
      <CalendarFooter
        mode={mode}
        actionButton={actionButton}
        actionButtonOption={actionButtonOption}
      />
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
  const {
    setButtonLabel,
    onSwitchButtonClick,
    onMonthButtonClick,
    onYearButtonClick,
  } = useCalendarCore();
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
      <MatArrow
        arrow="L"
        cssCustom="mod-hover"
        disabled={disableArrowL}
        onClick={onArrowLeft}
      />
      <MatArrow
        arrow="R"
        cssCustom="mod-hover"
        disabled={disableArrowR}
        onClick={onArrowRight}
      />
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
  const { setContent, setHeaderContent } = useCalendarCore();
  const [header, setRenderHeader] = useState<string>("");
  const [content, setRenderContent] = useState<RE[]>([]);
  const subscribe = useRef(() => {
    setContent.current = (content: RE[]) => setRenderContent(content);
    setHeaderContent.current = (header: string) => setRenderHeader(header);
  });
  const unsubscribe = useCallback(() => {
    setContent.current = (_content: RE[]) => null;
    setHeaderContent.current = (_header: string) => null;
  }, [setContent, setHeaderContent]);

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

  return (
    <Fragment>
      {mode === "month" && <div className="mod-content-header">{header}</div>}
      <div className={setClassName()}>{content}</div>
    </Fragment>
  );
};
/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR FOOTER />
  ------------------------------------------------------------------------- 
*/
interface CalendarFooterProps {
  mode: Mode;
  actionButton: boolean;
  actionButtonOption?: { cancel: string; apply: string; back: string };
}
const CalendarFooter: FC<CalendarFooterProps> = ({
  mode,
  actionButton,
  actionButtonOption = { cancel: "Cancel", apply: "Apply", back: "Back" },
}) => {
  const { cancel, apply, back } = actionButtonOption;
  const { handleCancel, handleApply } = useCalendarCore();
  function renderLabel() {
    if (mode === "day") {
      return cancel;
    } else {
      return back;
    }
  }
  return (
    <Fragment>
      {actionButton && (
        <div className="mod-calendar-footer">
          <div className="mod-button-wrap">
            <Button
              onClick={handleCancel}
              cssCustom="mat-button-base mod-hover">
              {renderLabel()}
            </Button>
            <Button
              onClick={handleApply}
              cssCustom="mat-button-base mod-primary">
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
  index: number;
  indexSelector: string;
  select?: boolean;
  disabled?: boolean;
  path?: "start" | "end" | "middle" | "single";
}
const Selector: FC<SelectorProps> = memo(
  ({
    type,
    label,
    value,
    index,
    indexSelector,
    path = undefined,
    select = false,
    disabled = false,
  }) => {
    const { setSelector, activeSelector } = useGetConst();
    const { handleSelector, rangeIndex } = useCalendarCore();
    function init() {
      return activeSelector[rangeIndex][type] === indexSelector;
    }
    const [focus, setFocus] = useState(false);
    const [selected, setSelected] = useState(init);
    const handleClick = () => {
      if (disabled) return;
      handleSelector(value, rangeIndex, type, indexSelector);
    };

    const subscribe = useRef(() => {
      setSelector[rangeIndex][type][indexSelector] = {
        focus: () => setFocus(true),
        blur: () => setFocus(false),
        select: () => setSelected(true),
        unselect: () => setSelected(false),
        get: {
          value,
          index,
          indexSelector,
          focused: focus,
          selected: selected,
        },
      };
    });
    const unsubscribe = useRef(() => {
      delete setSelector[rangeIndex][type][indexSelector];
    }).current;

    useEffect(() => {
      subscribe.current();
      return () => {
        unsubscribe();
      };
    }, [unsubscribe]);

    function setClassName() {
      let classname = "mod-selector";
      if (selected) classname += ` mod-selected`;
      if (select && path) classname += ` mod-selected-${rangeIndex}-${path}`;
      if (focus) classname += " mod-active";
      if (path) classname += ` mod-path-${rangeIndex}-${path}`;
      if (disabled) classname += " mod-disabled";
      return classname;
    }

    return (
      <div className={setClassName()} onClick={handleClick}>
        {label}
        <div className="mod-insert-border" />
        <div className="mod-insert-background" />
        {path && (
          <div className={`mod-insert-path path-${rangeIndex}-${path}`} />
        )}
      </div>
    );
  },
);

const EmptySelector: FC = () => {
  return <div className="mod-date-selector blank" />;
};

/* 
  ------------------------------------------------------------------------- 
  ----- <CALENDAR CORE CONTEXT />
  ------------------------------------------------------------------------- 
*/

type SetContent = (content: RE[]) => void;
type SetButton = (label: string) => void;
type SetHeader = (header: string) => void;
type HandleSelector = (
  value: Date | number,
  rangeIndex: "min" | "max",
  type: Mode,
  indexSelector: string,
) => void;
type SetDisableArrow = (disableL: boolean, disableR: boolean) => void;

interface CalendarCoreProps {
  value: Date;
  startYear: number;
  mode: Mode;
  minDate: Date | null;
  maxDate: Date | null;
  rangeIndex?: "min" | "max";
  rangeMinDate?: Date;
  rangeMaxDate?: Date;
  isClose: boolean;
  setMode: Dispatch<SetStateAction<Mode>>;
  closeDropdown: () => void;
  handleSelectorClick?: HandleSelector;
}

const DatePickerContext = createContext<CalendarStore>({} as CalendarStore);
const useCalendarCore = () => useContext(DatePickerContext);

const CalendarCore: FC<CalendarCoreProps> = ({
  value,
  startYear,
  mode,
  minDate,
  maxDate,
  rangeIndex = "min",
  rangeMinDate,
  rangeMaxDate,
  isClose,
  setMode,
  closeDropdown,
  handleSelectorClick = undefined,
  children,
}) => {
  /* ----- RENDER DATA ---------------------------------------------------- */
  const {
    activeSelector,
    setSelector,
    monthsLabel,
    monthsButton,
    dayOffset,
    actionButton,
    monthButton,
    rangeMode,
    onChange,
  } = useGetConst();

  /* ----- SETTERS -------------------------------------------------------- */
  const setContent = useRef<SetContent>((_content: RE[]) => null);
  const setButtonLabel = useRef<SetButton>((_label: string) => null);
  const setHeaderContent = useRef<SetHeader>((_header: string) => null);
  const setDisableArrow = useRef<SetDisableArrow>(
    (_L: boolean, _R: boolean) => null,
  );
  /* ----- INDEX DATA ----------------------------------------------------- */
  const indexDate = useRef({
    curr: { year: 0, month: 0 },
    next: { year: 0, month: 0 },
  }).current;
  const yearRange = useRef({
    curr: { min: startYear, max: startYear + 23 },
    next: { min: startYear, max: startYear + 23 },
  }).current;
  const dayRange = useRef({ min: 1, max: 31 }).current;

  const renderContent = useCallback((content: RE[]) => {
    setContent.current(content);
  }, []);
  const renderButton = useRef((label: string) =>
    setButtonLabel.current(label),
  ).current;
  const renderHeaderContent = useRef((header: string) =>
    setHeaderContent.current(header),
  ).current;
  const setArrow = useRef((L: boolean, R: boolean) => {
    setDisableArrow.current(L, R);
  }).current;

  /* 
  ------------------------------------------------------------------------- 
  ----- GET CALENDAR CONTENT()
  ------------------------------------------------------------------------- 
  */

  const renderYear = useCallback(
    (year: number) => {
      const { yearContent, yearButton, arrowL, arrowR } = getYear(
        year,
        minDate,
        maxDate,
        rangeMinDate,
        rangeMaxDate,
      );
      renderContent(yearContent);
      renderButton(yearButton);
      setArrow(arrowL, arrowR);
    },
    [
      maxDate,
      minDate,
      rangeMaxDate,
      rangeMinDate,
      renderButton,
      renderContent,
      setArrow,
    ],
  );
  const renderMonth = useCallback(
    (year: number) => {
      const { monthContent, monthButton, arrowL, arrowR } = getMonth(
        monthsLabel,
        year,
        minDate,
        maxDate,
        rangeMinDate,
        rangeMaxDate,
      );
      renderContent(monthContent);
      renderButton(monthButton);
      renderHeaderContent(year.toString());
      setArrow(arrowL, arrowR);
    },
    [
      maxDate,
      minDate,
      monthsLabel,
      rangeMaxDate,
      rangeMinDate,
      renderButton,
      renderContent,
      renderHeaderContent,
      setArrow,
    ],
  );
  const renderDay = useCallback(
    (year: number, month: number) => {
      indexDate.curr = { year, month };
      indexDate.next = { year, month };
      const { dayContent, lastDay, arrowL, arrowR } = getDay(
        year,
        month,
        dayOffset,
        minDate,
        maxDate,
        rangeMinDate,
        rangeMaxDate,
      );
      dayRange.max = lastDay;
      const dayButton = `${monthsButton[month]} ${year}`;
      renderContent(dayContent);
      renderButton(dayButton);
      setArrow(arrowL, arrowR);
    },
    [
      indexDate,
      dayOffset,
      minDate,
      maxDate,
      rangeMinDate,
      rangeMaxDate,
      dayRange,
      monthsButton,
      renderContent,
      renderButton,
      setArrow,
    ],
  );
  const setYear = useCallback(() => {
    const { min } = yearRange.next;
    setMode("year");
    renderYear(min);
  }, [renderYear, setMode, yearRange.next]);
  const setMonth = useCallback(() => {
    const { year } = indexDate.next;
    setMode("month");
    renderMonth(year);
  }, [indexDate.next, renderMonth, setMode]);
  const isOutRange = useCallback(
    (rangeMin: Date, rangeMax: Date, _year: number, _month: number) => {
      const { min, max } = yearRange.curr;
      const currDate = new Date(_year, _month);
      let year = _year;
      let month = _month;
      switch (true) {
        case currDate < rangeMin:
          const minDate = toIndexDate(rangeMin);
          year = minDate.year;
          month = minDate.month;
          if (year < min) {
            year = initYear(minDate.year);
            yearRange.curr = { min: year, max: year + 23 };
          }
          return { year, month };
        case currDate > rangeMax:
          const maxDate = toIndexDate(rangeMax);
          year = maxDate.year;
          month = maxDate.month;
          if (year > max) {
            year = initYear(maxDate.year);
            yearRange.curr = { min: year, max: year + 23 };
          }
          return { year, month };
        default:
          return { year, month };
      }
    },
    [yearRange],
  );
  const setDay = useCallback(() => {
    const { year, month } = indexDate.curr;
    yearRange.next = yearRange.curr;
    setMode("day");
    renderDay(year, month);
  }, [indexDate.curr, renderDay, setMode, yearRange]);

  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE HEADER ARROW() 
  ------------------------------------------------------------------------- 
  */

  const scrollYear = useCallback(
    (nextYear: number) => {
      const { min } = yearRange.next;
      yearRange.next = { min: min + nextYear, max: min + nextYear };
      renderYear(nextYear);
    },
    [renderYear, yearRange],
  );
  const scrollMonth = useCallback(
    (nextYear: number) => {
      const { min, max } = yearRange.next;
      if (nextYear < min) {
        yearRange.next = { min: min - 24, max: max - 24 };
      }
      if (nextYear > max) {
        yearRange.next = { min: min + 24, max: max + 24 };
      }
      indexDate.next.year = nextYear;
      renderMonth(nextYear);
    },
    [indexDate.next, renderMonth, yearRange],
  );
  const scrollDay = useCallback(
    (currYear: number, currMonth: number) => {
      const { min, max } = yearRange.curr;
      let year = currYear;
      let month = currMonth;
      if (currYear < min) {
        yearRange.curr = { min: min - 24, max: max - 24 };
        yearRange.next = yearRange.curr;
      }
      if (currYear > max) {
        yearRange.curr = { min: min + 24, max: max + 24 };
        yearRange.next = yearRange.curr;
      }
      if (currMonth < 0) {
        --year;
        month = 11;
      }
      if (currMonth > 11) {
        ++year;
        month = 0;
      }
      renderDay(year, month);
    },
    [renderDay, yearRange],
  );
  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE HEADER BUTTON()
  ------------------------------------------------------------------------- 
  */

  const onSwitchButtonClick = useCallback(() => {
    if (mode !== "day") {
      setDay();
    } else {
      setYear();
    }
  }, [mode, setDay, setYear]);
  const onMonthButtonClick = useCallback(() => {
    setMonth();
  }, [setMonth]);
  const onYearButtonClick = useCallback(() => {
    setYear();
  }, [setYear]);
  const onArrowClick = useCallback(
    (scroll: -1 | 1) => {
      switch (mode) {
        case "year":
          const nextYear = scroll === 1 ? 24 : -24;
          scrollYear(nextYear);
          break;
        case "month":
          const { year } = indexDate.next;
          scrollMonth(year + scroll);
          break;
        case "day":
          scrollDay(indexDate.curr.year, indexDate.curr.month + scroll);
          break;
      }
    },
    [
      indexDate.curr.month,
      indexDate.curr.year,
      indexDate.next,
      mode,
      scrollDay,
      scrollMonth,
      scrollYear,
    ],
  );

  /* 
  ------------------------------------------------------------------------- 
  ----- HANDLE SELECTOR()
  ------------------------------------------------------------------------- 
  */

  const selectYear = useCallback(
    (year: number, month: number, index: string) => {
      if (monthButton) {
        if (minDate) {
          const _min = cloneDate(minDate);
          const minMonth = _min.getMonth();
          if (month < minMonth) {
            indexDate.curr = { year, month: minMonth };
          } else {
            indexDate.curr = { year, month };
          }
        }
        if (maxDate) {
          const _max = cloneDate(maxDate);
          const minMonth = _max.getMonth();
          if (month > minMonth) {
            indexDate.curr = { year, month: minMonth };
          } else {
            indexDate.curr = { year, month };
          }
        }
        indexDate.next = indexDate.curr;
        setDay();
      } else {
        indexDate.next.year = year;
        setMonth();
      }
    },
    [indexDate, maxDate, minDate, monthButton, setDay, setMonth],
  );
  const selectMonth = useCallback(
    (year: number, month: number, index: string) => {
      indexDate.curr = { year, month };
      indexDate.next = indexDate.curr;
      setDay();
    },
    [indexDate, setDay],
  );

  const selectDay = useCallback(
    (value: Date, index: string) => {
      if (actionButton || rangeMode) {
      } else {
        const payload: any = value;
        onChange(payload);
        closeDropdown();
      }
    },
    [actionButton, closeDropdown, onChange, rangeMode],
  );

  const handleSelector = useCallback(
    (
      value: Date | number,
      rangeIndex: "min" | "max",
      type: Mode,
      indexSelector: string,
    ) => {
      const { year, month } = indexDate.next;
      switch (mode) {
        case "year":
          if (typeof value === "number")
            selectYear(value, month, indexSelector);
          break;
        case "month":
          if (typeof value === "number")
            selectMonth(year, value, indexSelector);
          break;
        case "day":
          if (value instanceof Date) {
            selectDay(value, indexSelector);
          }
          break;
      }
      if (handleSelectorClick && rangeIndex) {
        handleSelectorClick(value, rangeIndex, type, indexSelector);
      }
      // ESTENDE LA FUNZIONE DA VERIFICARE!
    },
    [
      handleSelectorClick,
      indexDate.next,
      mode,
      selectDay,
      selectMonth,
      selectYear,
    ],
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
      setDay();
    }
  }, [mode, setDay, closeDropdown]);
  const handleApply = useCallback(() => {
    switch (mode) {
      case "year":
        if (monthButton) {
          setDay();
        } else {
          setMonth();
        }
        break;
      case "month":
        setDay();
        break;
      case "day":
        //ON CHANGE
        break;
    }
  }, [mode, monthButton, setDay, setMonth]);
  /* 
  ------------------------------------------------------------------------- 
  ----- ON UPDATE()
  ------------------------------------------------------------------------- 
  */
  const update = useCallback(() => {
    switch (mode) {
      case "year":
        setYear();
        break;
      case "month":
        setMonth();
        break;
      case "day":
        setDay();
        break;
    }
  }, [mode, setDay, setMonth, setYear]);
  useEffect(() => {
    if (rangeMinDate && rangeMaxDate) {
      update();
    }
  }, [update, rangeMinDate, rangeMaxDate]);

  /* 
  ------------------------------------------------------------------------- 
  ----- ON INIT()
  ------------------------------------------------------------------------- 
  */
  const initActiveSelector = useCallback(
    (year: number, month: number, day: number) => {
      const y = year.toString();
      const m = `${month}`.padStart(2, "0");
      const d = `${day}`.padStart(2, "0");
      const _month = `${y}${m}`;
      const _day = `${y}${m}${d}`;
      activeSelector[rangeIndex] = { year: y, month: _month, day: _day };
    },
    [activeSelector, rangeIndex],
  );

  const toIndexDate = (date: Date) => {
    const d = cloneDate(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return { year, month, day };
  };

  const init = useRef(() => {
    const { year, month, day } = toIndexDate(value);
    initActiveSelector(year, month, day);
    switch (mode) {
      case "year":
        renderYear(startYear);
        break;
      case "month":
        renderMonth(year);
        break;
      case "day":
        renderDay(year, month);
        break;
    }
  });

  useEffect(() => {
    init.current();
  }, []);

  function setClassName() {
    let classname = "mod-calendar";
    if (rangeMode) {
      return classname;
    } else {
      classname += " mod-animation-fadein";
      if (isClose) classname += " mod-animation-fadeout";
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
            activeSelector,
            rangeIndex,
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
interface CalendarStore {
  setButtonLabel: MutableRefObject<SetButton>;
  setContent: MutableRefObject<SetContent>;
  setHeaderContent: MutableRefObject<SetHeader>;
  setDisableArrow: MutableRefObject<SetDisableArrow>;
  activeSelector: ActiveSelector;
  rangeIndex: "min" | "max";
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
  minDate: Date | null = null,
  maxDate: Date | null = null,
  rangeMinDate?: Date,
  rangeMaxDate?: Date,
) {
  const lastYear = year + 23;
  const yearButton = `${year} - ${lastYear}`;
  const yearContent: RE[] = [];
  let path: "start" | "middle" | "end" | "single" | undefined = undefined;
  let arrowL = false;
  let arrowR = false;
  let testPrevYears = false;
  let testNextYears = false;
  if (minDate) testPrevYears = new Date(year - 1, 0) <= cloneDate(minDate);
  if (maxDate) testNextYears = new Date(lastYear + 1, 0) >= cloneDate(maxDate);

  for (let i = 0; i < 24; ++i) {
    const yearString = `${year + i}`;
    let isPast = false;
    let isFuture = false;
    let selected = false;
    if (minDate) {
      const min = cloneDate(minDate);
      isPast = setYear(minDate, year + i) < min;
      arrowL = isPast || testPrevYears;
    }
    if (maxDate) {
      const max = cloneDate(maxDate);
      isFuture = setYear(maxDate, year + i) > max;
      arrowR = isFuture || testNextYears;
    }
    if (rangeMinDate && rangeMaxDate) {
      if (!isEqualDate(rangeMaxDate, rangeMinDate)) {
        const value = year + i;
        switch (true) {
          case isEqualYear(rangeMaxDate, rangeMinDate):
            if (
              isEqualYear(value, rangeMaxDate) ||
              isEqualYear(value, rangeMinDate)
            ) {
              selected = true;
              path = "single";
              break;
            } else {
              selected = false;
              path = undefined;
              break;
            }
          case isEqualYear(value, rangeMinDate):
            selected = true;
            path = "start";
            break;
          case isEqualYear(value, rangeMaxDate):
            selected = true;
            path = "end";
            break;
          case value > toYear(rangeMinDate) && value < toYear(rangeMaxDate):
            path = "middle";
            break;
          default:
            selected = false;
            path = undefined;
            break;
        }
      }
    }
    const disabled = isPast || isFuture;
    yearContent.push(
      <Selector
        type="year"
        key={year + i}
        disabled={disabled}
        value={year + i}
        label={yearString}
        index={year + i}
        indexSelector={yearString}
        path={path}
        select={selected}
      />,
    );
  }

  return {
    yearContent,
    startYear: year,
    lastYear,
    yearButton,
    arrowL,
    arrowR,
  };
}
function getMonth(
  month: string[],
  year: number,
  minDate: Date | null = null,
  maxDate: Date | null = null,
  rangeMinDate?: Date,
  rangeMaxDate?: Date,
) {
  let arrowL = false;
  let arrowR = false;
  let testPrevYear = false;
  let testNextYear = false;
  let path: "start" | "middle" | "end" | "single" | undefined = undefined;
  const monthContent: RE[] = [];
  const monthButton = year.toString();
  if (minDate) testPrevYear = new Date(year, 0, 0) < minDate;
  if (maxDate) testNextYear = new Date(year + 1, 0, 1) > maxDate;
  for (let i = 0; i < 12; ++i) {
    const monthString = toStringIndexMonth(year, i);
    let isPast = false;
    let isFuture = false;
    let selected = false;
    if (minDate) {
      const min = cloneDate(minDate);
      isPast = setMonth(minDate, i) < min;
      arrowL = isPast || testPrevYear;
    }
    if (maxDate) {
      const max = cloneDate(maxDate);
      isFuture = new Date(year, i) > max;
      arrowR = isFuture || testNextYear;
    }
    if (rangeMinDate && rangeMaxDate) {
      if (!isEqualDate(rangeMaxDate, rangeMinDate)) {
        const value = new Date(year, i);
        switch (true) {
          case isEqualMonth(rangeMaxDate, rangeMinDate) &&
            isEqualMonth(value, rangeMaxDate):
            selected = true;
            path = "single";
            break;
          case isEqualMonth(value, rangeMinDate):
            selected = true;
            path = "start";
            break;
          case isEqualMonth(value, rangeMaxDate):
            selected = true;
            path = "end";
            break;
          case value > rangeMinDate && value < rangeMaxDate:
            path = "middle";
            break;
          default:
            selected = false;
            path = undefined;
            break;
        }
      }
    }
    const disabled = isPast || isFuture;
    monthContent.push(
      <Selector
        type="month"
        key={monthString}
        disabled={disabled}
        value={i}
        label={month[i]}
        index={i}
        indexSelector={monthString}
        path={path}
        select={selected}
      />,
    );
  }
  return { monthContent, monthButton, arrowL, arrowR };
}
function getDay(
  year: number,
  month: number,
  dayOffset: 0 | 1,
  minDate: Date | null = null,
  maxDate: Date | null = null,
  rangeMinDate?: Date,
  rangeMaxDate?: Date,
) {
  let arrowL = false;
  let arrowR = false;
  let testPrevMonth = false;
  let testNextMonth = false;
  const date = new Date(year, month, 1);
  const offset = date.getDay() - dayOffset;
  const spaces = offset < 0 ? 7 + offset : offset;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dayContent: RE[] = [];

  if (minDate) testPrevMonth = new Date(year, month, 0) < minDate;
  if (maxDate) testNextMonth = new Date(year, month + 1, 1) > maxDate;
  for (let index = 1; index <= lastDay + spaces; ++index) {
    if (index <= spaces) {
      dayContent.push(<EmptySelector key={"blank-" + index} />);
    } else {
      const day = index - spaces;
      const value = new Date(year, month, day);
      const stringIndex = toStringIndexDay(year, month, day);
      let isPast = false;
      let isFuture = false;
      let selected = false;
      let path: "start" | "middle" | "end" | "single" | undefined = undefined;
      if (minDate) {
        const min = cloneDate(minDate);
        isPast = value < min;
        arrowL = isPast || testPrevMonth;
      }
      if (maxDate) {
        const max = cloneDate(maxDate);
        isFuture = value > max;
        arrowR = isFuture || testNextMonth;
      }
      if (rangeMinDate && rangeMaxDate) {
        switch (true) {
          case isEqualDate(rangeMaxDate, rangeMinDate):
            if (
              isEqualDate(value, rangeMinDate) ||
              isEqualDate(value, rangeMaxDate)
            ) {
              selected = true;
              path = "single";
              break;
            } else {
              selected = false;
              path = undefined;
              break;
            }
          case isEqualDate(value, rangeMinDate):
            selected = true;
            path = "start";
            break;
          case isEqualDate(value, rangeMaxDate):
            selected = true;
            path = "end";
            break;
          case value > rangeMinDate && value < rangeMaxDate:
            path = "middle";
            break;
          default:
            selected = false;
            path = undefined;
            break;
        }
      }

      dayContent.push(
        <Selector
          type="day"
          disabled={isFuture || isPast}
          key={stringIndex}
          value={value}
          label={day.toString()}
          index={day}
          indexSelector={stringIndex}
          path={path}
          select={selected}
        />,
      );
    }
  }
  return { dayContent, lastDay, arrowL, arrowR };
}
const cloneDate = (date: Date, addYear = 0, addMonth = 0, addDay = 0) => {
  const d = new Date(date);
  return new Date(
    d.getFullYear() + addYear,
    d.getMonth() + addMonth,
    d.getDate() + addDay,
  );
};
function setYear(date: Date, year: number) {
  const clone = new Date(date);
  const m = clone.getMonth();
  const d = clone.getDate();
  return new Date(year, m, d);
}
function setMonth(date: Date, month: number) {
  const clone = new Date(date);
  const y = clone.getFullYear();
  const d = clone.getDate();
  return new Date(y, month, d);
}
function setDay(date: Date, day: number) {
  const clone = new Date(date);
  const y = clone.getFullYear();
  const m = clone.getMonth();
  return new Date(y, m, day);
}

const useInitYear = (value: Date) => {
  const initState = useCallback(() => {
    return initYear(value.getFullYear());
  }, [value]);

  const [startYear] = useState<number>(initState);
  return { startYear };
};

const useInitRangeYear = (dateRange: DateRange) => {
  const initState = useCallback(() => {
    const min = initYear(dateRange.getIndexDateMin().year);
    const max = initYear(dateRange.getIndexDateMax().year);
    return { min, max };
  }, [dateRange]);

  const [startYearRange] = useState<{ min: number; max: number }>(initState);
  return { startYearRange };
};

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
  const [monthsLocale] =
    useState<{ monthsButton: string[]; monthsLabel: string[] }>(initMonth);
  return {
    monthsLabel: monthsLocale.monthsLabel,
    monthsButton: monthsLocale.monthsButton,
  };
};

const useGetWeekday = (
  locale: string,
  dayOffset: 0 | 1,
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

/* 
  ------------------------------------------------------------------------- 
  ----- CHECK PROPS()
  ------------------------------------------------------------------------- 
*/

type ReturnCheckProps = [
  boolean,
  Date,
  DateRange,
  Date | null,
  string,
  boolean,
];

const useCheckProps = (
  name: any,
  range: any,
  value: any,
  minDate: Date | null,
  maxDate: Date | null,
  localization?: string,
): ReturnCheckProps => {
  const today = new Date();
  const [checked, setChecked] = useState(false);
  const [internalError, setError] = useState(false);
  const [locale, setLocale] = useState<string>("");
  const [date, setDate] = useState<Date>(today);
  const [dateRange, setDateRange] = useState<DateRange>(
    new DateRange(today, today),
  );
  const [defMinDate, setMinDate] = useState<Date | null>(minDate);

  const inputName = useRef(`INVALID PROPS\nINPUT NAME: ${name}`);
  const checkWarning = useCallback(
    (minDate: Date | null, maxDate: Date | null) => {
      let warningMessage = "";
      const [language, localeWarn] = testLocale(localization);
      setLocale(language);
      if (localeWarn) {
        warningMessage +=
          inputName.current +
          `\nWARNING: <DatePicker localization="${localization}" />\n${localeWarn}`;
      }
      if (minDate && maxDate && (minDate > maxDate || minDate === maxDate)) {
        const minDateStr = cloneDate(minDate).toLocaleDateString();
        const maxDateStr = cloneDate(maxDate).toLocaleDateString();
        warningMessage += `\nWARNING: <DatePicker minDate={${minDateStr}} is greater than or equal to maxDate={${maxDateStr}} />`;
        warningMessage +=
          '\nWARNING: For proper functioning minDate has been set to "null", please fix minDate to not display this warning';
        setMinDate(null);
      }
      if (warningMessage) console.warn(inputName.current + warningMessage);
    },
    [localization],
  );
  const checkValue = useRef((value: any) => {
    if (internalError) return;
    if (value instanceof Date) {
      setDate(value);
    }
  });
  const checkRangeValue = useRef((value: any) => {
    if (internalError) return;
    if (!isValidDateRange(value)) return;
    const override = { ...dateRange };
    let warnMessage = "";

    switch (true) {
      case value.min !== null && value.max !== null:
        if (value.min > value.max) {
          warnMessage = "MIN cannot be greater than MAX";
        } else {
          override.min = value.min;
          override.max = value.max;
        }
        break;
      case value.min !== null && value.max === null:
        if (minDate) {
          if (value.min < minDate) {
            override.min = cloneDate(minDate);
            override.max = cloneDate(minDate);
            break;
          }
        }
        if (maxDate) {
          if (value.min > maxDate) {
            override.min = cloneDate(maxDate);
            override.max = cloneDate(maxDate);
            break;
          }
        }
        override.min = value.min;
        override.max = value.min;
        break;
      case value.max !== null:
        override.min = value.max;
        override.max = value.max;
        break;
    }
    if (warnMessage) {
      console.warn(warnMessage);
    }
    const { min, max } = override;
    setDateRange(new DateRange(min, max));
  });
  const checkNameError = () => {
    let errorName = "";
    if (name === undefined) {
      errorName =
        "\nERROR: <DatePicker name={ is MISSING or UNDEFINED instead of STRING } />";
    }
    if (typeof name !== "string") {
      const nameType = typeof name;
      errorName = `\nERROR: <DatePicker name={ is ${nameType.toUpperCase()} instead of STRING } />`;
    }
    if (errorName) {
      inputName.current = "INVALID PROPS\nINPUT NAME: unknown";
      throw new Error(inputName.current + errorName);
    }
  };
  const checkRangeError = () => {
    let errorMessage = "";
    if (range) {
      let rangeError = "";
      switch (typeof range) {
        case "boolean":
          break;
        case "string":
          if (range !== "2-calendar") {
            rangeError += `is "${range}" instead of "2-calendar"`;
          }
          break;
        default:
          const typeRange = typeof range;
          rangeError += `is "${typeRange.toUpperCase()}" instead of BOOLEAN or "2-calendar"`;
          break;
      }
      if (rangeError) {
        errorMessage = `\nERROR: <DatePicker range={ ${rangeError} } />`;
        throw new Error(inputName.current + errorMessage);
      }
      if (!isValidDateRange(value)) {
        errorMessage = `\nERROR: <DatePicker range value={\n\tMUST BE {min: Date | null, max: Date | null} } />`;
        throw new Error(inputName.current + errorMessage);
      }
    } else {
      if (value && !(value instanceof Date))
        errorMessage += `\nERROR: <DatePicker value={ MUST BE DATE or NULL } />`;
    }
  };
  const checkFatalError = useRef((value: any) => {
    try {
      checkNameError();
      checkRangeError();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  });
  useEffect(() => {
    checkFatalError.current(value);
    checkValue.current(value);
    checkRangeValue.current(value);
    checkWarning(minDate, maxDate);
    setChecked(true);
  }, [checkWarning, maxDate, minDate, value]);

  return [checked, date, dateRange, defMinDate, locale, internalError];
};

/* 
  ------------------------------------------------------------------------- 
  ----- TEST FUNCTION
  ------------------------------------------------------------------------- 
*/

function testLocale(locale?: string) {
  let warningMessage = "";
  if (locale) {
    const split = locale.split("-");
    const lenghtTest = split.length <= 1 || split.length > 2;
    const stringTest = split[0].toUpperCase() !== split[1];
    if (lenghtTest || stringTest) {
      const systemLang = navigator.language;
      warningMessage = `\t"${locale}" is incorrect locale information.\n\tDont worry "${systemLang}" has been set up according to your system settings`;
      return [systemLang, warningMessage];
    } else {
      return [locale, warningMessage];
    }
  } else {
    return [navigator.language, warningMessage];
  }
}

function isEqualMonth(_x: Date, _y: Date) {
  const x = new Date(_x);
  const y = new Date(_y);
  const xy = x.getFullYear();
  const xm = x.getMonth();
  const yy = y.getFullYear();
  const ym = y.getMonth();
  return xy === yy && xm === ym;
}
function isEqualYear(_x: number | Date, _y: Date) {
  const y = new Date(_y).getFullYear();
  if (_x instanceof Date) {
    const x = new Date(_x).getFullYear();
    return x === y;
  } else {
    return _x === y;
  }
}
function toYear(x: Date) {
  return new Date(x).getFullYear();
}

function clone(data: any) {
  const cache = [data];
  const clone = [...cache];
  return clone[0];
}
function toStringIndexMonth(year: number, month: number) {
  const y = `${year}`;
  const m = `${month}`.padStart(2, "0");
  return `${y}${m}`;
}
function toStringIndexDay(year: number, month: number, day: number) {
  const y = `${year}`;
  const m = `${month}`.padStart(2, "0");
  const d = `${day}`.padStart(2, "0");
  return `${y}${m}${d}`;
}
