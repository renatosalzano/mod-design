import { FC } from "react";
interface Props {
  flip?: boolean;
}
const ArrowIcon: FC<Props> = ({ flip }) => {
  function setClassName() {
    let classname = "mod-arrow-icon";
    if (flip) classname += " mod-flip";
    return classname;
  }
  return (
    <svg
      viewBox="0 0 10 5"
      width="10px"
      height="5px"
      focusable="false"
      className={setClassName()}>
      <polygon fill="currentColor" points="0,0 5,5 10,0"></polygon>
    </svg>
  );
};

export default ArrowIcon;
