import {
  Children,
  cloneElement,
  FC,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
} from "react";
import HelperText from "./HelperText";
import "../SCSS/mod-core.scss";

export interface CoreProps {
  error?: boolean;
  focused?: boolean;
  disabled?: boolean;
  border?: boolean;
  cssCustom?: string;
  themeColor?: string;
  color?: "main" | "success" | "warning" | "error";
  inputIcon?: ReactElement;
  helperText?: string;
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
