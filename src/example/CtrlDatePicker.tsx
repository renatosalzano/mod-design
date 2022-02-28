import { FC, useState } from "react";
import { DatePicker } from "../mod-design/core";

const CtrlDatePicker: FC = () => {
  const [date, setDate] = useState<Date | null>(new Date());

  function handleDate(value: Date | null) {
    console.log("DATE", value);
    setDate(value);
  }

  return (
    <DatePicker
      name="DATEPICKER TEST"
      value={date}
      onChange={handleDate}
      minDate={new Date(2024, 1, 8)}
      maxDate={new Date(2028, 0, 15)}
      dateFormat="D/M/Y"
      option={{
        weekday: "narrow",
        monthOption: { button: "short", calendar: "long" },
      }}
      localization={{
        locale: "LOL",
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
      actionButton
      inputProps={{
        dateSeparator: "/",
        rangeSeparator: ">",
        datePlaceholder: { dd: "gg", mm: "mm", yyyy: "aaaa" },
      }}
      disableAnimation
    />
  );
};
export default CtrlDatePicker;
