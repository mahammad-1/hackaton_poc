// PostCSS est le processeur CSS utilisé par Tailwind
// Il transforme les directives @tailwind en vrai CSS
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Ajoute automatiquement les préfixes navigateurs (-webkit- etc.)
  },
}
