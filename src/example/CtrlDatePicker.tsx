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
  const [dateRange, setDateRange] = useState<RangeDate>({
    min: new Date(2022, 0, 15),
    max: new Date(2024, 0, 28),
  });
  const [date, setDate] = useState<Date | null>(new Date(2022, 1, 1));

  function handleDate(value: Date | null) {
    setDate(value);
  }

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
      name="DATEPICKER"
      value={dateRange}
      onChange={handleDateRange}
      openTo="day"
      minDate={new Date(2022, 0, 5)}
      maxDate={new Date(2025, 0, 15)}
      option={{
        weekday: "short",
        headerButton: "2-button",
        headerRange: { startDate: "data di inizio", endDate: "data di fine" },
        monthOption: { button: "long", calendar: "long" },
        actionButton: {
          apply: "Conferma",
          cancel: "Annulla",
          back: "Indietro",
        },
      }}
    />
  );
};
export default CtrlDatePicker;
