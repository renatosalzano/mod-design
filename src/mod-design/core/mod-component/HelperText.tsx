import { FC } from "react";
interface Props {
  color?: "main" | "success" | "warning" | "error";
  focused?: boolean;
  disabled?: boolean;
  children: string;
}
const HelperText: FC<Props> = ({
  color = "main",
  focused = false,
  disabled = false,
  children,
}) => {
  function setClassName() {
    let className = "mod-helper-text";
    if (color) className += ` ${color}`;
    if (focused) className += " mod-focus";
    if (disabled) className += " mod-disabled";
    return className;
  }
  return (
    <div className={setClassName()}>
      <span className="mod-text">{children}</span>
    </div>
  );
};

export default HelperText;
