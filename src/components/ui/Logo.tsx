import React from "react";

export function Logo({ white = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1780 340"
      className="w-full h-auto"
      aria-label="Página UM"
    >
      <path
        fill="#e10012"
        d="M236.82 0h81.71c3.52 2.42 3.98 9.99-1.58 9.99l-79.7.01q-1.41 0-2.31-2.11-2.12-5 1.88-7.89Z"
      />
      <path
        fill={white ? "#FFFF" : "#00000"}
        d="M189.53 292.25h33.46a3.01 3.01 0 0 1 3.01 3v.87q.01 3.88-3.87 3.88H150q-3.73 0-3.86-3.73l-.04-.91a2.95 2.95 0 0 1 2.91-3.05q9.59-.12 19.24-.03c4.16.04 9.71-.5 11.34-4.87q46.12-123.53 92.22-247.07c.98-2.64 3.42-5.57 6.3-6.17 5.32-1.12 8.27 4.66 9.92 9.13l89.75 243.53c1.71 4.65 6.41 5.28 10.72 5.3q9.62.04 20.24.21a3.06 3.05 90 0 1 3.01 3.02l.01.73q.06 3.91-3.85 3.91h-98.63q-3.97 0-3.79-3.97l.03-.86a3.06 3.06 0 0 1 3.06-2.92h33.63a.17.17 0 0 0 .16-.23l-32.44-87.77q-.18-.5-.71-.5h-86.93q-.45 0-.6.42l-32.66 87.36q-.27.72.5.72Zm35.99-98.68a.32.32 0 0 0 .3.43h79.95a.32.32 0 0 0 .3-.43l-39.4-108a.32.32 0 0 0-.6 0l-40.55 108ZM565.43 49.83c7.06 4.1 19.3 10.86 23.12-1.82.87-2.91 2.1-9.07 4.39-10.99 3.72-3.11 6.55.31 6.55 4.09q.03 39.84-.01 80.81 0 4.57-4.57 4.66l-1.12.02a3.7 3.69 88.4 0 1-3.77-3.58q-.48-14.2-2.28-21.78c-8.28-34.92-36.71-53.29-71.24-55.04q-17.71-.9-31.95 3.02c-44.95 12.37-53.45 62.13-54.75 101.54-1.89 57.03-.58 147.25 82.44 143.11 27.84-1.38 53.3-19.52 59.56-47.21q1.44-6.38 1.45-19.9l.01-28.76c0-4.14-3.68-5.74-7.54-5.73q-12.9.02-26.99-.09a2.92 2.91-87.5 0 1-2.87-3.14l.07-.83q.32-3.96 4.29-3.96h93.55q3.94 0 4.28 3.92l.07.85a2.9 2.89-3 0 1-2.84 3.14q-10.46.14-19.74.12c-3.85 0-7.54 1.56-7.54 5.72q0 22.13-.03 44.25c-.01 3.61-1.02 6.01-3.22 9.12q-8.1 11.42-17.84 21.4c-22.56 23.14-56.1 35.8-88.39 32.66-61.15-5.94-101.09-60.82-108-118.18-8.21-68.21 34.02-145.4 108-152.67 22.41-2.21 47.45 3.95 66.91 15.25Zm632.9 241.9-32.31-87.46q-.2-.52-.76-.52h-86.9q-.43 0-.59.41l-32.63 87.25q-.32.84.58.84h33.2a3.07 3.07 0 0 1 3.07 2.92l.04.85q.18 3.98-3.8 3.98h-72.12q-3.89 0-3.86-3.89v-.89a2.96 2.95-89.8 0 1 2.95-2.94q10.98-.03 21.54-.27c4.08-.09 7.57-.87 9.15-5.09l91.91-246.37c3.56-9.54 12.35-7.8 15.48.68q44.92 121.73 89.92 243.44c2.02 5.46 3.99 7.32 9.78 7.44q9.78.21 21.73.16a3.02 3.02 0 0 1 3.03 2.96l.02.85q.08 3.92-3.84 3.92h-98.21q-3.89 0-4.01-3.9l-.02-.71a3.05 3.05 0 0 1 3.05-3.14h33.24q.56 0 .36-.52Zm-116.74-98.15a.31.31 0 0 0 .29.42h79.99a.31.31 0 0 0 .29-.42l-39.42-108.02a.31.31 0 0 0-.58-.01l-40.57 108.03Z"
      />
      <path
        fill="#e10012"
        d="M1533.51 70.98q-1.01-2.91-1.01.17V221q0 12.97-3.3 26.99c-12.88 54.68-71.01 65.73-117.41 53.52-36.25-9.54-54.19-38.89-54.22-75.26q-.06-78.33-.07-156.66c0-3.07-1.01-5.99-4.76-4.61q-15.94 5.88-32.23 10.72-4.58 1.35-10.9 2.36a3.59 3.59 0 0 1-4.09-2.89l-.21-1.15q-.79-4.27 3.42-5.33c27.37-6.92 55.88-17.92 79.37-33.78q1.24-.84 2.25-.85a2.11 2.1 89.5 0 1 2.13 2.1q.02 96.21.18 192.59c.04 24.53 4.44 51.52 30.89 60.92 13.04 4.63 28.13 5.33 41.67 3.71 26.94-3.22 47.84-20.34 54.01-47.13q3-13.04 3.01-28.25.02-81.41.01-162.83c0-5.13-1.89-7.42-6.97-7.41q-13.53.03-27.24-.08a3.06 3.06 0 0 1-3.04-3.04v-.73q-.02-4.15 4.13-4.15 32.91-.02 64.62-.06c4.64 0 5.37 2.72 6.86 6.9q35.25 99.24 70.81 198.37.22.62.45 0 47.93-131.25 72.92-200.96 1.51-4.21 5.71-4.22 31.77-.05 64.38-.03 4.12 0 4.12 4.12v.81a3.03 3.03 0 0 1-3.02 3.03l-26.83.06c-4.15 0-7.9 1.43-7.9 5.97V286c0 5.19 4.01 6.25 8.59 6.24q12.76-.03 26.2.07a2.98 2.98 0 0 1 2.96 2.98v.96q0 4-4 4h-101.27q-3.96 0-4.48-3.93l-.11-.83a2.77 2.77 0 0 1 2.7-3.13q13.31-.2 26.32-.11c5.41.03 8.34-1.44 8.34-7.11V69.7q0-.63-.53-.29-.35.22-.66 1.1-40.86 115.01-81.79 230-1.6 4.47-6.7 3.21c-2.53-.62-4.39-6.5-5.25-8.98q-39.15-112.59-78.06-223.76Z"
      />
      <path
        fill={white ? "#FFFF" : "#00000"}
        d="M73.31 185.14q-.19 50.11-.02 100.23c.02 5.04 2.33 6.88 7.21 6.87q13.77-.02 27.48.05a2.91 2.9-88.4 0 1 2.88 3.05l-.05.83q-.19 3.83-4.03 3.83H4.87Q.99 300 1 296.12v-.93a2.92 2.92 0 0 1 2.91-2.91q14.11-.07 28.33-.01c4.8.01 6.01-3.96 6.01-8.24V55.9c0-5.86-1.86-8.16-7.67-8.15q-13.32.02-26.66-.02A2.94 2.93 90 0 1 1 44.8v-.96q-.01-3.87 3.87-3.87l92.62.05q13.94 0 19.99.55c37.44 3.4 74.45 21.53 77.8 63.67 3.64 45.65-26.8 71.24-68.27 78.11-17.68 2.94-35.34 2.01-53.16 2.24q-.54 0-.54.55Zm24.94-8.64c20.02.02 38.89-8.01 48.61-26.05q3.91-7.27 6.24-18.92 4.83-24.26-1.6-47.53c-5.69-20.6-21.03-31.78-41.38-35.07-10.31-1.67-21.19-1.25-31.63-1.15-3.5.04-5.23 3.4-5.23 6.77q-.02 60.73-.01 121.54a.4.4 0 0 0 .4.4q12.23-.01 24.6.01Zm568.5-120.92c0-3.53-.98-7.54-5.25-7.6q-14.48-.21-29.04-.25a2.96 2.96 0 0 1-2.95-2.86l-.04-.91q-.14-3.96 3.82-3.96h101.99q3.84 0 4.03 3.84l.04.82a2.91 2.9 88.4 0 1-2.88 3.05q-14.7.07-29.22.05c-3.72-.01-5.5 3.29-5.5 6.85v230.54c0 4.93 2.13 7.07 6.91 7.08q13.83.01 27.8.05a2.91 2.9-88.5 0 1 2.89 3.05l-.04.83q-.19 3.84-4.03 3.84H633.29q-3.97 0-3.82-3.96l.04-.91a2.97 2.96 1 0 1 2.96-2.85q14.3-.06 28.53-.02c4.13.01 5.75-3.71 5.75-7.55V55.58Zm150.04 14.93q-.13 106.83-.01 214.34c0 4.89 2.06 7.38 6.93 7.39l27.43.03a2.94 2.94 0 0 1 2.94 3.04l-.03.99q-.12 3.7-3.82 3.7H773q-3.75 0-3.75-3.75v-1a2.98 2.97-.2 0 1 2.97-2.98q13.37-.03 26.76-.02c5.13 0 8.01-1.75 8.01-7.05q.02-114.5.01-228.99c0-5.92-1.72-8.48-7.71-8.47q-13.56.03-27.05-.01a3 2.99 0 0 1-2.99-2.98v-.97q-.01-3.81 3.8-3.8 31.71.04 63.95.02c1.53 0 3.54 2.29 4.49 3.82l120.1 193.38q.91 1.47.91-.26V55.16c0-4.95-2.07-7.39-6.97-7.39l-27.31-.04a2.98 2.97 89.7 0 1-2.97-2.95v-.89q-.04-3.89 3.86-3.89h76.93q3.89 0 4.02 3.88l.03.79a2.95 2.95 0 0 1-2.94 3.05q-14.12.06-28.4.02c-4.39-.01-6.25 2.82-6.25 7.08q-.02 122.34-.07 244.68 0 4.72-4.43 4.54c-2.43-.1-4.14-1.78-5.5-3.94L817.61 70.28q-.82-1.3-.82.23Z"
      />
    </svg>
  );
}
