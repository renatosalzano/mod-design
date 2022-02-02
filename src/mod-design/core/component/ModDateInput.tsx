import {
  ChangeEvent,
  Dispatch,
  FC,
  forwardRef,
  KeyboardEvent,
  memo,
  ReactElement,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
type IE = HTMLInputElement;
type Format = "D/M/Y" | "M/D/Y" | "Y/M/D";
type ID = "D" | "M" | "Y";
type StateValue = { D: string; M: string; Y: string };

interface Props {
  format?: Format;
  separator?: "/" | "." | "-" | " ";
  setFocus: Dispatch<SetStateAction<boolean>>;
  onIconClick: () => void;
  onIconTouch: () => void;
}

const ModDateInput: FC<Props> = ({
  format = "D/M/Y",
  separator = "/",
  setFocus,
  onIconClick,
  onIconTouch,
}) => {
  const [value, setValue] = useState({ D: "dd", M: "mm", Y: "yyyy" });
  const _value = useRef({ D: "", M: "", Y: "" }).current;
  const rangeValue = useRef({
    D: { min: 1, max: 31, pad: 2 },
    M: { min: 1, max: 12, pad: 2 },
    Y: { min: 0, max: 9999, pad: 4 },
  }).current;
  const id = useRef(format.split("/") as ID[]).current;
  const D = useRef<IE>(null);
  const M = useRef<IE>(null);
  const Y = useRef<IE>(null);
  const refIndex = useRef({ D: D, M: M, Y: Y }).current;

  const nextFocus = useRef((input: "D" | "M" | "Y", next = true) => {
    let index = id.indexOf(input);
    _value[input] = "";
    if (next) {
      index = index === 2 ? 2 : ++index;
    } else {
      index = index === 0 ? 0 : --index;
    }
    refIndex[id[index]].current!.select();
  }).current;

  const checkDate = useCallback(
    (y: number, m: number, id: ID, currentValue: string) => {
      if (!isNaN(y) && !isNaN(m)) {
        const d = parseInt(value.D);
        const dayInMonth = new Date(y, m, 0).getDate();
        if (!isNaN(d) && d > dayInMonth) {
          rangeValue.D.max = dayInMonth;
          setValue({ ...value, D: `${dayInMonth}`, [id]: currentValue });
        }
      }
    },
    [rangeValue.D, value],
  );

  const handleDM = useCallback(
    (digit: number, id: ID, max: number, min: number) => {
      let currentValue = digit;
      let stringValue = `${digit}`;

      if (isNaN(digit)) {
        stringValue = "";
        setValue({ ...value, [id]: stringValue });
        _value[id] = stringValue;
        return;
      }
      switch (true) {
        case digit === 0:
          _value[id] += `${digit}`;
          break;
        case digit > 0 && digit < 10:
          _value[id] += `${digit}`;
          break;
        default:
          _value[id] = `${digit}`;
          break;
      }

      switch (true) {
        case _value[id] === "00":
          currentValue = 1;
          stringValue = "01";
          nextFocus(id);
          break;
        case digit > 0 && digit <= min && _value[id][0] === "0":
          stringValue = `0${digit}`;
          nextFocus(id);
          break;
        case digit > min && digit < 10:
          stringValue = `0${digit}`;
          nextFocus(id);
          break;
        case digit >= 10 && digit <= max:
          nextFocus(id);
          break;
        case digit >= max:
          currentValue = max;
          stringValue = `${max}`;
          nextFocus(id);
          break;
        default:
          stringValue = `${digit}`.padStart(2, "0");
          break;
      }
      setValue({ ...value, [id]: stringValue });
      if (id === "M") {
        checkDate(parseInt(value.Y), currentValue, id, stringValue);
      }
    },
    [_value, checkDate, nextFocus, value],
  );

  const handleY = useCallback(
    (digit: number, id: ID) => {
      let stringValue = "0000";
      switch (true) {
        case digit < 0:
          nextFocus("Y");
          break;
        case digit > 9999:
          stringValue = `9999`;
          break;
        default:
          stringValue = `${digit}`.padStart(4, "0");
          break;
      }
      setValue({ ...value, Y: stringValue });
      checkDate(digit, parseInt(value.M), id, stringValue);
    },
    [checkDate, nextFocus, value],
  );

  const handle = useRef({
    day: (digit: number) => handleDM(digit, "D", 31, 3),
    month: (digit: number) => handleDM(digit, "M", 12, 2),
    year: (digit: number) => handleY(digit, "Y"),
  }).current;

  const set = useRef((id: ID, prev: StateValue, next: string) => {
    if (prev[id] !== next) {
      setValue({ ...prev, [id]: next });
    }
  });

  const currentYear = useRef((offset: number) => {
    return new Date().getFullYear() + offset;
  });

  const handleKey = useCallback(
    (event: KeyboardEvent<IE>, digit: number, id: ID) => {
      const max = rangeValue[id].max;
      const min = rangeValue[id].min;
      const pad = rangeValue[id].pad;

      let stringValue = "";
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          nextFocus(id, false);
          break;
        case "ArrowRight":
          event.preventDefault();
          nextFocus(id);
          break;
        case "ArrowUp":
          event.preventDefault();
          if (id === "Y" && digit === 0) {
            digit = currentYear.current(-1);
          }
          if (digit >= max) {
            stringValue = `${max}`.padStart(pad, "0");
          } else {
            stringValue = `${++digit}`.padStart(pad, "0");
          }
          set.current(id, value, stringValue);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (id === "Y" && digit === 0) {
            digit = currentYear.current(1);
          }
          if (digit <= min) {
            stringValue = `${min}`.padStart(pad, "0");
          } else {
            stringValue = `${--digit}`.padStart(pad, "0");
          }
          set.current(id, value, stringValue);
          break;
        case "Backspace":
          event.preventDefault();
          break;
        case "Enter":
          event.preventDefault();
          nextFocus(id);
          break;
      }
    },
    [nextFocus, rangeValue, value],
  );

  function handleClick(id: ID) {
    refIndex[id].current?.select();
  }

  const dateInput = {
    D: (
      <DateInput
        ref={D}
        id="D"
        value={value.D}
        placeholder="dd"
        onChange={handle.day}
        onKeyDown={handleKey}
        onClick={handleClick}
        setFocus={setFocus}
      />
    ),
    M: (
      <DateInput
        ref={M}
        id="M"
        placeholder="mm"
        value={value.M}
        onChange={handle.month}
        onKeyDown={handleKey}
        onClick={handleClick}
        setFocus={setFocus}
      />
    ),
    Y: (
      <DateInput
        ref={Y}
        id="Y"
        value={value.Y}
        placeholder="yyyy"
        onChange={handle.year}
        onKeyDown={handleKey}
        onClick={handleClick}
        setFocus={setFocus}
      />
    ),
  };

  return (
    <div className={"mod-input-flex"}>
      <div className="mod-input-date">
        {dateInput[id[0]]}
        <div className="mod-date-separator">{separator}</div>
        {dateInput[id[1]]}
        <div className="mod-date-separator">{separator}</div>
        {dateInput[id[2]]}
      </div>
      <CalendarIcon onClick={onIconClick} onTouch={onIconTouch} />
    </div>
  );
};

export default memo(ModDateInput);

interface IP {
  value: string;
  id: ID;
  placeholder?: string;
  onChange: (value: number) => void;
  onKeyDown: (event: KeyboardEvent<IE>, digit: number, id: ID) => void;
  onClick: (id: ID) => void;
  setFocus?: Dispatch<SetStateAction<boolean>>;
}

const DateInput = forwardRef<IE, IP>(
  ({ value, id, placeholder, onChange, onKeyDown, onClick, setFocus }, ref) => {
    const [active, setActive] = useState(false);
    const digitReg = useRef(/^\d+$/).current;

    function handleChange(event: ChangeEvent<IE>) {
      event.target.focus();
      const digit = event.target.value;
      if (digit === "" || digitReg.test(digit)) {
        onChange(parseInt(digit));
      }
    }

    function toInt(value: string) {
      if (isNaN(Number(value))) return 0;
      else return parseInt(value);
    }

    function handleFocus(focus: boolean) {
      !!setFocus && setFocus(focus);
      setActive(focus);
    }

    return (
      <input
        key={"mod-input-" + id}
        className={active ? "active" : ""}
        ref={ref}
        type="text"
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={(e) => onKeyDown(e, toInt(value), id)}
        onClick={() => onClick(id)}
        onFocus={() => handleFocus(true)}
        onBlur={() => handleFocus(false)}
      />
    );
  },
);

interface IconProps {
  customIcon?: ReactElement;
  disabled?: boolean;
  onClick?: () => void;
  onTouch?: () => void;
}

const CalendarIcon: FC<IconProps> = memo(
  ({ customIcon, disabled, onClick, onTouch }) => {
    function handleClick() {
      if (!disabled) {
        !!onClick && onClick();
      }
    }
    function handleTouch() {
      if (!disabled) {
        !!onTouch && onTouch();
      }
    }
    return (
      <div
        className="mod-calendar-icon"
        onClick={handleClick}
        onTouchStart={onTouch}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xlinkHref="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          role="img"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24">
          <path
            d="M7 10h5v5H7m12 4H5V8h14m0-5h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  },
);
