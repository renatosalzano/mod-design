import {
  ChangeEvent,
  createContext,
  createElement,
  FC,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CoreProps, ModuleCore } from "../ModuleCore";
import "../SCSS/mod-core-input-chip.scss";
type ChangeEvt = ChangeEvent<HTMLInputElement>;
type MouseEvt = MouseEvent<HTMLInputElement>;
type KeyboardEvt = KeyboardEvent<HTMLInputElement>;
type DeleteChip = (label: string) => void;
type HandleChip = (value: string, index: number) => any;
type IndexChip = { [key: number]: { focus: () => void; blur: () => void } };
type FocusChip = (indexPrev: number | null, indexCurr: number) => void;

type Wrapper =
  | { wrapper?: never; children?: never; inputIcon?: never; override?: never }
  | {
      /**
       * @param {boolean=} wrapper
       *
       * For development purposes only.
       *
       **/
      wrapper: true;
      children: ReactElement | ReactElement[];
      inputIcon: ReactElement;
      override: true;
    };

interface InputChipsProps extends CoreProps {
  name: string;
  value: string[];
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (value: string[]) => any;
  onClick?: (event?: MouseEvent) => any;
  onKeydown?: (event: KeyboardEvt) => any;
  onChipClick?: HandleChip;
}

type Props = InputChipsProps & Wrapper;

const InputChips: FC<Props> = ({
  name,
  value,
  disabled = false,
  readOnly = false,
  placeholder = "Enter keyword...",
  cssCustom,
  inputIcon,
  override,
  onChange = (_value: string[]) => null,
  onClick = () => null,
  onKeydown = (_event: KeyboardEvt) => null,
  onChipClick,
  wrapper,
  children,
}) => {
  const handleChange = useRef(onChange);
  /* ----- INDEX ------------------------------ */
  const index = useRef<number | null>(null);
  const indexChip = useRef<IndexChip>({}).current;

  const handleChip = useCallback(
    (value: string, index: number) => {
      if (onChipClick) {
        return onChipClick(value, index);
      } else {
        return null;
      }
    },
    [onChipClick],
  );

  const deleteChip = useCallback(
    (chip: string) => {
      if (index.current !== null) index.current = null;
      const indexChip = value.indexOf(chip);
      value.splice(indexChip, 1);
      handleChange.current([...value]);
    },
    [value],
  );

  const focusChip = useCallback(
    (indexPrev: number | null, indexCurr: number) => {
      if (indexPrev !== null && indexChip[indexPrev]) {
        indexChip[indexPrev].blur();
      }
      indexChip[indexCurr].focus();
    },
    [indexChip],
  );

  function renderChip(value: string[]) {
    return value.map((chip, index) => (
      <Chip key={chip + index} value={chip} index={index} />
    ));
  }

  function addIcon(InputChips: ReactElement) {
    if (inputIcon) {
      return (
        <div className="mod-flex-wrap">
          <div className="mod-input-wrap">
            {InputChips}
            <div className="mod-inset-icon">{inputIcon}</div>
          </div>
        </div>
      );
    } else {
      return InputChips;
    }
  }

  function setCssCustom() {
    let className = "mod-input-chip";
    if (cssCustom && override) className = cssCustom;
    if (cssCustom) className += ` ${cssCustom}`;
    return className;
  }

  return (
    <ModuleCore cssCustom={setCssCustom()} border>
      <ChipBox
        indexChip={indexChip}
        handleChip={handleChip}
        deleteChip={deleteChip}>
        {renderChip(value)}
      </ChipBox>
      {addIcon(
        <Input
          name={name}
          value={value}
          index={index}
          onChange={onChange}
          onClick={onClick}
          onKeydown={onKeydown}
          disabled={disabled}
          placeholder={placeholder}
          readonly={readOnly}
          focusChip={focusChip}
          deleteChip={deleteChip}
        />,
      )}

      {wrapper && children}
    </ModuleCore>
  );
};

interface InputProps {
  name: string;
  value: string[];
  index: MutableRefObject<number | null>;
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  focusChip: FocusChip;
  deleteChip: DeleteChip;
  onChange: (value: any[]) => any;
  onClick: (event?: MouseEvt) => any;
  onKeydown: (event: KeyboardEvt) => any;
}

const Input: FC<InputProps> = ({
  name,
  value,
  index,
  disabled,
  placeholder,
  readonly,
  focusChip,
  deleteChip,
  onChange,
  onClick,
  onKeydown,
}) => {
  const [inputValue, setValue] = useState("");
  const handleInput = (event: ChangeEvt) => {
    if (readonly || disabled) return;
    setValue(event.target.value);
  };

  const onEnter = () => {
    if (inputValue && !readonly) {
      setValue("");
      onChange([...value, inputValue]);
    }
  };

  const minMax = (index: number) => {
    const max = value.length - 1;
    if (index > max) return 0;
    if (index < 0) return max;
    return index;
  };

  const handleKeydown = (event: KeyboardEvt) => {
    let currentIndex = 0;
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        onEnter();
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (index.current !== null) {
          currentIndex = minMax(index.current - 1);
          console.log(index.current, currentIndex);
          focusChip(index.current, currentIndex);
          index.current = currentIndex;
        } else {
          index.current = value.length - 1;
          focusChip(null, index.current);
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (index.current !== null) {
          currentIndex = minMax(index.current + 1);
          focusChip(index.current, currentIndex);
          index.current = currentIndex;
        } else {
          index.current = 0;
          focusChip(null, 0);
        }
        break;
      case "Backspace":
        event.preventDefault();
        if (inputValue !== "") {
          break;
        }
        if (index.current === null) {
          currentIndex = value.length - 1;
          focusChip(null, currentIndex);
          index.current = currentIndex;
        } else {
          deleteChip(value[index.current]);
        }
        break;
    }
  };
  function renderPlaceholder(readonly: boolean) {
    if (readonly) return "";
    return placeholder;
  }

  function setInputClass(readonly: boolean) {
    let className = "mod-input-text";
    if (readonly) className += " mod-read-only";
    return className;
  }

  return (
    <input
      className={setInputClass(readonly)}
      type="text"
      name={name}
      value={inputValue}
      disabled={disabled}
      onChange={handleInput}
      onClick={onClick}
      onKeyDown={(e) => {
        handleKeydown(e);
        onKeydown(e);
      }}
      placeholder={renderPlaceholder(readonly)}
      readOnly={readonly}
    />
  );
};

interface ChipBoxProps {
  indexChip: IndexChip;
  handleChip: HandleChip | null;
  deleteChip: DeleteChip;
}
const ChipContext = createContext({} as ChipBoxProps);
const useChipContext = () => useContext(ChipContext);
const ChipBox: FC<ChipBoxProps> = ({
  indexChip,
  handleChip,
  deleteChip,
  children,
}) => {
  return createElement(
    ChipContext.Provider,
    { value: { indexChip, handleChip, deleteChip } },
    children,
  );
};

interface ChipProps {
  value: string;
  index: number;
}

const Chip: FC<ChipProps> = ({ value, index }) => {
  const [active, setActive] = useState(false);
  const { indexChip, handleChip, deleteChip } = useChipContext();
  const handleClick = () => {
    if (handleChip) {
      handleChip(value, index);
    } else {
      deleteChip(value);
    }
  };
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
};

function setChipClass(active: boolean = false) {
  let className = "mod-chip";
  if (active) className += " mod-active";
  return className;
}

export default InputChips;
