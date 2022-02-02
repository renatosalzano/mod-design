import { FC } from "react";

const CloseIcon: FC = () => {
  return (
    <svg
      className="mod-close-icon"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="24px"
      height="24px"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24">
      <g fill="none">
        <path
          d="M17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41L17.59 5z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};

export default CloseIcon;
