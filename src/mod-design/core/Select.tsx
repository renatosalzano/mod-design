import { wrap } from "module";
import {
  ChangeEvent,
  Children,
  createContext,
  createElement,
  DetailedHTMLProps,
  Dispatch,
  FC,
  Fragment,
  HTMLAttributes,
  KeyboardEvent,
  memo,
  MutableRefObject,
  ReactElement,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CloseIcon, FilterIcon } from "../icons";
import FatFilterIcon from "../icon/FatFilterIcon";
import { useModuleCore } from "./hook/useModuleCore";
import { SetOption } from "./interfaces/select";
import { CoreProps, ModuleCore } from "./ModuleCore";
import "./SCSS/mod-core-select.scss";

type RE = ReactElement;
type KeyboardEvt = KeyboardEvent<HTMLInputElement>;
type FilterOption = "bar" | "floating" | "off" | undefined;
type FilterOpt = "bar" | "floating" | "off";

/* 
  -------------------------------------------------------------------------
  ----- MOD SELECT
  -------------------------------------------------------------------------
*/

interface Props extends CoreProps {
  name: string;
  value: any;
  options?: any[];
  multiple?: boolean;
  disableOptions?: any[];
  emptyOption?: string | boolean;
  noOptionLabel?: string;
  filterOption?: FilterOption;
  onChange: (value: any) => void;
  setOption: SetOption;
}

interface RenderData {
  input: string;
  chips: string[];
}

const Select: FC<Props> = ({
  name,
  value,
  options = [],
  multiple,
  disableOptions,
  emptyOption,
  noOptionLabel = "No Options",
  filterOption,
  focused,
  disabled,
  error,
  helperText,
  onChange,
  setOption,
}) => {
  const { internalError } = useHandleError(
    name,
    value,
    setOption,
    multiple,
    options,
  );
  const [filterOptionType, setFilterOption] = useState<FilterOpt>("off");
  const [renderData, setRenderData] = useState<RenderData>({
    input: "",
    chips: [],
  });

  const core = useSelectEngine({
    name,
    value: value,
    options: options,
    multiple,
    emptyOption,
    noOptionLabel,
    disableOptions,
    internalError: internalError,
    onChange,
    setOption,
    setRenderData,
  });

  const { isFocused, isDisabled } = useModuleCore({
    focused: core.dropdown || focused,
    disabled: disabled,
  });

  const updateFilterOption = useCallback(
    (options: any[]) => {
      console.log("exec");
      if (filterOption) {
        setFilterOption(filterOption);
      } else {
        switch (true) {
          case options.length > 48:
            setFilterOption("bar");
            break;
          case options.length > 24:
            setFilterOption("floating");
            break;
          default:
            setFilterOption("off");
            break;
        }
      }
    },
    [filterOption],
  );

  const handleTouch = useCallback(() => {
    if (filterOption) {
      if (filterOption === "floating") {
        setFilterOption("bar");
      } else {
        setFilterOption(filterOption);
      }
    } else {
      if (options.length > 48) {
        setFilterOption("bar");
      } else {
        setFilterOption("off");
      }
    }
  }, [filterOption, options.length]);

  useEffect(() => {
    updateFilterOption(options);
  }, [options, updateFilterOption]);

  return (
    <SelectCore {...core}>
      <ModuleCore
        focused={isFocused}
        disabled={isDisabled}
        error={error || internalError}
        helperText={internalError ? "INTERNAL ERROR" : helperText}
        cssCustom="mod-select"
        border>
        {/* <Chips /> */}
        <InputText name={name} value={renderData.input} onTouch={handleTouch} />
        <SelectList filterOption={filterOptionType} />
      </ModuleCore>
    </SelectCore>
  );
};

export default Select;

/* 
  -------------------------------------------------------------------------
  ----- SELECT ENGINE CORE
  -------------------------------------------------------------------------
*/

interface Index {
  chips: number[];
  prev: number;
  curr: number;
}
type IndexOption = {
  [key: number]: {
    focus: () => void;
    blur: () => void;
    select: (isSelect: boolean) => void;
    get: { label: string; value: any };
  };
};

type IndexChip = {
  [key: number]: { deleteChip: (value: string, index: number) => void };
};

type HandleOptionClick = (
  optionLabel: string,
  optionValue: any,
  optionIndex: number,
) => void;

interface SelectEngine {
  name: string;
  value: any;
  options: any[];
  disableOptions?: any[];
  emptyOption?: string | boolean;
  noOptionLabel: string;
  multiple?: boolean;
  internalError: boolean;
  onChange: (value: any) => void;
  setOption: SetOption;
  setRenderData: Dispatch<SetStateAction<RenderData>>;
}
interface SelectStore {
  multiple?: boolean;
  dropdown: boolean;
  optionList: RE[];
  index: Index;
  indexOption: IndexOption;
  indexChip: IndexChip;
  highlightValue: MutableRefObject<string>;
  modList: MutableRefObject<HTMLDivElement | null>;
  handleInputChange: (value: string) => void;
  handleKeydown: (event: KeyboardEvt) => void;
  handleInputClick: () => void;
  handleOptionClick: HandleOptionClick;
  handleTriggerClick: () => void;
}
type UseSelectEngine = (arg: SelectEngine) => SelectStore;

const useSelectEngine: UseSelectEngine = ({
  name,
  value,
  options,
  disableOptions,
  emptyOption,
  noOptionLabel,
  multiple,
  internalError,
  onChange,
  setOption,
  setRenderData,
}) => {
  /* ----- RENDER DATA ------------------------------- */
  const [dropdown, setDropdown] = useState(false);
  const [optionList, setOptionList] = useState<RE[]>([]);
  const renderData = useRef({ input: "", chips: [] as string[] }).current;
  const highlightValue = useRef("");
  const modList = useRef<HTMLDivElement>(null);
  /* ----- VALUE DATA -------------------------------- */
  const valueData = useRef<any>(value);
  /* ----- INDEX DATA -------------------------------- */
  const index = useRef<Index>({ chips: [0], prev: 0, curr: 0 }).current;
  const indexOption = useRef<IndexOption>({}).current;
  const indexChip = useRef<IndexChip>({}).current;
  const indexRange = useRef({ min: 1, max: 0 }).current;

  const errorMess = {
    label: (label: any, fn: string) =>
      `    label: [[${fn}]] return ${label} instead of a STRING \n`,
    value: (fn: string) => `    value: [[${fn}]] return undefined`,
  };

  const getOption = useRef((option: any) => {
    const { label, value } = setOption(option);
    return { label, value };
  }).current;

  const setDefaultValue = () => {
    if (multiple) {
      return [] as any[];
    } else {
      if (typeof value === "string") {
        return "";
      } else {
        return null;
      }
    }
  };
  const setIndex = useCallback(
    (i: number) => {
      if (index.curr !== i) index.curr = i;
    },
    [index],
  );

  const testIndex = useCallback(
    (index: number) => {
      const { min, max } = indexRange;
      switch (true) {
        case index < min:
          return max;
        case index > max:
          return min;
        default:
          return index;
      }
    },
    [indexRange],
  );

  const focusOption = useRef((index: number, currentIndex: number) => {
    indexOption[index].blur();
    indexOption[currentIndex].focus();
    setIndex(currentIndex);
  });
  /* 
  -------------------------------------------------------------------------
  ----- HANDLER
  -------------------------------------------------------------------------
  */

  const handleInputClick = useCallback(() => {
    if (internalError) return;
    setDropdown(true);
  }, [internalError]);

  const handleInputChange = useCallback(
    (inputValue: string) => {
      if (inputValue) {
        const filteredOptions = options.filter((option) => {
          const { label } = getOption(option);
          const regExp = new RegExp(inputValue, "i");
          return regExp.test(label);
        });
        highlightValue.current = inputValue;
        index.prev = 1;
        index.curr = 1;
        update.current(filteredOptions, false);
      } else {
        indexOption[index.curr].blur();
        highlightValue.current = "";
        update.current(options);
      }
    },
    [getOption, index, indexOption, options],
  );

  const handleOptionClick = useCallback(
    (optionLabel: string, optionValue: any, optionIndex: number) => {
      if (multiple) {
      } else {
        index.prev = optionIndex;
        index.curr = optionIndex;
        onChange(optionValue);
        setRenderData((rest) => ({ ...rest, input: optionLabel }));
        setDropdown(false);
      }
    },
    [index, multiple, onChange, setRenderData],
  );

  const handleKeydown = useCallback(
    (event: KeyboardEvt) => {
      let currentIndex = 0;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          currentIndex = testIndex(index.curr + 1);
          console.log(currentIndex);
          focusOption.current(index.curr, currentIndex);
          break;
        case "ArrowUp":
          event.preventDefault();
          currentIndex = testIndex(index.curr - 1);
          focusOption.current(index.curr, currentIndex);
          break;
        case "Enter":
          event.preventDefault();
          currentIndex = index.curr;
          const { label, value } = indexOption[currentIndex].get;
          handleOptionClick(label, value, currentIndex);
          break;
        case "Escape":
          setDropdown(false);
          event.preventDefault();
          break;
      }
    },
    [handleOptionClick, index.curr, indexOption, testIndex],
  );

  const handleTriggerClick = useCallback(() => {
    setDropdown(false);
  }, []);

  /* 
  -------------------------------------------------------------------------
  ----- UPDATE OPTIONS
  -------------------------------------------------------------------------
  */

  function setEmptyValue() {
    if (typeof value === "string") return "";
    return null;
  }
  const checkValue = (
    optionLabel: string,
    optionValue: any,
    optionIndex: number,
    validValue: any[],
  ) => {
    if (multiple && Array.isArray(valueData.current)) {
      if (valueData.current.length === 0) return;
      if (arrayIncludes(valueData.current, optionValue)) {
        validValue.push(optionValue);
        index.chips.push(optionIndex);
        renderData.chips.push(optionLabel);
      }
    } else {
      if (valueData.current) {
        if (isEqual(valueData.current, optionValue)) {
          validValue.push(optionValue);
          index.prev = optionIndex;
          index.curr = optionIndex;
          renderData.input = optionLabel;
        }
      } else return;
    }
  };

  const handleCheckedValue = (validValue: any[]) => {
    let error = false;
    if (multiple && Array.isArray(valueData.current)) {
      if (valueData.current.length > 0 && validValue.length !== 0) {
        const invalidValue = arrayIntersect(valueData.current, validValue);
        console.log(invalidValue);
      } else {
        /* HANDLE ERROR */
        error = true;
        const invalidValue = arrayIntersect(value, validValue);
      }
    } else {
      if (valueData.current && validValue.length !== 0) {
        /* HANDLE VALID */
        setRenderData((rest) => ({ ...rest, input: renderData.input }));
      } else {
        /* HANDLE ERROR */
        error = true;
        onChange(setDefaultValue());
      }
    }
    if (error) {
      console.warn("ERROR VALUE");
    }
  };
  const newOption = (label: string, value: any, index: number) => {
    return (
      <Option key={label + index} label={label} value={value} index={index} />
    );
  };
  const update = useRef((options: any[], check = true) => {
    const optionEle: RE[] = [];
    const validValue: any[] = [];
    if (internalError) return;
    if (emptyOption && !multiple) {
      indexRange.min = 0;
      let emptyLabel = " ";
      if (typeof emptyOption === "string") {
        emptyLabel = emptyOption;
      }
      optionEle.push(newOption(emptyLabel, setEmptyValue(), 0));
    }
    if (options.length === 0) {
      /* EMPTY OPTIONS */
      onChange(setDefaultValue());
    } else {
      /* OPTIONS PROVIDED */
      let indexOption = 1;
      options.forEach((option) => {
        const { label, value } = getOption(option);
        if (disableOptions && arrayIncludes(disableOptions, value)) {
          optionEle.push(<DisabledOption label={label} />);
        } else {
          check && checkValue(label, value, indexOption, validValue);
          optionEle.push(newOption(label, value, indexOption));
          ++indexOption;
        }
      });
      check && handleCheckedValue(validValue);
      indexRange.max = --indexOption;
      setOptionList(optionEle);
    }
  });
  useEffect(() => {
    update.current(options);
  }, [options]);
  return {
    multiple,
    dropdown,
    optionList,
    index,
    indexOption,
    indexChip,
    highlightValue,
    modList,
    handleInputChange,
    handleKeydown,
    handleInputClick,
    handleOptionClick,
    handleTriggerClick,
  };
};

/* 
  -------------------------------------------------------------------------
  ----- SELECT CONTEXT
  -------------------------------------------------------------------------
*/

const SelectContext = createContext<SelectStore>({} as SelectStore);
const useSelectCore = () => useContext(SelectContext);
const SelectCore: FC<SelectStore> = (props) => {
  function omit(props: any) {
    const providerProps = { ...props };
    delete providerProps.children;
    return providerProps;
  }
  return createElement(
    SelectContext.Provider,
    { value: omit(props) },
    props.children,
  );
};

/* 
  -------------------------------------------------------------------------
  ----- SELECT INPUT
  -------------------------------------------------------------------------
*/
interface InputProps {
  name: string;
  value?: string;
  disabled?: boolean;
  endIcon?: RE;
  onTouch: () => void;
}
const InputText: FC<InputProps> = ({
  name,
  value = "",
  disabled,
  endIcon,
  onTouch,
}) => {
  const { dropdown, handleInputClick, handleKeydown } = useSelectCore();
  const handleClick = () => {
    if (disabled) return;
    handleInputClick();
  };
  const handleKeyDown = (event: KeyboardEvt) => {
    if (disabled) return;
    handleKeydown(event);
  };

  const handleArrowClass = () => {
    let className = "mod-select-arrow";
    if (dropdown) className += " flip-arrow";
    return className;
  };

  return (
    <div className="mod-input-wrap">
      <input
        type="text"
        name={name}
        value={value}
        className="mod-input-text"
        onClick={handleClick}
        onTouchStart={onTouch}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        readOnly
      />
      <div className="mod-inset-icon">
        <svg
          viewBox="0 0 10 5"
          height="6px"
          width="12px"
          focusable="false"
          className={handleArrowClass()}>
          <polygon fill="currentColor" points="0,0 5,5 10,0"></polygon>
        </svg>
      </div>
    </div>
  );
};
interface InputFilterProps {
  filterOption: "bar" | "floating";
}

const InputFilter: FC<InputFilterProps> = ({ filterOption }) => {
  const inputRef = useRef<any>(null);
  const { handleInputChange, handleKeydown } = useSelectCore();
  const [stateValue, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetValue = event.target.value;
    setValue(targetValue);
    handleInputChange(targetValue);
  };
  function setClassName() {
    switch (filterOption) {
      case "bar":
        return "mod-input-filter";
      case "floating":
        let className = "mod-inset-filter";
        if (stateValue) className += " mod-floating";
        return className;
    }
  }
  function keepFocus() {
    console.log("you cant unfocus me");
    inputRef.current!.focus();
  }

  const deleteValue = useRef(() => {
    if (filterOption === "floating") {
      handleInputChange("");
      setValue("");
    }
  }).current;

  useEffect(() => {
    return () => {
      deleteValue();
    };
  }, [deleteValue]);

  return (
    <div className={setClassName()} onClick={deleteValue}>
      <FilterIcon />
      <input
        ref={inputRef}
        type="text"
        name="mod-input-filter"
        value={stateValue}
        className="mod-input"
        onChange={handleChange}
        onKeyDown={handleKeydown}
        placeholder="Filter..."
        onBlur={keepFocus}
        autoComplete="off"
        autoFocus
      />
      {filterOption === "floating" && <FloatingText value={stateValue} />}
    </div>
  );
};
interface FloatingTextProps {
  value: string;
}
const FloatingText: FC<FloatingTextProps> = ({ value }) => {
  return (
    <span className="mod-floating-text">
      {value}
      <span className="mod-floating-icon">
        <FatFilterIcon />
        <CloseIcon />
      </span>
    </span>
  );
};

/* 
  -------------------------------------------------------------------------
  ----- SELECT LIST
  -------------------------------------------------------------------------
*/

interface ListProps {
  filterOption: "bar" | "floating" | "off";
}

const SelectList: FC<ListProps> = ({ filterOption }) => {
  const { dropdown, optionList, modList, handleTriggerClick } = useSelectCore();
  return (
    <div className="mod-drop-down-container">
      {dropdown && (
        <ul className="mod-list">
          {filterOption !== "off" && (
            <InputFilter filterOption={filterOption} />
          )}
          <div className="mod-scroll-containter" ref={modList}>
            {optionList}
          </div>
        </ul>
      )}
      {dropdown && <div className="mod-trigger" onClick={handleTriggerClick} />}
    </div>
  );
};

/* 
  -------------------------------------------------------------------------
  ----- OPTION
  -------------------------------------------------------------------------
*/

interface OptionProps {
  label: string;
  value: any;
  index: number;
}

const Option: FC<OptionProps> = ({ label, value, index }) => {
  const {
    multiple,
    index: { prev, chips },
    indexOption,
    modList,
    handleOptionClick,
  } = useSelectCore();
  const [active, setActive] = useState(() => prev === index);
  const [selected, setSelected] = useState(initSelected);
  function initSelected() {
    if (multiple) {
      return chips.includes(index);
    } else {
      return false;
    }
  }
  const handleClick = () => {
    handleOptionClick(label, value, index);
  };

  const ref = useRef<HTMLLIElement>(null);

  function handleOverflow() {
    const ul = modList.current!;
    const li = ref.current!;
    const top = li.offsetTop;
    const bottom = li.offsetTop + li.clientHeight;
    const ulTop = ul.scrollTop;
    const ulBottom = ul.clientHeight + ul.scrollTop;
    switch (true) {
      case bottom === ul.scrollHeight:
        ul.scroll({ top: ul.scrollHeight });
        break;
      case top === 0:
        ul.scroll({ top: 0 });
        break;
      case top < ulTop:
        ul.scroll({ top: top });
        break;
      case bottom > ulBottom:
        ul.scroll({ top: bottom - ul.clientHeight });
        break;
    }
  }

  const subscribe = useRef(() => {
    indexOption[index] = {
      focus: () => {
        handleOverflow();
        setActive(true);
      },
      blur: () => setActive(false),
      select: (isSelect: boolean) => setSelected(isSelect),
      get: { label, value },
    };
  });

  const unsbuscribe = useCallback(() => {
    delete indexOption[index];
  }, [index, indexOption]);

  useEffect(() => {
    subscribe.current();
    return () => {
      unsbuscribe();
    };
  }, [unsbuscribe]);

  return (
    <OptionWrap
      optionRef={ref}
      active={active}
      selected={selected}
      onClick={handleClick}>
      <OptionLabel label={label} />
    </OptionWrap>
  );
};

interface OptionWrapProps {
  optionRef: MutableRefObject<HTMLLIElement | null>;
  active: boolean;
  selected: boolean;
  onClick: () => void;
}
const OptionWrap: FC<OptionWrapProps> = ({
  optionRef,
  active,
  selected,
  onClick,
  children,
}) => {
  function setOptionClass() {
    let className = "mod-option";
    if (active) className += " mod-active";
    if (selected) className += " mod-selected";
    return className;
  }
  return (
    <li ref={optionRef} className={setOptionClass()} onClick={onClick}>
      {children}
      {selected && <div className="mod-option-bg" />}
    </li>
  );
};

interface OptionLabelProps {
  label: string;
}

const OptionLabel: FC<OptionLabelProps> = memo(({ label }) => {
  const { highlightValue } = useSelectCore();
  function renderLabel() {
    if (highlightValue.current) {
      const regExp = new RegExp(highlightValue.current, "i");
      return label.replace(regExp, (mark) => {
        return `<mark>${mark}</mark>`;
      });
    }
    return label;
  }
  return (
    <div
      className="mod-option-label"
      dangerouslySetInnerHTML={{ __html: renderLabel() }}
    />
  );
});

interface DisabledOptionProps {
  label: string;
}
const DisabledOption: FC<DisabledOptionProps> = ({ label }) => {
  return <li className="mod-option disabled">{label}</li>;
};

/* 
  -------------------------------------------------------------------------
  ----- TEST FUNCTION
  -------------------------------------------------------------------------
*/

function isEqual(x: any, y: any) {
  const typeX = typeof x;
  const typeY = typeof y;
  if (typeX !== typeY) return false;
  if (typeX === "object") {
    if (Array.isArray(x)) {
      return isEqualArray(x, y);
    }
    return JSON.stringify(x) === JSON.stringify(y);
  } else {
    return x === y;
  }
}

function isEqualArray(x: any[], y: any[]) {
  const lenghtX = x.length;
  const lenghtY = y.length;
  if (lenghtX !== lenghtY) return false;
  const X = { frist: x[0], last: x[x.length] };
  const Y = { frist: y[0], last: y[y.length] };
  const testX = isEqual(X.frist, Y.frist) as boolean;
  const testY = isEqual(X.last, Y.last) as boolean;
  return testX && testY;
}

function arrayIntersect(x: any[], y: any[]) {
  const filtered = x.filter((xValue) => arrayIncludes(y, xValue));
  return filtered;
}

function arrayIncludes(x: any[], y: any) {
  let included = false;
  x.forEach((value) => {
    if (isEqual(value, y)) {
      included = true;
    }
  });
  return included;
}

/* 
  -------------------------------------------------------------------------
  ----- HANDLE ERROR
  -------------------------------------------------------------------------
*/

const useHandleError = (
  name: string,
  value: any,
  setOption: SetOption,
  multiple?: boolean,
  options?: any[],
) => {
  const [internalError, setError] = useState(false);
  function headMessage(error: string = "INVALID PROPS") {
    return `\n\tERROR TYPE: ${error}\n\tINPUT NAME: ${name}\n`;
  }

  const inputName = `\n\tINPUT NAME: ${name}\n`;

  const setOptionErr = {
    label: (type: string, body: string) => {
      return `\t\tlabel: [[${body}]] return ${type.toUpperCase()} instead of a STRING \n`;
    },
    value: (body: string) => {
      return `\t\tvalue: [[${body}]] return UNDEFINED `;
    },
  };

  const testProps = useRef((options?: any[], multiple?: boolean) => {
    try {
      let error = "";

      if (multiple && !Array.isArray(value)) {
        const valueType = typeof value;
        error += `\tERROR: <Select multiple value={ is ${valueType.toUpperCase()} instead of ARRAY } />\n`;
      }
      if (options && options.length > 0) {
        let _error = "";
        const fn = setOption.toString();
        const { label, value } = setOption(options[0]);
        const labelType = typeof label;
        if (labelType !== "string") {
          const labelBody = fn
            .substring(fn.indexOf(":") + 1, fn.indexOf(","))
            .trim();
          _error += setOptionErr.label(labelType, labelBody);
        }
        if (value === undefined) {
          const valueBody = fn
            .substring(fn.lastIndexOf(":") + 1, fn.lastIndexOf("}"))
            .trim();
          _error += setOptionErr.value(valueBody);
        }
        if (_error) {
          _error =
            "\tERROR: <Select setOption={(option) => {\n" + _error + "}} />\n";
          error += _error;
        }
      }
      if (error) {
        throw new Error(inputName + error);
      }
    } catch (err) {
      setError(true);
      console.error(err);
    }
  });
  useEffect(() => {
    testProps.current(options, multiple);
  }, [options, multiple]);

  return { internalError };
};
