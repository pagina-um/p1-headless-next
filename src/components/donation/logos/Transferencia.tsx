import React from "react";

const VisaMastercardLogo = ({ width = 93, height = 16, className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 93 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Visa Logo */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.802 15h-4.109l2.568-15h4.109l-2.568 15ZM13.591 0 9.858 10.317l-.441-2.222L8.1 1.352S7.94 0 6.242 0H.072L0 .254s1.887.391 4.095 1.715L7.497 15h4.079l6.229-15h-4.214Zm25.913 10.385 2.137-5.77 1.202 5.77h-3.339ZM47.85 15 44.845 0h-4.13c-1.394 0-1.733 1.118-1.733 1.118L33.384 15h3.912l.783-2.228h4.772L43.29 15h4.56ZM33.965 3.744l.531-3.112S32.856 0 31.148 0c-1.847 0-6.233.819-6.233 4.797 0 3.744 5.148 3.79 5.148 5.756 0 1.966-4.618 1.615-6.141.375l-.554 3.253S25.03 15 27.57 15s6.372-1.334 6.372-4.961c0-3.768-5.195-4.119-5.195-5.757s3.625-1.428 5.218-.538Z"
        fill="#182E66"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m8.902 8.077-1.245-6.73S7.507 0 5.9 0H.068L0 .253s2.804.612 5.493 2.903c2.571 2.19 3.41 4.92 3.41 4.92Z"
        fill="#182E66"
      />

      {/* Mastercard Logo */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M76.853 13.396h6.563V1.603h-6.563v11.793Z"
        fill="#FF5F00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77.27 7.5a7.487 7.487 0 0 1 2.865-5.897A7.5 7.5 0 0 0 68 7.5a7.5 7.5 0 0 0 12.135 5.897A7.487 7.487 0 0 1 77.27 7.5Z"
        fill="#EB001B"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M92.035 12.147v-.29h-.076l-.087.2-.088-.2h-.076v.29h.054v-.22l.082.19h.055l.082-.19v.22h.054Zm-.481 0v-.241h.097v-.05h-.248v.05h.097v.241h.054Zm.715-4.647a7.5 7.5 0 0 1-12.135 5.897A7.487 7.487 0 0 0 83 7.5a7.487 7.487 0 0 0-2.865-5.897A7.5 7.5 0 0 1 92.27 7.5Z"
        fill="#F79E1B"
      />

      {/* Separator line */}
      <path
        stroke="#E8E8E8"
        strokeLinecap="round"
        d="m61.242 1.664-6.089 13.058"
      />
    </svg>
  );
};

export default VisaMastercardLogo;
