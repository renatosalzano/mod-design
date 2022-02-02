import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./SCSS/mod-core-inputdate.scss";
interface Props {
  name: string;
  value: Date | null;
  dateFormat?: "D/M/Y" | "M/D/Y" | "Y/M/D";
  dateSeparator?: "/" | "." | "-" | " ";
  datePlaceholder?: { dd: string; mm: string; yyyy: string };
  minDate?: Date | null;
  maxDate?: Date | null;
}
type IE = HTMLInputElement;
type InputType = "D" | "M" | "Y";
const InputDate: FC<Props> = ({
  value,
  dateFormat = "D/M/Y",
  dateSeparator = "/",
  datePlaceholder = { dd: "dd", mm: "mm", yyyy: "yyyy" },
}) => {
  const { dd, mm, yyyy } = datePlaceholder;
  const inputType = useRef<InputType[]>(
    dateFormat.split("/") as InputType[],
  ).current;

  const [date, setDate] = useState({ D: dd, M: mm, Y: yyyy });
  const rangeYear = useRef({ min: 0, max: 9999 });
  const rangeMonth = useRef({ min: 1, max: 11 }).current;
  const rangeDay = useRef({ min: 1, max: 31 }).current;
  const D = useRef<IE>(null);
  const M = useRef<IE>(null);
  const Y = useRef<IE>(null);

  const updateValue = useCallback(() => {
    if (value !== null) {
      const cloneDate = new Date(value);
      const Y = cloneDate.getFullYear().toString();
      const M = `${cloneDate.getMonth() + 1}`.padStart(2, "0");
      const D = `${cloneDate.getDate()}`.padStart(2, "0");
      setDate({ Y, M, D });
    } else {
      setDate({ D: dd, M: mm, Y: yyyy });
    }
  }, [dd, mm, value, yyyy]);
  useEffect(() => {
    updateValue();
  }, [updateValue]);
  const input = {
    Y: <Input ref={Y} id="mod-input-year" value={date.Y} />,
    M: <Input ref={M} id="mod-input-month" value={date.M} />,
    D: <Input ref={D} id="mod-input-day" value={date.D} />,
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

export default InputDate;
interface InputProps {
  id: string;
  value: string;
}
const Input = forwardRef<IE, InputProps>(({ id, value }, ref) => {
  return (
    <input
      id={id}
      className="mod-input-core"
      type="text"
      ref={ref}
      value={value}
    />
  );
});
