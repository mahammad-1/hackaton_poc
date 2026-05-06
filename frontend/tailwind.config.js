/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scanne tous ces fichiers pour purger les classes inutilisées au build
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Palette personnalisée "neuro-clinical dark"
      colors: {
        navy: {
          950: '#060a14',
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
        },
        energy: {
          high: '#10b981',   // vert émeraude = haute énergie
          medium: '#f59e0b', // ambre = énergie moyenne
          low: '#ef4444',    // rouge = basse énergie / à éviter
        },
        accent: '#818cf8',   // indigo doux = couleur principale d'accent
        muted: '#8b949e',    // texte secondaire
      },
      // Polices importées depuis Google Fonts (voir index.html)
      fontFamily: {
        sans: ['Sora', 'sans-serif'],       // Corps de texte
        mono: ['DM Mono', 'monospace'],     // Données, scores, horaires
        display: ['Sora', 'sans-serif'],    // Titres
      },
      // Animation personnalisée pour la jauge de score
      keyframes: {
        'gauge-fill': {
          '0%': { 'stroke-dashoffset': '251' },
          '100%': { 'stroke-dashoffset': 'var(--target-offset)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'gauge-fill': 'gauge-fill 1.2s ease-out forwards',
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
