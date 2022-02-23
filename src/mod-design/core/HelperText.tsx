import { FC } from "react";
import { PropColor } from "./ModuleCore";
interface Props {
  color?: PropColor;
  focused?: boolean;
  disabled?: boolean;
  children: string | string[];
}
const HelperText: FC<Props> = ({ color = "main", focused = false, disabled = false, children }) => {
  function capital(text: string) {
    return text.replace(text[0], (_text) => _text.toUpperCase());
  }
  function render(text: string | string[]) {
    if (Array.isArray(text)) {
      return text.map((helper, index) => (
        <span className="mod-text-item" key={index + helper}>
          {`- ${capital(helper)}`}
        </span>
      ));
    } else {
      return capital(text);
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
