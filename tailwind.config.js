/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#0F2B46',
          950: '#0a1a2e',
        },
        gold: {
          50: '#fdf9ef',
          100: '#f9f0d4',
          200: '#f2dea6',
          300: '#e9c76e',
          400: '#D4A843',
          500: '#c7932e',
          600: '#b07623',
          700: '#92571f',
          800: '#784521',
          900: '#643a1f',
          950: '#391d0e',
        },
        coral: {
          400: '#E85D3A',
          500: '#d94a28',
          600: '#b83a1e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'corporate': '0 1px 3px 0 rgba(15, 43, 70, 0.1), 0 1px 2px -1px rgba(15, 43, 70, 0.1)',
        'corporate-md': '0 4px 6px -1px rgba(15, 43, 70, 0.1), 0 2px 4px -2px rgba(15, 43, 70, 0.1)',
        'corporate-lg': '0 10px 15px -3px rgba(15, 43, 70, 0.1), 0 4px 6px -4px rgba(15, 43, 70, 0.1)',
        'corporate-xl': '0 20px 25px -5px rgba(15, 43, 70, 0.1), 0 8px 10px -6px rgba(15, 43, 70, 0.1)',
        'gold-glow': '0 0 20px rgba(212, 168, 67, 0.3)',
      },
      backgroundImage: {
        'gradient-corporate': 'linear-gradient(135deg, #0F2B46 0%, #1a3a5c 50%, #243b53 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A843 0%, #e9c76e 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0F2B46 0%, #0a1a2e 100%)',
      },
    },
  },
  plugins: [],
}
