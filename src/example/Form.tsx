import { DateX } from "../mod-design/utils/DateX";
import CtrlDatePicker from "./CtrlDatePicker";
import CtrlDatePickerJS from "./CtrlDatePickerJS";
import CtrlDatePickerRange from "./CtrlDatePickerRange";
import CtrlInputChips from "./CtrlInputChips";
import CtrlSelect from "./CtrlSelect";

const minDate = new Date(2022, 1, 12);
const maxDate = new Date(2022, 1, 23);

const Form = () => {
  return (
    <div className="form-example">
      {/* <CtrlInputChips /> */}
      <input type="date" />
      {/*       <TextInput name="test" value={value} onChange={onChange} /> */}
      <span>WORK IN PROGRESS</span>
      <CtrlDatePicker name="date" />
      <CtrlDatePickerRange name="range" />
      {/* <CtrlDatePickerJS /> */}
      {/* <CtrlSelect /> */}
    </div>
  );
};

export default Form;
