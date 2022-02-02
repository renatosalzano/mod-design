import CtrlDatePicker from "./CtrlDatePicker";
import CtrlDatePickerJS from "./CtrlDatePickerJS";
import CtrlInputChips from "./CtrlInputChips";
import CtrlSelect from "./CtrlSelect";

const Form = () => {
  return (
    <div className="form-example">
      {/* <CtrlInputChips /> */}
      {/* <input type="date" /> */}
      {/*       <TextInput name="test" value={value} onChange={onChange} /> */}

      <CtrlDatePicker name="date" />
      {/* <CtrlDatePickerJS /> */}
      {/* <CtrlSelect /> */}
    </div>
  );
};

export default Form;
