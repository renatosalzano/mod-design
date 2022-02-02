import { ChangeEvent, FC, KeyboardEvent, MouseEvent } from "react";
interface Props {
  type?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onClick?: () => void;
  onkeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  setFocus?: (focus: boolean) => void;
}
const ModTextInput: FC<Props> = ({
  type = "text",
  name,
  value,
  disabled = false,
  readOnly = false,
  onChange,
  onClick,
  onkeyDown,
  setFocus,
}) => {
  function focusHandler(focus: boolean) {
    !!setFocus && setFocus(focus);
  }
  function _onChange(event: ChangeEvent<HTMLInputElement>) {
    const targetValue = event.target.value;
    !!onChange && onChange(targetValue);
  }
  function _onClick(event: MouseEvent<HTMLInputElement>) {
    event.preventDefault();
    !!onClick && onClick();
  }
  function _onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    !!onkeyDown && onkeyDown(event);
  }
  return (
    <input
      className="mod-text"
      type={type}
      name={name}
      value={value}
      disabled={disabled}
      onChange={_onChange}
      onClick={_onClick}
      onKeyDown={_onKeyDown}
      onFocus={() => focusHandler(true)}
      onBlur={() => focusHandler(false)}
      readOnly={readOnly}
    />
  );
};

export default ModTextInput;
