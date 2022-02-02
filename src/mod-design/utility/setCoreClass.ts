interface Props {
  cssCustom?: string;
  color?: "main" | "warning" | "error" | "success";
  themeColor?: string;
  focused?: boolean;
  disabled?: boolean;
}

export function setCoreClass({
  cssCustom,
  color,
  themeColor,
  focused = false,
  disabled = false,
}: Props) {
  let className = "mod-core";
  if (cssCustom) {
    className += ` ${cssCustom}`;
  }
  if (themeColor) {
    className += ` ${themeColor}`;
  }
  if (color) {
    className += ` mod-${color}`;
  }
  if (focused) {
    className += " focus";
  }
  if (disabled) {
    className += " disabled";
  }

  return className;
}
