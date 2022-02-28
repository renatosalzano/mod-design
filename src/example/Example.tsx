import { FC } from "react";
import { Button } from "../mod-design/core";
import CtrlDatePicker from "./CtrlDatePicker";
import CtrlDatePickerRange from "./CtrlDatePickerRange";
import "./SCSS/example.scss";

const Example: FC = () => {
  return (
    <div className="example">
      <h2>REACT MOD DESIGN </h2>
      <div className="date-margin">
        <CtrlDatePickerRange />
      </div>
      <CtrlDatePicker />

      <h2>BUTTONS</h2>
      <MatButtons />
    </div>
  );
};

export default Example;

const MatButtons = () => {
  return (
    <div className="mat-buttons">
      <span>matBasic</span>
      <Button matBasic onClick={() => null}>
        Basic
      </Button>
      <Button matBasic color="primary" onClick={() => null}>
        Primary
      </Button>
      <Button matBasic color="accent" onClick={() => null}>
        Accent
      </Button>
      <Button matBasic color="success" onClick={() => null}>
        Success
      </Button>
      <Button matBasic color="warn" onClick={() => null}>
        Warn
      </Button>
      <Button matBasic color="error" onClick={() => null}>
        Error
      </Button>
      <span>matFlat</span>
      <Button matFlat onClick={() => null}>
        Basic
      </Button>
      <Button matFlat color="primary" onClick={() => null}>
        Primary
      </Button>
      <Button matFlat color="accent" onClick={() => null}>
        Accent
      </Button>
      <Button matFlat color="success" onClick={() => null}>
        Success
      </Button>
      <Button matFlat color="warn" onClick={() => null}>
        Warn
      </Button>
      <Button matFlat color="error" onClick={() => null}>
        Error
      </Button>
      <span>matFlat raised</span>
      <Button matFlat raised onClick={() => null}>
        Basic
      </Button>
      <Button matFlat raised color="primary" onClick={() => null}>
        Primary
      </Button>
      <Button matFlat raised color="accent" onClick={() => null}>
        Accent
      </Button>
      <Button matFlat raised color="success" onClick={() => null}>
        Success
      </Button>
      <Button matFlat raised color="warn" onClick={() => null}>
        Warn
      </Button>
      <Button matFlat raised color="error" onClick={() => null}>
        Error
      </Button>
    </div>
  );
};
