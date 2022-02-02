import { FC, MouseEvent } from "react";
interface Props {
  onClick: (event?: MouseEvent, value?: any) => void;
  value?: any;
  disabled?: boolean;
  children: string;
}

export const Button: FC<Props> = ({
  value,
  disabled = false,
  onClick,
  children,
}) => {
  function handleClick(event?: MouseEvent) {
    if (disabled) return;
    onClick(event, value);
  }
  return (
    <button
      className={setClassName(disabled)}
      onClick={handleClick}
      value={value}>
      {children}
    </button>
  );
};

function setClassName(disabled?: boolean) {
  let className = "mod-button";
  if (disabled) className += " mod-disabled";
  return className;
}
