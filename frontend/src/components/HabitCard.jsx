// components/HabitCard.jsx — Carte d'affichage d'une habitude de procrastination
// La sévérité est visualisée par des barres et une couleur d'accentuation

/**
 * HabitCard — Carte affichant une habitude avec son niveau de sévérité
 * @param {object}   habit           - Données de l'habitude
 * @param {string}   habit.name      - Nom de l'habitude (ex: "Réseaux sociaux")
 * @param {string}   habit.category  - Catégorie (ex: "distraction", "évitement")
 * @param {number}   habit.severity  - Sévérité de 1 à 5
 * @param {string}   habit.frequency - Fréquence (ex: "quotidien", "plusieurs fois/jour")
 * @param {string}   habit.trigger   - Déclencheur identifié
 * @param {function} onDelete        - Callback de suppression (optionnel)
 */
export default function HabitCard({ habit, onDelete }) {
  // Mapping sévérité (1-5) → style visuel
  const severiteConfig = {
    1: { couleur: 'text-energy-high', barre: 'bg-energy-high', label: 'Légère' },
    2: { couleur: 'text-energy-high', barre: 'bg-energy-high', label: 'Faible' },
    3: { couleur: 'text-energy-medium', barre: 'bg-energy-medium', label: 'Modérée' },
    4: { couleur: 'text-energy-low', barre: 'bg-energy-low', label: 'Élevée' },
    5: { couleur: 'text-energy-low', barre: 'bg-energy-low', label: 'Critique' },
  }

  // On récupère la config pour la sévérité actuelle (avec clamp entre 1 et 5)
  const severite = Math.min(5, Math.max(1, habit.severity || 3))
  const config = severiteConfig[severite]

  return (
    <div className="card hover:border-navy-500 transition-colors duration-200 group">
      {/* En-tête : nom de l'habitude + bouton suppression */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-slate-200 font-medium text-sm">{habit.name}</h3>
          {/* Badge catégorie */}
          {habit.category && (
            <span className="badge bg-navy-700 text-muted mt-1">
              {habit.category}
            </span>
          )}
        </div>

        {/* Bouton suppression — visible au survol via group-hover */}
        {onDelete && (
          <button
            onClick={() => onDelete(habit.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded
                       text-muted hover:text-energy-low"
            title="Supprimer cette habitude"
          >
            {/* Icône × SVG */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Visualisation de la sévérité : 5 barres */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">Sévérité</span>
          <span className={`text-xs font-mono font-medium ${config.couleur}`}>
            {severite}/5 — {config.label}
          </span>
        </div>
        {/* Rangée de 5 barres : les `severite` premières sont colorées */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`
                h-1.5 flex-1 rounded-full transition-all duration-300
                ${index < severite ? config.barre : 'bg-navy-700'}
              `}
            />
          ))}
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="space-y-1.5 text-xs">
        {/* Fréquence */}
        {habit.frequency && (
          <div className="flex items-center gap-2 text-muted">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 3a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 017 9V4a1 1 0 011-1z"/>
            </svg>
            <span>{habit.frequency}</span>
          </div>
        )}

        {/* Déclencheur */}
        {habit.trigger && (
          <div className="flex items-start gap-2 text-muted">
            <svg className="w-3 h-3 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v4a1 1 0 01-2 0V4a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            <span className="italic">Déclenché par : {habit.trigger}</span>
          </div>
        )}
      </div>
    </div>
  )
}
