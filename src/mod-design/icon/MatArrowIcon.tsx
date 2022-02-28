import { FC } from "react";
import "../core/SCSS/mod-core-icons.scss";

interface Props {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
}

const MatArrowIcon: FC<Props> = ({ up, down, left, right }) => {
  function setArrow() {
    switch (true) {
      case up:
        return "up";
      case down:
        return "down";
      case left:
        return "left";
      case right:
        return "right";
    }
  }

  return <span className={`mat-arrow-shape mat-arrow-${setArrow()}`} />;
};

export default MatArrowIcon;
