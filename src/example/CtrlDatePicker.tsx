import { FC, useEffect, useRef, useState } from "react";
import { DatePicker } from "../mod-design/core";

interface Props {
  name: string;
}

type RangeDate = {
  min: Date | null;
  max: Date | null;
};
const CtrlDatePicker: FC<Props> = ({ name }) => {
  const [date, setDate] = useState<Date | null>(null);

  function handleDate(value: Date | null) {
    setDate(value);
  }

  function toString(value: RangeDate) {
    let str = "";
    if (value.min) str += ` min: ${value.min.toLocaleDateString()}`;
    if (value.max) str += ` max: ${value.max.toLocaleDateString()}`;
    return str;
  }

  return (
    <DatePicker
      name="DATEPICKER TEST"
      value={date}
      onChange={handleDate}
      openTo="day"
      minDate={new Date(2022, 0, 5)}
      maxDate={new Date(2025, 0, 15)}
      option={{
        weekday: "short",
        headerButton: "2-button",
        monthOption: { button: "long", calendar: "short" },
        actionButton: {
          apply: "Conferma",
          cancel: "Annulla",
          back: "Indietro",
        },
      }}
      inputProps={{
        dateSeparator: "/",
        rangeSeparator: ">",
      }}
    />
  );
};
export default CtrlDatePicker;
