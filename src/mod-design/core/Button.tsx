import {
  FC,
  KeyboardEvent,
  memo,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { CoreProps } from "./ModuleCore";
import { useDebouce } from "../utils/useDebounce";
import "./SCSS/mod-core.scss";
import "./SCSS/mod-core-button.scss";

type KeydownEvent = KeyboardEvent<HTMLButtonElement>;

interface CoreButton extends CoreProps {
  disableRipple?: boolean;
  disabled?: boolean;
  overrideCss?: boolean;
  onClick: () => void;
  onTouch?: () => void;
  onKeydown?: (event: KeydownEvent) => void;
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
      let classname = overrideCss ? "" : "mod-button";
      if (cssCustom) classname += ` ${cssCustom}`;
      if (themeColor) {
        classname += ` ${themeColor}`;
      } else {
        classname += " mod-theme";
      }
      if (disabled) classname += " mod-disabled";
      return classname;
    }
    return (
      <button
        className={setClassName()}
        onClick={handleClick}
        onTouchStart={handleTouch}
        onKeyDown={handleKeydown}>
        <span className="mod-button-inner">{children}</span>
        <Background disableRipple={disableRipple} />
      </button>
    );
  },
);

/* 
  ------------------------------------------------------------------------- 
  ----- RIPPLE EFFECT
  ------------------------------------------------------------------------- 
*/
interface BackgroundProps {
  disableRipple?: boolean;
}

const Background: FC<BackgroundProps> = ({ disableRipple }) => {
  const [shadow, setShadow] = useState<"idle" | "moved">("idle");
  const [ripples, setRipples] = useState<ReactNode[]>([]);
  const mounted = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const setRippleWidth = useRef((node: HTMLDivElement) => {
    const width = node.offsetWidth * 2;
    node.style.setProperty("--rippleSize", width + "px");
    node.style.setProperty("--rippleScaleFactor", `${20 / width}`);
  });

  const debounce = useDebouce();
  const createRipple = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (disableRipple) return;
      const node = event.target as HTMLDivElement;
      const rect = node.getBoundingClientRect();
      const half = node.offsetWidth;
      const props = {
        top: `${event.clientY - rect.top - half}px`,
        left: `${event.clientX - rect.left - half}px`,
      };
      const key = new Date().getMilliseconds() + Math.random();
      setRipples([...ripples, <RippleEffect key={key} {...props} />]);
      debounce.cancel();
      debounce.debounce(() => setRipples([]), 400);
    },
    [debounce, disableRipple, ripples],
  );

  useEffect(() => {
    setRippleWidth.current(ref.current as HTMLDivElement);
    mounted.current = true;
    return () => {
      mounted.current = false;
      setRipples([]);
    };
  }, []);
  return (
    <div ref={ref} className="mod-button-background" onClick={createRipple}>
      <div className="mod-insert-color" />
      {ripples}
    </div>
  );
};

interface RippleProps {
  top: string;
  left: string;
}
const RippleEffect: FC<RippleProps> = ({ top, left }) => {
  return <span className="mod-ripple" style={{ top, left }} />;
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
        themeColor={themeColor}>
        <div className="mod-arrow-shape" />
        <Background disableRipple={disableRipple} />
      </Button>
    );
  },
);
