import { FC, useEffect, useRef, useState } from "react";
import { DatePicker } from "../mod-design/core";

interface Props {
  name: string;
}

type RangeDate = {
  min: Date | null;
  max: Date | null;
};
const CtrlDatePickerRange: FC<Props> = ({ name }) => {
  const [dateRange, setDateRange] = useState<RangeDate>({
    min: new Date("2028, 0, 15"),
    max: null,
  });

  function toString(value: RangeDate) {
    let str = "";
    if (value.min) str += ` min: ${value.min.toLocaleDateString()}`;
    if (value.max) str += ` max: ${value.max.toLocaleDateString()}`;
    return str;
  }

  function handleDateRange(value: RangeDate) {
    console.log("CURRENT VALUE " + toString(value));
    setDateRange(value);
  }

  return (
    <DatePicker
      range="2-calendar"
      name="DATEPICKER RANGE TEST"
      value={dateRange}
      onChange={handleDateRange}
      openTo="day"
      minDate={new Date(2022, 1, 5)}
      maxDate={new Date(2025, 0, 15)}
      option={{
        weekday: "short",
        headerButton: "2-button",
        headerRange: {
          startDate: "data di inizio",
          endDate: "data di fine",
          selectDate: "Seleziona Data",
        },
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
export default CtrlDatePickerRange;
