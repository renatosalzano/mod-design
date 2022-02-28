import { createContext, FC, ReactElement, useContext, useEffect, useRef, useState } from "react";
import HelperText from "./HelperText";
import "./SCSS/mod-core.scss";

export interface CoreProps {
  error?: boolean;
  focused?: boolean;
  disabled?: boolean;
  border?: boolean;
  className?: string;
  /**
   * Add CSS theme color class
   *
   * [Material Color Tools](https://material.io/resources/color/#!/?view.left=0&view.right=0)
   *
   * @example
   * .myTheme {
   *--fontColor: #color;
   *--fontColorSecondary: #color;
   *--idleColor: #color;
   *--mainColor: #color;
   *--successColor: #color;
   *--warningColor: #color;
   *--errorColor: #color;
   *--hoverColor: #color;
   *--disabledColor: #color;
   *--backgroundColor: #color;
   *}
   */
  themeColor?: string;
  color?: CoreColor;
  inputIcon?: ReactElement;
  helperText?: string | string[];
}

export type CoreColor = "basic" | "primary" | "accent" | "success" | "warn" | "error";

interface Core {
  color: CoreColor;
  error: boolean;
  disabled: boolean;
  focused: boolean;
}

const ModuleContext = createContext({} as Core);
export const useCore = () => useContext(ModuleContext);

const ModuleCore: FC<CoreProps> = ({
  border = false,
  color = "primary",
  themeColor = "mod-theme",
  className,
  focused = false,
  disabled = false,
  error = false,
  helperText,
  children,
}) => {
  function renderBorder(border: boolean) {
    if (border) {
      return <div className="mod-border">{children}</div>;
    }
    return children;
  }

  function setCoreClass(
    className?: string,
    color?: CoreColor,
    themeColor?: string,
    focused = false,
    disabled = false,
    error = false,
  ) {
    let classname = "mod-core";
    if (error) classname += " mod-error";
    if (className) classname += ` ${className}`;
    if (themeColor) classname += ` ${themeColor}`;
    if (color) classname += ` mod-${color}`;
    if (focused) classname += " focus";
    if (disabled) classname += " disabled";
    return classname;
  }

  return (
    <ModuleContext.Provider
      value={{
        color,
        error,
        disabled,
        focused,
      }}>
      <div className={setCoreClass(className, color, themeColor, focused, disabled, error)}>
        {renderBorder(border)}
        {helperText && (
          <HelperText color={color} focused={focused} disabled={disabled}>
            {helperText}
          </HelperText>
        )}
      </div>
    </ModuleContext.Provider>
  );
};
export { ModuleCore };

interface ModuleCoreArgs {
  focused?: boolean;
  disabled?: boolean;
  error?: boolean;
  color?: "main" | "success" | "warning" | "error";
  helper?: string | string[];
}

type UseModuleCore = ({ focused, disabled, error, color, helper }: ModuleCoreArgs) => {
  isFocus: boolean;
  isDisabled: boolean;
  isError: boolean;
  helperTextCore: string | string[];
  setFocus(): void;
  setBlur(): void;
  setError(message?: string | string[]): void;
  clearError(): void;
  setHelperText(text?: string | string[]): void;
};

export const useModuleCore: UseModuleCore = ({
  focused = false,
  disabled = false,
  error = false,
  helper = "",
}) => {
  const [isError, setIsError] = useState(error);
  const [isFocus, setFocus] = useState(focused);
  const [isDisabled, setDisabled] = useState(disabled);
  const [helperTextCore, setHelperText] = useState<string | string[]>(helper);
  const helperControl = useRef({
    helperText: helper,
    setHelper(text: string | string[]) {
      setHelperText(text);
    },
    updateHelper(text: string | string[]) {
      this.helperText = text;
      setHelperText(text);
    },
    restore() {
      setHelperText(this.helperText);
    },
  }).current;

  useEffect(() => {
    setIsError(error);
  }, [error]);
  useEffect(() => {
    setFocus(focused);
  }, [focused]);
  useEffect(() => {
    setDisabled(disabled);
  }, [disabled]);
  useEffect(() => {
    helperControl.updateHelper(helper);
  }, [helper, helperControl]);

  return {
    isFocus,
    isDisabled,
    isError,
    helperTextCore,
    setFocus() {
      setFocus(true);
    },
    setBlur() {
      setFocus(false);
    },
    setError(message?: string | string[]) {
      if (message !== undefined) {
        helperControl.setHelper(message);
        setHelperText(message);
      }
      setIsError(true);
    },
    clearError() {
      helperControl.restore();
      setIsError(false);
    },
    setHelperText(text) {
      if (text !== undefined) {
        helperControl.setHelper(text);
      } else {
        helperControl.restore();
      }
    },
  };
};
