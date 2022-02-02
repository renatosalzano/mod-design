import {
  ChangeEvent,
  createContext,
  createElement,
  Dispatch,
  FC,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useModuleCore } from "../hook/useModuleCore";
import "../SCSS/mod-core-select.scss";
import TextInput from "./TextInput";
import InputChips from "./InputChips";
import { CoreProps } from "./ModuleCore";
import {
  HandleOptionClick,
  IndexChip,
  IndexOption,
  IndexValue,
  RE,
  RenderData,
  SetOption,
  UseSelectCore,
} from "../interfaces/select";

interface Props extends CoreProps {
  value: any;
  name: string;
  options?: any[];
  emptyOptionLabel?: string;
  noOptionLabel?: string;
  disabledValues?: any[];
  border?: boolean;
  disabled?: boolean;
  focused?: boolean;
  multiple?: boolean;
  onChange: (value: any) => any;
  setOption: SetOption;
}

/* 
  -------------------------------------------------------------------------
  ----- MOD SELECT
  -------------------------------------------------------------------------
*/

const Select: FC<Props> = ({
  name,
  value,
  options,
  emptyOptionLabel,
  noOptionLabel,
  disabled,
  focused,
  disabledValues,
  border = true,
  cssCustom,
  multiple,
  setOption = (option) => ({ label: option.name, value: option.value }),
  onChange,
}) => {
  const handleChange = useCallback(onChange, [onChange]);
  const [renderChips, setRenderChips] = useState<string[]>([]);
  const {
    list,
    listRef,
    renderLabel,
    optionList,
    indexPrev,
    indexMultiple,
    indexOption,
    handleKeyboard,
    handleOptionClick,
    handleChipClick,
    setList,
  } = useSelectCore({
    value: value,
    options: options,
    disabledValues,
    emptyOptionLabel,
    noOptionLabel,
    multiple,
    setOption,
    setRenderChips,
    onChange: handleChange,
  });
  /* 
  ----- CORE DATA --------------------------------
  */
  const { isFocused, isDisabled } = useModuleCore({
    focused: list || focused,
    disabled: disabled,
  });

  function setCssCustom() {
    let className = multiple ? "mod-select mod-multiple" : "mod-select";
    if (cssCustom) className += ` ${cssCustom}`;
    return className;
  }

  const inputProps = {
    name,
    focused: isFocused,
    disabled: isDisabled,
    readOnly: true,
    cssCustom: setCssCustom(),
    onClick: () => setList(true),
    onKeydown: handleKeyboard,
  };

  function renderSelect() {
    if (multiple) {
      return (
        <InputChips
          {...inputProps}
          value={renderChips}
          onChipClick={handleChipClick}
          inputIcon={<Arrow list={list} />}
          override
          wrapper>
          {SelectDropDown}
        </InputChips>
      );
    } else {
      return (
        <TextInput {...inputProps} value={renderLabel} wrapper>
          {SelectDropDown}
        </TextInput>
      );
    }
  }

  const SelectDropDown: RE = (
    <SelectProvider
      multiple={multiple}
      listRef={listRef}
      indexPrev={indexPrev}
      indexMultiple={indexMultiple}
      indexOption={indexOption}
      setList={setList}
      handleOptionClick={handleOptionClick}>
      <ModSelect list={list} optionList={optionList} />
    </SelectProvider>
  );

  return renderSelect();
};

export default Select;
interface ArrowProps {
  list: boolean;
}
const Arrow: FC<ArrowProps> = ({ list }) => {
  function setArrowClass(list: boolean = false) {
    let className = "mod-select-arrow";
    if (list) className += " flip-arrow";
    return className;
  }
  return (
    <svg viewBox="0 0 10 5" focusable="false" className={setArrowClass(list)}>
      <polygon fill="currentColor" points="0,0 5,5 10,0"></polygon>
    </svg>
  );
};

/* 
  -------------------------------------------------------------------------
  ----- SELECT CORE
  -------------------------------------------------------------------------
*/

const useSelectCore: UseSelectCore = ({
  value,
  options = [],
  emptyOptionLabel,
  noOptionLabel,
  disabledValues,
  multiple = false,
  setOption,
  setRenderChips,
  onChange,
}) => {
  /* 
  ----- RENDER DATA --------------------------------
  */
  const [list, setList] = useState(false);
  const [renderLabel, setRenderLabel] = useState("");
  const renderData = useRef<RenderData>({ select: "", multiple: [] }).current;
  const listRef = useRef<HTMLUListElement>(null);
  /* 
  ----- VALUE DATA --------------------------------
  */
  const [optionList, setOptions] = useState<RE[]>([]);
  const optionLabels = useRef<string[]>([]);
  const optionValues = useRef<any[]>([]);
  const propValue = useRef<any | null>(value);
  /* 
  ----- INDEX DATA --------------------------------
  */
  const index = useRef({ prev: 0, next: 0 }).current;
  const indexValue = useRef<IndexValue>({ valid: [], invalid: [] }).current;
  const indexMultiple = useRef<number[]>([]).current;
  const indexOption = useRef<IndexOption>({}).current;
  const indexChip = useRef<IndexChip>({}).current;
  const indexMax = useRef(0);
  const setIndex = useCallback(
    (i: number) => {
      if (index.next !== i) index.next = i;
    },
    [index],
  );

  const testIndex = useCallback((index: number) => {
    switch (true) {
      case index < 0:
        return indexMax.current;
      case index > indexMax.current:
        return 0;
      default:
        return index;
    }
  }, []);

  /* 
  -------------------------------------------------------------------------
  ----- HANDLE ON CHANGE
  -------------------------------------------------------------------------
  */

  const handleChipClick = useCallback(
    (_value: string, index: number) => {
      indexMultiple.splice(index, 1);
      renderData.multiple.splice(index, 1);
      value.splice(index, 1);
      setRenderChips([...renderData.multiple]);
      onChange(value);
    },
    [indexMultiple, onChange, renderData.multiple, setRenderChips, value],
  );

  const handleOptionClick = useCallback(
    (optionLabel: string, optionValue: any, optionIndex: number) => {
      if (multiple) {
        if (indexMultiple.includes(optionIndex)) {
          /* UNSELECT OPTION */
          const indexData = renderData.multiple.indexOf(optionLabel);
          indexOption[optionIndex].unselect();
          indexMultiple.splice(indexData, 1);
          renderData.multiple.splice(indexData, 1);
          value.splice(indexData, 1);
          setRenderChips([...renderData.multiple]);
          onChange(value);
        } else {
          /* SELECT OPTION */
          indexMultiple.push(optionIndex);
          indexOption[optionIndex].select();
          renderData.multiple.push(optionLabel);
          value.push(optionValue);
          setRenderChips([...renderData.multiple]);
          onChange(value);
        }
      } else {
        onChange(optionValue);
        setRenderLabel(optionLabel);
        index.prev = optionIndex;
        setList(false);
      }
    },
    [
      index,
      indexMultiple,
      indexOption,
      multiple,
      onChange,
      setRenderChips,
      renderData.multiple,
      value,
    ],
  );

  /* 
  -------------------------------------------------------------------------
  ----- HANDLE KEYBOARD
  -------------------------------------------------------------------------
  */

  const focusOption = useRef((index: number, currentIndex: number) => {
    indexOption[index].blur();
    indexOption[currentIndex].focus();
    setIndex(currentIndex);
  });

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      let currentIndex = 0;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          currentIndex = testIndex(index.next + 1);
          focusOption.current(index.next, currentIndex);
          break;
        case "ArrowUp":
          event.preventDefault();
          currentIndex = testIndex(index.next - 1);
          focusOption.current(index.next, currentIndex);
          break;
        case "Enter":
          event.preventDefault();
          currentIndex = index.next;
          const label = optionLabels.current[currentIndex];
          const value = optionValues.current[currentIndex];
          handleOptionClick(label, value, currentIndex);

          break;
        case "Escape":
          setList(false);
          event.preventDefault();
          break;
      }
    },
    [handleOptionClick, index.next, testIndex],
  );

  /* 
  -------------------------------------------------------------------------
  ----- INIT / UPDATE SELECT LIST
  -------------------------------------------------------------------------
  */

  const newOption = (label: string, value: any, index: number) => {
    return (
      <Option key={label + index} label={label} value={value} index={index} />
    );
  };

  const checkValue = (
    currentValue: any,
    optionValue: any,
    optionLabel: string,
    indexOption: number,
  ) => {
    if (multiple && Array.isArray(currentValue)) {
      if (currentValue.length === 0) return;
      /* SELECT MULTIPLE */
      if (arrayIncludes(currentValue, optionValue)) {
        indexMultiple.push(indexOption);
        indexValue.valid.push(optionValue);
        renderData.multiple.push(optionLabel);
      } else {
        indexValue.invalid.push(optionValue);
      }
    } else {
      /* SELECT PLAIN */
      if (currentValue && isEqualValue(currentValue, optionValue)) {
        indexValue.valid.push(optionValue);
        index.prev = indexOption;
        index.next = indexOption;
        renderData.select = optionLabel;
      } else return;
    }
  };

  const checkIfValidValue = () => {
    if (indexValue.valid.length > 0) {
      /* VALID VALUE */
      if (multiple) {
        propValue.current = indexValue.valid;
        /* indexMultiple.forEach((i) => ) */
        onChange(indexValue.valid);
        setRenderChips(renderData.multiple);
      } else {
        propValue.current = indexValue.valid[0];
        onChange(indexValue.valid[0]);
        setRenderLabel(renderData.select);
      }
    } else {
      /* INVALID VALUE */
      console.warn("WARNING");
      if (multiple) {
        propValue.current = [];
        onChange([]);
      } else {
        propValue.current = null;
        onChange(null);
      }
    }
  };

  const updateList = useRef((options: any[]) => {
    console.log("list refresh");
    const output: RE[] = [];
    const labels: string[] = [];
    const values: any[] = [];
    let indexOption = 0;
    if (emptyOptionLabel && !multiple) {
      labels.push(emptyOptionLabel);
      values.push(null);
      output.push(newOption(emptyOptionLabel, null, indexOption));
      ++indexOption;
    }
    if (options.length === 0) {
      /* NO OPTION */
      onChange(null);
      output.push(<NoOption label={noOptionLabel} />);
    } else {
      /* OPTION PROVIDED
          START LOOP */
      options.forEach((option) => {
        const { value, label } = setOption(option);
        if (disabledValues && arrayIncludes(disabledValues, value)) {
          output.push(<DisabledOption label={testLabel(label)} />);
        } else {
          /* TEST IF  */
          checkValue(propValue.current, value, label, indexOption);
          labels.push(label);
          values.push(value);
          output.push(newOption(label, value, indexOption));
          ++indexOption;
        }
      });
      /* END LOOP */
      propValue.current && checkIfValidValue();
    }
    /* console.log(`${end - start}ms`); */
    optionLabels.current = labels;
    optionValues.current = values;
    indexMax.current = --indexOption;
    setOptions(output);
  });
  useEffect(() => {
    updateList.current(options);
  }, [options]);

  /* 
  ----- END SELECT CORE --------------------------
  ------------------------------------------------
  */
  return {
    list,
    optionList,
    indexPrev: index.prev,
    indexMultiple,
    indexOption,
    indexChip,
    renderLabel,
    listRef,
    setList,
    handleOptionClick,
    handleKeyboard,
    handleChipClick,
  };
};

interface ContextProps {
  multiple?: boolean;
  listRef: MutableRefObject<HTMLUListElement | null>;
  indexOption: IndexOption;
  indexPrev: number;
  indexMultiple: number[];
  setList: Dispatch<SetStateAction<boolean>>;
  handleOptionClick: HandleOptionClick;
}

const SelectContext = createContext<ContextProps>({} as ContextProps);
const useSelectContext = () => useContext(SelectContext);
const SelectProvider: FC<ContextProps> = ({
  multiple,
  listRef,
  indexPrev,
  indexMultiple,
  indexOption,
  setList,
  handleOptionClick,
  children,
}) => {
  return createElement(
    SelectContext.Provider,
    {
      value: {
        multiple,
        listRef,
        indexOption,
        indexPrev,
        indexMultiple,
        setList,
        handleOptionClick,
      },
    },
    children,
  );
};

interface ModSelectProps {
  list: boolean;
  optionList: any[];
}
const ModSelect: FC<ModSelectProps> = ({ list, optionList }) => {
  return (
    <div className="mod-drop-down-container">
      {list && <SelectList optionList={optionList} />}
    </div>
  );
};

/* 
  -------------------------------------------------------------------------
  ----- SELECT LIST
  -------------------------------------------------------------------------
*/

interface SelectListProps {
  optionList: RE[];
}
const SelectList: FC<SelectListProps> = ({ optionList = [] }) => {
  const { setList, listRef } = useSelectContext();
  return (
    <Fragment>
      <ul ref={listRef} className="mod-list">
        {optionList}
      </ul>
      <div className="mod-trigger" onClick={() => setList(false)} />
    </Fragment>
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
    listRef,
    multiple,
    indexMultiple,
    indexPrev,
    indexOption,
    handleOptionClick,
  } = useSelectContext();
  const ref = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(indexPrev === index);
  const [selected, setSelected] = useState(initSelectState);

  function initSelectState() {
    if (multiple) {
      return indexMultiple.includes(index);
    } else {
      return false;
    }
  }

  function handleClick() {
    handleOptionClick(label, value, index);
  }

  function handleOverflow() {
    const ul = listRef.current!;
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
        console.log(ul.clientHeight);
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
      select: () => setSelected(true),
      unselect: () => setSelected(false),
    };
  });
  const unsbuscribe = useCallback(() => {
    delete indexOption[index];
  }, [index, indexOption]);

  function setClassName() {
    let className = "mod-option";
    if (active) className += " mod-active";
    if (selected) className += " mod-selected";
    return className;
  }

  useEffect(() => {
    subscribe.current();
    return () => {
      unsbuscribe();
    };
  }, [unsbuscribe]);

  return (
    <li ref={ref} className={setClassName()} onClick={handleClick}>
      {selected && <div className="mod-option-bg" />}
      <span className="mod-option-label">{label}</span>
    </li>
  );
};

interface DisabledOptionProps {
  label?: string;
}

const DisabledOption: FC<DisabledOptionProps> = ({ label }) => {
  return <li className="mod-option disabled">{label}</li>;
};

const NoOption: FC<DisabledOptionProps> = ({ label = "No Option" }) => {
  return <li className="mod-option disabled">{label}</li>;
};

/* 
  -------------------------------------------------------------------------
  ----- CHIPS
  -------------------------------------------------------------------------
*/

interface ChipProps {
  value: string;
  index: number;
}

/* const Chip: FC<ChipProps> = ({ value, index }) => {
  const [active, setActive] = useState(false);
  const { indexChip, handleChip } = useSelectContext();

  const handleClick = () => handleChip(value, index);
  const subscribe = useRef(() => {
    indexChip[index] = {
      focus: () => setActive(true),
      blur: () => setActive(false),
    };
  });
  const unsubscribe = useCallback(() => {
    delete indexChip[index];
  }, [index, indexChip]);

  useEffect(() => {
    subscribe.current();
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return (
    <div className={setChipClass(active)} onClick={handleClick}>
      {value}
    </div>
  );
}; */

function setChipClass(active: boolean = false) {
  let className = "mod-chip";
  if (active) className += " mod-active";
  return className;
}

/* 
  -------------------------------------------------------------------------
  ----- TEST FUNCTION
  -------------------------------------------------------------------------
*/

function isEqualValue(x: any, y: any): boolean {
  const typeX = typeof x;
  const typeY = typeof y;
  if (typeX !== typeY) return false;
  switch (typeX) {
    case "object":
      if (Array.isArray(x)) {
        return isEqualArray(x, y);
      } else {
        return isEqualObject(x, y);
      }
    default:
      return x === y;
  }
}

function isEqualArray(x: any[], y: any[]) {
  const lenghtX = x.length;
  const lenghtY = y.length;
  if (lenghtX !== lenghtY) return false;
  const X = { frist: x[0], last: x[x.length] };
  const Y = { frist: y[0], last: y[y.length] };
  const testX = isEqualValue(X.frist, Y.frist);
  const testY = isEqualValue(X.last, Y.last);
  return testX && testY;
}

function isEqualObject(x: Object, y: Object) {
  const valuesX = Object.values(x);
  const valuesY = Object.values(y);
  if (valuesX.length !== valuesY.length) return false;
  return valuesX.every((value, index) => {
    if (isEqualValue(value, valuesY[index])) return true;
    else return false;
  });
}

function arrayIncludes(values: any[], value: any) {
  return values.every((val) => {
    if (isEqualValue(val, value)) return true;
    else return false;
  });
}

function testLabel(label: any) {
  const ERROR = "ERROR";
  switch (typeof label) {
    case "number":
      return label.toString();
    case "string":
      return label;
    case "object":
      if (Array.isArray(label)) {
        console.error("array detected");
        return ERROR;
      } else {
        console.error("object detected");
        return ERROR;
      }
    default:
      console.error("object detected");
      return ERROR;
  }
}
