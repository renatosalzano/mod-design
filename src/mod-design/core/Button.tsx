import {
  FC,
  KeyboardEvent,
  memo,
  MouseEvent,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { CoreProps } from "./ModuleCore";
import { useDebouce } from "../utils/useDebounce";
import "./SCSS/mod-core-button.scss";
import { useCheckBrightness } from "../utils/useCheckBrightness";

type KeydownEvent = KeyboardEvent<HTMLButtonElement>;

interface CoreButton extends CoreProps, MaterialButton {
  disableRipple?: boolean;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  focused?: boolean;
  onClick: () => void;
  onTouch?: () => void;
  onKeydown?: (event: KeydownEvent) => void;
}

interface MaterialButton {
  matBasic?: boolean;
  matFlat?: boolean;
  matStroked?: boolean;
  matIcon?: boolean;
  matFab?: boolean;
  matMiniFab?: boolean;
  raised?: boolean;
}

/* 
  ------------------------------------------------------------------------- 
  ----- MODULE BUTTON
  ------------------------------------------------------------------------- 
*/

const Button: FC<CoreButton> = ({
  disabled,
  className,
  themeColor = "mod-theme",
  disableRipple,
  startIcon,
  endIcon,
  focused,
  color = "basic",
  matBasic,
  matFlat,
  matIcon,
  matFab,
  matMiniFab,
  matStroked,
  raised,
  onClick,
  onTouch = () => null,
  onKeydown = (_event: KeydownEvent) => null,
  children,
}) => {
  const [ripples, setRipples] = useState<ReactNode[]>([]);
  const [shadow, setShadow] = useState<"idle" | "blur">("idle");
  const [textColor, setTextColor] = useState<"light" | "dark">("light");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { checkBrightness } = useCheckBrightness<HTMLButtonElement>("--color", matFlat);
  const isInside = useRef(false);
  const endRipple = useRef(() => null);
  const clearRipple = useDebouce();

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (disableRipple || disabled) return;
      clearRipple.cancel();
      const node = event.target as HTMLButtonElement;
      const rect = node.getBoundingClientRect();
      let top = event.clientY - rect.top;
      let left = event.clientX - rect.left;
      if (matIcon) {
        top = node.clientHeight / 2;
        left = node.clientWidth / 2;
      }
      const size = node.offsetWidth * 2.5;
      const offset = size / 2;
      const props = {
        top: `${top - offset}px`,
        left: `${left - offset}px`,
        size: `${size}px`,
        scale: `${20 / size}`,
        endRipple,
      };
      setRipples([...ripples, <RippleEffect key={new Date().getTime()} {...props} />]);
      setShadow("blur");
      isInside.current = true;
    },
    [clearRipple, disableRipple, disabled, matIcon, ripples],
  );

  const handleMouseUp = () => {
    if (disabled) return;
    setShadow("idle");
    endRipple.current();
    clearRipple.debounce(() => setRipples([]), 250);
    if (isInside.current) {
      onClick();
      isInside.current = false;
    }
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setShadow("idle");
    endRipple.current();
    clearRipple.debounce(() => setRipples([]), 250);
    isInside.current = false;
  };

  const handleTouch = () => {
    if (disabled) return;

    onTouch();
  };

  const handleKeydown = (event: KeydownEvent) => {
    if (disabled) return;
    onKeydown(event);
  };

  useEffect(() => {
    setTextColor(checkBrightness(buttonRef.current!));
    return () => {
      clearRipple.cancel();
      setRipples([]);
    };
  }, [checkBrightness, clearRipple]);

  function setClassName() {
    let classname = "mod-core-button";
    if (className) classname += ` ${className}`;
    if (themeColor) classname += ` ${themeColor}`;
    if (color) classname += ` mod-${color}`;
    if (textColor) classname += ` mod-text-${textColor}`;
    if (raised) classname += ` mod-raised-${shadow}`;
    if (disabled) classname += " mod-disabled";
    return classname;
  }
  function setMaterialClass() {
    const matProps = [matStroked, matFlat, matIcon, matFab, matMiniFab];
    const warnProps = matProps.filter((mat) => mat).length > 1;
    if (warnProps) {
      console.warn('INVALID PROPS:\n<Button "detected two or more mat-props" />');
    }
    switch (true) {
      case matBasic:
        return "mat-basic";
      case matFlat:
        return "mat-flat";
      case matStroked:
        return "mat-stroked";
      case matIcon:
        return "mat-icon";
      case matFab:
        return "mat-fab";
      case matMiniFab:
        return "mat-mini-fab";
    }
  }
  return (
    <button
      ref={buttonRef}
      className={`${setMaterialClass()} ${setClassName()}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouch}
      onKeyDown={handleKeydown}
      onMouseLeave={handleMouseLeave}>
      <div className="mod-button-label">
        {startIcon}
        {children}
        {endIcon}
      </div>
      <div className="mod-button-background" />
      {ripples}
    </button>
  );
};

export default Button;

/* 
  ------------------------------------------------------------------------- 
  ----- RIPPLE EFFECT
  ------------------------------------------------------------------------- 
*/

interface RippleProps {
  top: string;
  left: string;
  size: string;
  scale: string;
  endRipple: MutableRefObject<() => void>;
}
const RippleEffect: FC<RippleProps> = ({ top, left, size, scale, endRipple }) => {
  const [rippleEnd, setEndRipple] = useState(false);
  const [endRippleClass, setEndRippleClass] = useState("");
  const startTime = useRef(new Date().getTime());
  const ref = useRef<HTMLSpanElement>(null);
  const delaySetRippleEnd = useDebouce();

  const delayRippleAnimation = useCallback(() => {
    const timeElapsed = new Date().getTime() - startTime.current;
    if (timeElapsed < 250) {
      const timeLeft = 250 - timeElapsed;
      delaySetRippleEnd.debounce(() => {
        setEndRippleClass("ripple-end");
      }, timeLeft);

      return;
    } else {
      setEndRippleClass("ripple-end");
      return;
    }
  }, [delaySetRippleEnd]);

  useEffect(() => {
    endRipple.current = () => setEndRipple(true);
    return () => {
      delaySetRippleEnd.cancel();
      endRipple.current = () => null;
    };
  }, [delaySetRippleEnd, endRipple]);

  useEffect(() => {
    const node = ref.current as HTMLSpanElement;
    node.style.setProperty("--rippleSize", size);
    node.style.setProperty("--rippleScaleFactor", scale);
  }, [scale, size]);

  useEffect(() => {
    if (rippleEnd) delayRippleAnimation();
  }, [delayRippleAnimation, rippleEnd]);

  return <span ref={ref} className={`mod-ripple ${endRippleClass}`} style={{ top, left }} />;
};
