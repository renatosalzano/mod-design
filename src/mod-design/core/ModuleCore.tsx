import { FC, memo, ReactElement, useEffect, useRef, useState } from "react";
import HelperText from "./HelperText";
import "./SCSS/mod-core.scss";

export interface CoreProps {
  error?: boolean;
  focused?: boolean;
  disabled?: boolean;
  border?: boolean;
  cssCustom?: string;
  themeColor?: string;
  color?: "main" | "success" | "warning" | "error";
  inputIcon?: ReactElement;
  helperText?: string | string[];
}

const ModuleCore: FC<CoreProps> = memo(
  ({
    border = false,
    color = "main",
    themeColor = "mod-theme",
    cssCustom,
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

    function setCoreClass({
      cssCustom,
      color,
      themeColor,
      focused = false,
      disabled = false,
      error = false,
    }: Props) {
      let className = "mod-core";
      if (error) className += " mod-error";
      if (cssCustom) className += ` ${cssCustom}`;
      if (themeColor) className += ` ${themeColor}`;
      if (color) className += ` mod-${color}`;
      if (focused) className += " focus";
      if (disabled) className += " disabled";
      return className;
    }

    return (
      <div
        className={setCoreClass({
          cssCustom: cssCustom,
          color: color,
          themeColor: themeColor,
          focused: focused,
          disabled: disabled,
          error: error,
        })}>
        {renderBorder(border)}
        {helperText && (
          <HelperText color={color} focused={focused} disabled={disabled}>
            {helperText}
          </HelperText>
        )}
      </div>
    );
  },
);
export { ModuleCore };

interface Props {
  cssCustom?: string;
  color?: "main" | "warning" | "error" | "success";
  themeColor?: string;
  focused?: boolean;
  disabled?: boolean;
  error?: boolean;
}

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
  };
};
