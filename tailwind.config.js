/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridRowStart: {
        13: "13",
        14: "14",
        15: "15",
        16: "16",
        17: "17",
        18: "18",
        19: "19",
        20: "20",
        21: "21",
        22: "22",
        23: "23",
        24: "24",
        25: "25",
        26: "26",
        27: "27",
        28: "28",
        29: "29",
        30: "30",
        31: "31",
        32: "32",
        33: "33",
        34: "34",
        35: "35",
        36: "36",
        37: "37",
        38: "38",
        39: "39",
        40: "40",
        41: "41",
        42: "42",
        43: "43",
        44: "44",
        45: "45",
        46: "46",
        47: "47",
        48: "48",
        49: "49",
        50: "50",
        51: "51",
        52: "52",
        53: "53",
        54: "54",
        55: "55",
        56: "56",
      },
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "primary-light": "color-mix(in srgb, var(--color-primary) 50%, white)",
        "primary-lighter":
          "color-mix(in srgb, var(--color-primary) 25%, white)",
        "primary-lightest":
          "color-mix(in srgb, var(--color-primary) 10%, white)",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("tailwindcss-animate"),
  ],
  safelist: [
    {
      pattern: /col-start-[0-9]+/,
      variants: ["lg"],
    },
    {
      pattern: /col-span-[0-9]+/,
      variants: ["lg"],
    },
    {
      pattern: /row-start-[0-9]{1,2}/,
      variants: ["lg"],
    },
    {
      pattern: /row-span-[0-9]+/,
      variants: ["lg"],
    },
    {
      pattern: /basis-1\/[0-9]+/,
      variants: ["md"],
    },
  ],
};
