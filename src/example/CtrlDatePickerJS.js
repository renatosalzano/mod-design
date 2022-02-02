import { useEffect, useState } from "react";
import { DatePicker } from "../mod-design/core";

const CtrlDatePickerJS = () => {
  const [dateRange, setDateRange] = useState({
    min: null,
    max: null,
  });
  const [date, setDate] = useState(null);

  function handleDate(value) {
    setDate(value);
  }

  function handleDateRange(value) {
    setDateRange(value);
  }
  return (
    <DatePicker
      name={[1, 2, 3]}
      value={[1, 2, 3]}
      localization="looooooooool"
      onChange={handleDate}
      openTo="day"
      minDate={new Date()}
      disableFuture
      maxDate={new Date()}
      option={{ weekday: "short" }}
    />
  );
};
export default CtrlDatePickerJS;
