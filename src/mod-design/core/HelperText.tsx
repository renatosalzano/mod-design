import { FC } from "react";
interface Props {
  color?: "main" | "success" | "warning" | "error";
  focused?: boolean;
  disabled?: boolean;
  children: string | string[];
}
const HelperText: FC<Props> = ({ color = "main", focused = false, disabled = false, children }) => {
  function render(text: string | string[]) {
    if (Array.isArray(text)) {
      return text.map((helper, index) => (
        <span className="mod-text-item" key={index + helper}>
          {helper}
        </span>
      ));
    } else {
      return text;
    }
  }
  function setClassName() {
    let className = "mod-helper-text";
    if (color) className += ` ${color}`;
    if (focused) className += " mod-focus";
    if (disabled) className += " mod-disabled";
    return className;
  }
  return (
    <div className={setClassName()}>
      <span className="mod-text">{render(children)}</span>
    </div>
  );
};

export default HelperText;