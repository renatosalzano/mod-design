import {
  ChangeEvent,
  createContext,
  createElement,
  FC,
  forwardRef,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DateRange } from "../utils/DateRange";
import { isValidDate } from "../utils/testDate";
import "./SCSS/mod-core-inputdate.scss";

type DateFormat = "D/M/Y" | "M/D/Y" | "Y/M/D";
type DateSeparator = "/" | "." | "-" | " ";
type DatePlaceholder = { dd: string; mm: string; yyyy: string };
interface Setter {
  focus: () => void;
  unfocus: () => void;
  update: (value: number) => void;
}
interface SetInput {
  [key: string]: Setter;
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
}) => {
  const isDate = useCallback((value: any) => {
    if (value instanceof Date && isValidDate(value)) return value;
    else return null;
  }, []);
  const isDateRange = useCallback((value: any) => {
    if (value instanceof DateRange && isValidDateRange(value)) {
      return new DateRange(value.min, value.max);
    } else return new DateRange(null, null);
  }, []);
  /* ----- INPUT SETTER() ------------------------------------------ */
  const setInput = useRef<SetInput>({}).current;

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
          setInput={setInput}
        />
      ) : (
        <ModInputDate
          date={isDate(value)}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat={dateFormat}
          dateSeparator={dateSeparator}
          datePlaceholder={datePlaceholder}
          setInput={setInput}
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
  setInput: SetInput;
}

const ModInputDateRange: FC<InputDateRangeProps> = ({
  dateRange,
  defaultMinDate,
  defaultMaxDate,
  rangeSeparator = "-",
  dateFormat,
  dateSeparator,
  datePlaceholder,
  setInput,
}) => {
  const [minDate, setMinDate] = useState(dateRange.min);
  const [maxDate, setMaxDate] = useState(dateRange.max);
  useEffect(() => {
    console.log(dateRange);
  }, [dateRange]);
  return (
    <div className="mod-inputdate-range">
      <ModInputDate
        date={dateRange.min}
        minDate={defaultMinDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        dateSeparator={dateSeparator}
        datePlaceholder={datePlaceholder}
        setInput={setInput}
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
        setInput={setInput}
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
}
const ModInputDate: FC<InputDateProps> = ({
  date,
  minDate,
  maxDate,
  dateFormat = "D/M/Y",
  dateSeparator = "/",
  datePlaceholder = { dd: "dd", mm: "mm", yyyy: "yyyy" },
  setInput,
}) => {
  const { dd, mm, yyyy } = datePlaceholder;
  const inputType = useRef<InputType[]>(
    dateFormat.split("/") as InputType[],
  ).current;

  const [value, setValue] = useState({ D: dd, M: mm, Y: yyyy });

  const [rangeYear, setRangeYear] = useState(() => {
    let min = 0;
    let max = 9999;
    if (minDate) min = dateToNumber(minDate).year;
    if (maxDate) max = dateToNumber(maxDate).year;
    return { min, max };
  });

  const [rangeMonth, setRangeMonth] = useState({ min: 1, max: 11 });
  const [rangeDay, setRangeDay] = useState({ min: 1, max: 31 });
  const D = useRef<IE>(null);
  const M = useRef<IE>(null);
  const Y = useRef<IE>(null);

  const handleYear = useCallback((year: number) => {}, []);
  const handleMonth = useCallback((month: number) => {}, []);
  const handleDay = useCallback(
    (day: number) => {
      const { min, max } = rangeDay;
    },
    [rangeDay],
  );

  const updateValue = useCallback(() => {
    if (date !== null) {
      const cloneDate = new Date(date);
      const Y = cloneDate.getFullYear().toString();
      const M = `${cloneDate.getMonth() + 1}`.padStart(2, "0");
      const D = `${cloneDate.getDate()}`.padStart(2, "0");
      setValue({ Y, M, D });
    } else {
      setValue({ D: dd, M: mm, Y: yyyy });
    }
  }, [dd, mm, date, yyyy]);
  useEffect(() => {
    updateValue();
  }, [updateValue]);
  const input = {
    Y: (
      <Input
        id="Y"
        value={value.Y}
        range={rangeYear}
        onChange={handleYear}
        setInput={setInput}
      />
    ),
    M: (
      <Input
        id="M"
        value={value.M}
        range={rangeMonth}
        onChange={handleMonth}
        setInput={setInput}
      />
    ),
    D: (
      <Input
        id="D"
        value={value.D}
        range={rangeDay}
        onChange={handleDay}
        setInput={setInput}
      />
    ),
  };
  return (
    <div className="mod-inputdate">
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

interface InputProps {
  id: InputType;
  value: string;
  range: { min: number; max: number };
  pad?: number;
  setInput: SetInput;
  onChange: (value: number) => void;
}
const Input: FC<InputProps> = ({
  id,
  value,
  range,
  pad = 2,
  setInput,
  onChange,
}) => {
  const ref = useRef<IE>(null);
  const handleChange = (event: ChangeEvent<IE>) => {
    const targetValue = parseInt(event.target.value);
    switch (targetValue) {
      case range.min:
        onChange(range.min);
        break;
      case range.max:
        onChange(range.max);
        break;
      default:
        onChange(targetValue);
        break;
    }
  };
  const renderValue = (value: string) => {
    return value.padStart(pad, "0");
  };
  return (
    <input
      id={id}
      className="mod-input-core"
      type="text"
      ref={ref}
      value={renderValue(value)}
      onChange={handleChange}
    />
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

function isValidDateRange(value: DateRange) {
  return isValidDate(value.min) && isValidDate(value.max);
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
