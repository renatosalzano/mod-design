import { FC, useState } from "react";
import { DatePicker } from "../mod-design/core";

type RangeDate = {
  start: Date | null;
  end: Date | null;
};
const CtrlDatePickerRange: FC = () => {
  const [dateRange, setDateRange] = useState<RangeDate>({
    start: null,
    end: null,
  });

  function handleDateRange(value: RangeDate) {
    console.log("CURRENT VALUE", value);
    setDateRange(value);
  }

  return (
    <DatePicker
      range="2-calendar"
      name="DATEPICKER RANGE TEST"
      value={dateRange}
      onChange={handleDateRange}
      minDate={new Date(2021, 0, 15)}
      maxDate={new Date(2029, 9, 15)}
      option={{
        weekday: "narrow",
        monthOption: { button: "long", calendar: "long" },
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
        reset: "Reset",
        mustBeLessThan: "deve essere minore di",
        mustBeGreaterThan: "deve essere maggiore di",
      }}
      inputProps={{
        dateSeparator: "/",
        rangeSeparator: "-",
        datePlaceholder: { dd: "gg", mm: "mm", yyyy: "aaaa" },
        readOnly: false,
      }}
    />
  );
};
export default CtrlDatePickerRange;
