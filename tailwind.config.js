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
  		colors: {
  			primary: 'var(--color-primary)',
  			'primary-dark': 'var(--color-primary-dark)',
  			'primary-light': 'color-mix(in srgb, var(--color-primary) 50%, white)',
  			'primary-lighter': 'color-mix(in srgb, var(--color-primary) 25%, white)',
  			'primary-lightest': 'color-mix(in srgb, var(--color-primary) 10%, white)'
  		},
  		fontFamily: {
  			serif: [
  				'Playfair Display',
  				'serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("@tailwindcss/container-queries"), require("tailwindcss-animate")],
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
      pattern: /row-start-[0-9]+/,
      variants: ["lg"],
    },
    {
      pattern: /row-span-[0-9]+/,
      variants: ["lg"],
    },
  ],
};
