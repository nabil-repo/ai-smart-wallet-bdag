// tailwind.config.js
export const content = [
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./app/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      background: "#0f0f1a", // or any other background color you want
    },
  },
};
export const plugins = [];
