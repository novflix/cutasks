/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        cream: { 50:'#fdfaf5', 100:'#faf4e8', 200:'#f4e8d0', 300:'#ead5b0', 400:'#ddb97a' },
        blush:  { 100:'#fde8e8', 200:'#f9c6c6', 400:'#e87878', 500:'#d45c5c' },
        sage:   { 100:'#e8f0ea', 200:'#c6d9cb', 400:'#6da07a', 500:'#4e8a5c' },
        amber:  { 100:'#fef3cd', 200:'#fde08a', 400:'#f5b800', 500:'#d9a200' },
        lav:    { 100:'#ede8f7', 200:'#d4c8f0', 400:'#9b84d8', 500:'#7c63c4' },
        ink:    { 900:'#1a1614', 800:'#2d2824', 700:'#4a4340', 500:'#7a7068', 300:'#b8afa8', 100:'#e8e3de' },
      },
      boxShadow: {
        soft: '0 2px 20px 0 rgba(0,0,0,0.06)',
        card: '0 4px 32px 0 rgba(0,0,0,0.08)',
        cozy: '0 8px 40px 0 rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        'scale-in': 'scaleIn 0.20s ease-out',
        'wiggle':   'wiggle 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn:  { from:{opacity:'0'}, to:{opacity:'1'} },
        slideUp: { from:{opacity:'0',transform:'translateY(20px) scale(0.97)'}, to:{opacity:'1',transform:'translateY(0) scale(1)'} },
        scaleIn: { from:{opacity:'0',transform:'scale(0.88)'}, to:{opacity:'1',transform:'scale(1)'} },
        wiggle:  { '0%,100%':{transform:'rotate(0deg)'},'25%':{transform:'rotate(-8deg)'},'75%':{transform:'rotate(8deg)'} },
      },
    },
  },
  plugins: [],
}
