/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#2563eb', // blue-600
          'primary-hover': '#1d4ed8', // blue-700
          secondary: '#9333ea', // purple-600
          'secondary-hover': '#7e22ce', // purple-700
          success: '#16a34a', // green-600
          'success-hover': '#15803d', // green-700
        },
        // Section colors
        section: {
          personal: '#dbeafe', // blue-100
          'personal-text': '#2563eb', // blue-600
          contact: '#dcfce7', // green-100
          'contact-text': '#16a34a', // green-600
          skin: '#fce7f3', // pink-100
          'skin-text': '#db2777', // pink-600
          statistics: '#e0e7ff', // indigo-100
          'statistics-text': '#4f46e5', // indigo-600
        },
        // Status colors
        status: {
          active: {
            bg: '#dcfce7', // green-100
            text: '#166534', // green-800
          },
          inactive: {
            bg: '#f3f4f6', // gray-100
            text: '#1f2937', // gray-800
          },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #2563eb, #4f46e5)', // blue-600 to indigo-600
        'gradient-secondary': 'linear-gradient(to right, #9333ea, #ec4899)', // purple-600 to pink-600
        'gradient-success': 'linear-gradient(to right, #16a34a, #059669)', // green-600 to emerald-600
        'gradient-page': 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', // blue-50 to indigo-100
      },
    },
  },
  plugins: [],
}
