import { useState } from "react";
import { InputChips } from "../mod-design/core";

const CtrlInputChips = () => {
  const [value, setValue] = useState<string[]>(["lorem", "ipsum", "react"]);
  function handleChange(value: string[]) {
    setValue(value);
  }
  return <InputChips name="testchips" value={value} onChange={handleChange} />;
};

export default CtrlInputChips;
