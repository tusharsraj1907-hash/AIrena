/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scrollbar: {
        thin: {
          width: '8px',
          height: '8px',
        }
      }
    },
  },
  plugins: [
    // Custom scrollbar plugin
    function({ addUtilities }) {
      const scrollbarUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgb(71 85 105) rgb(30 41 59)',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'rgb(30 41 59)',
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: 'rgb(71 85 105)',
          'border-radius': '4px',
          border: '1px solid rgb(30 41 59)',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: 'rgb(100 116 139)',
        },
        '.scrollbar-thumb-slate-600::-webkit-scrollbar-thumb': {
          background: 'rgb(71 85 105)',
        },
        '.scrollbar-track-slate-800::-webkit-scrollbar-track': {
          background: 'rgb(30 41 59)',
        },
      };
      addUtilities(scrollbarUtilities);
    }
  ],
}