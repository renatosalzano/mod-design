import { FC, KeyboardEvent, WheelEvent } from "react";
import "./SCSS/mod-core-button.scss";

type KeydownEvent = KeyboardEvent<HTMLButtonElement>;

interface CoreButton {
  cssCustom?: string;
  disabled?: boolean;
  onClick: () => void;
  onTouch?: () => void;
  onKeydown?: (event: KeydownEvent) => void;
}

/* 
  ------------------------------------------------------------------------- 
  ----- MODULE BUTTON
  ------------------------------------------------------------------------- 
*/

export const Button: FC<CoreButton> = ({
  disabled,
  cssCustom,
  onClick,
  onTouch = () => null,
  onKeydown = (_event: KeydownEvent) => null,
  children,
}) => {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  const handleTouch = () => {
    if (disabled) return;
    onTouch();
  };

  const handleKeydown = (event: KeydownEvent) => {
    if (disabled) return;
    onKeydown(event);
  };

  function setClassName() {
    let classname = "mod-button";
    if (cssCustom) classname += ` ${cssCustom}`;
    if (disabled) classname += " mod-disabled";
    return classname;
  }
  return (
    <button
      className={setClassName()}
      onClick={handleClick}
      onTouchStart={handleTouch}
      onKeyDown={handleKeydown}>
      {children}
    </button>
  );
};

/* 
  ------------------------------------------------------------------------- 
  ----- MATERIAL ARROW
  ------------------------------------------------------------------------- 
*/

interface ArrowProps extends CoreButton {
  arrow: "L" | "R" | "U" | "D";
  onWheelUp?: () => void;
  onWheelDown?: () => void;
}

export const MatArrow: FC<ArrowProps> = ({
  arrow,
  disabled,
  cssCustom,
  onClick,
  onWheelUp,
  onWheelDown,
}) => {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };
  const handleWheel = (event: WheelEvent<HTMLButtonElement>) => {
    if (event.deltaY > 0) {
      /* console.log("DOWN"); */
      if (onWheelDown) onWheelDown();
    } else {
      /* console.log("UP"); */
      if (onWheelUp) onWheelUp();
    }
  };
  function setClassName() {
    let classname = `mod-arrow-${arrow}`;
    if (cssCustom) classname += ` ${cssCustom}`;
    if (disabled) classname += " mod-disabled";
    return classname;
  }
  return (
    <button
      className={setClassName()}
      onClick={handleClick}
      onWheel={handleWheel}>
      <div className="mod-arrow-shape" />
    </button>
  );
};
