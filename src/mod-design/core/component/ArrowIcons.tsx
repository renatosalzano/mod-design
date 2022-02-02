import { FC, memo } from "react";

interface Props {
  onClick: (...args: any) => void;
}

export const ArrowLeft: FC<Props> = memo(({ onClick }) => {
  return (
    <div className="mod-icon" onClick={() => onClick(false)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xlinkHref="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        role="img"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 20 20">
        <path d="M14 5l-5 5l5 5l-1 2l-7-7l7-7z" fill="currentColor" />
      </svg>
    </div>
  );
});

export const ArrowRight: FC<Props> = memo(({ onClick }) => {
  return (
    <div className="mod-icon" onClick={() => onClick(true)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xlinkHref="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        role="img"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 20 20">
        <path d="M6 15l5-5l-5-5l1-2l7 7l-7 7z" fill="currentColor" />
      </svg>
    </div>
  );
});
