import CtrlDatePicker from "./CtrlDatePicker";
import CtrlDatePickerJS from "./CtrlDatePickerJS";
import CtrlDatePickerRange from "./CtrlDatePickerRange";
import CtrlInputChips from "./CtrlInputChips";
import CtrlSelect from "./CtrlSelect";

const Form = () => {
  return (
    <div className="form-example">
      {/* <CtrlInputChips /> */}
      <input type="date" />
      {/*       <TextInput name="test" value={value} onChange={onChange} /> */}

      <CtrlDatePicker name="date" />
      <CtrlDatePickerRange name="range" />
      {/* <CtrlDatePickerJS /> */}
      {/* <CtrlSelect /> */}
    </div>
  );
};

export default Form;
