import { FC, useEffect, useRef, useState } from "react";
import { DatePicker } from "../mod-design/core";
import { useFakeForm } from "./useFakeForm";

interface Props {
  name: string;
}

type RangeDate = {
  start: Date | null;
  end: Date | null;
};
const CtrlDatePickerRange: FC<Props> = ({ name }) => {
  const [dateRange, setDateRange] = useState<RangeDate>({
    start: new Date(2030, 0, 31),
    end: new Date(2029, 1, 20),
  });

  function toString(value: RangeDate) {
    let str = "";
    value.start ? (str += ` min: ${value.start.toLocaleDateString()}`) : (str += " null");
    value.end ? (str += ` max: ${value.end.toLocaleDateString()}`) : (str += " null");
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
      minDate={new Date(2021, 0, 15)}
      maxDate={new Date(2023, 9, 15)}
      option={{
        weekday: "narrow",
        monthOption: { button: "long", calendar: "short" },
      }}
      helperText="sono un helper text"
      dateFormat="D/M/Y"
      localization={{
        locale: "it-IT",
        fristDayWeek: "monday",
        startDate: "data di inizio",
        endDate: "data di fine",
        selectDate: "Seleziona Data",
        today: "oggi",
        apply: "Conferma",
        cancel: "Annulla",
        fix: "Aggiusta",
        mustBeLessThan: "deve essere minore di",
        mustBeGreaterThan: "deve essere maggiore di",
      }}
      inputProps={{
        dateSeparator: "/",
        rangeSeparator: "-",
        datePlaceholder: { dd: "gg", mm: "mm", yyyy: "aaaa" },
      }}
    />
  );
};
export default CtrlDatePickerRange;
