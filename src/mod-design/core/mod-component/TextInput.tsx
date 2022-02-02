import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";
import { useModuleCore } from "../hook/useModuleCore";
import { CoreProps, ModuleCore } from "./ModuleCore";
type ChangeEvt = ChangeEvent<HTMLInputElement>;
type KeyboardEvt = KeyboardEvent<HTMLInputElement>;

type Wrapper =
  | { wrapper?: never; children?: never }
  | {
      /**
       * @param {boolean=} wrapper
       *
       * For development purposes only.
       * If `true` it unlock props `children`.
       *
       **/
      wrapper: true;
      children: ReactElement;
    };

interface TextProps extends CoreProps {
  name: string;
  value: string;
  border?: boolean;
  disabled?: boolean;
  focused?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => any;
  onClick?: (event?: MouseEvent) => any;
  onKeydown?: (event: KeyboardEvt) => any;
  /* children?: ReactElement; */
}

type Props = TextProps & Wrapper;

const TextInput: FC<Props> = ({
  name,
  value,
  focused,
  disabled,
  readOnly,
  border = true,
  onChange = (_v) => null,
  onClick = () => null,
  onKeydown = (_e: KeyboardEvt) => null,
  children,
}) => {
  const { isFocused, isDisabled, setFocused } = useModuleCore({
    focused: focused,
    disabled: disabled,
  });
  function handleChange(event: ChangeEvt) {
    if (disabled) return;
    onChange(event.target.value);
  }
  function handleClick(event: MouseEvent) {
    if (disabled) return;
    onClick(event);
  }
  function handleKeydown(event: KeyboardEvt) {
    if (disabled) return;
    onKeydown(event);
  }
  return (
    <ModuleCore focused={isFocused} disabled={isDisabled} border={border}>
      <input
        className="mod-input-text"
        type="text"
        name={name}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onClick={handleClick}
        onKeyDown={handleKeydown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly={readOnly}
      />
      {children}
    </ModuleCore>
  );
};

export default TextInput;
