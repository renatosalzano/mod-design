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

type KeydownEvent = KeyboardEvent<HTMLButtonElement>;
type MaterialStyle = "mat-basic" | "mat-flat" | "mat";

interface CoreButton extends MaterialButton {
  disableRipple?: boolean;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  overrideCss?: boolean;
  onClick: () => void;
  onTouch?: () => void;
  onKeydown?: (event: KeydownEvent) => void;
}

interface MaterialButton extends CoreProps {
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

export const Button: FC<CoreButton> = memo(
  ({
    disabled,
    cssCustom,
    themeColor,
    overrideCss,
    disableRipple,
    startIcon,
    endIcon,
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

    const mounted = useRef(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const endRipple = useRef(() => null);

    const debounce = useDebouce();

    const handleMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (disableRipple) return;
        debounce.cancel();
        const node = event.target as HTMLButtonElement;
        const rect = node.getBoundingClientRect();
        const top = event.clientY - rect.top;
        const left = event.clientX - rect.left;
        const width = node.offsetWidth;
        const size = node.offsetWidth * 2;
        const props = {
          top: `${top - width}px`,
          left: `${left - width}px`,
          size: `${size}px`,
          scale: `${20 / size}`,
          endRipple,
        };
        const key = new Date().getMilliseconds() + Math.random();
        setRipples([...ripples, <RippleEffect key={key} {...props} />]);
        setShadow("blur");
      },
      [debounce, disableRipple, ripples],
    );

    const handleMouseUp = () => {
      if (disabled) return;
      setShadow("idle");
      endRipple.current();
      debounce.debounce(() => setRipples([]), 400);
      onClick();
    };

    const handleMouseLeave = () => {
      if (disabled) return;
      setShadow("idle");
      endRipple.current();
      debounce.debounce(() => setRipples([]), 400);
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
      mounted.current = true;
      return () => {
        mounted.current = false;
        setRipples([]);
      };
    }, []);

    function setClassName() {
      let classname = `mod-button mod-shadow-${shadow}`;
      if (cssCustom) classname += ` ${cssCustom}`;
      if (themeColor) {
        classname += ` ${themeColor}`;
      } else {
        classname += " mod-theme";
      }

      if (raised) classname += " mod-raised";
      if (disabled) classname += " mod-disabled";
      return classname;
    }
    function setMaterialClass() {
      const matProps = [matBasic, matStroked, matFlat, matIcon, matFab, matMiniFab];
      const warnProps = matProps.filter((mat) => mat).length > 1;
      if (warnProps) {
        console.warn('INVALID PROPS:\n<Button "detected two or more mat-props" />');
      }
      switch (true) {
        case matBasic:
          return "mat-basic";
        case matStroked:
          return "mat-stroked";
        case matFlat:
          return "mat-flat";
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
  },
);

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
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    endRipple.current = () => setEndRipple(true);
    return () => {
      endRipple.current = () => null;
    };
  }, [endRipple]);

  useEffect(() => {
    const node = ref.current as HTMLSpanElement;
    node.style.setProperty("--rippleSize", size);
    node.style.setProperty("--rippleScaleFactor", scale);
  }, [scale, size]);

  function setClassname() {
    let classname = "mod-ripple";
    if (rippleEnd) classname += " ripple-end";
    return classname;
  }

  return <span ref={ref} className={setClassname()} style={{ top, left }} />;
};

/* 
  ------------------------------------------------------------------------- 
  ----- ARROW
  ------------------------------------------------------------------------- 
*/

interface ArrowProps extends CoreButton {
  arrow: "L" | "R" | "U" | "D";
}

export const MatArrow: FC<ArrowProps> = memo(
  ({ arrow, disabled, disableRipple, themeColor, cssCustom, onClick }) => {
    function setArrowClass() {
      let classname = `mod-arrow-${arrow}`;
      if (cssCustom) classname += ` ${cssCustom}`;
      return classname;
    }
    return (
      <Button
        cssCustom={setArrowClass()}
        onClick={onClick}
        disabled={disabled}
        themeColor={themeColor}
        disableRipple={disableRipple}>
        <div className="mod-arrow-shape" />
      </Button>
    );
  },
);
