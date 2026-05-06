// components/EnergyBlock.jsx — Bloc d'agenda coloré selon le niveau d'énergie
// Utilisé dans la page Agenda pour la timeline verticale

/**
 * EnergyBlock — Carte d'un créneau horaire dans l'agenda
 * @param {object} block          - Données du bloc backend
 * @param {string} block.time_start     - ex: "09:00"
 * @param {string} block.time_end       - ex: "10:30"
 * @param {string} block.energy_level   - 'high' | 'medium' | 'low' | 'avoid'
 * @param {string} block.task           - Description de la tâche recommandée
 * @param {boolean} block.completed     - Si le bloc est marqué comme fait
 * @param {function} onComplete         - Callback quand on coche le bloc
 */
export default function EnergyBlock({ block, onComplete }) {
  // Mapping energy_level → style visuel (couleur de bordure + fond + badge)
  // On utilise un objet de config plutôt qu'une série de if/else : plus lisible
  const energyConfig = {
    high: {
      bordure: 'border-energy-high',
      fond: 'bg-energy-high/10',       // /10 = opacité 10% (Tailwind opacity modifier)
      badge: 'bg-energy-high/20 text-energy-high',
      point: 'bg-energy-high',
      label: 'Haute énergie',
      emoji: '⚡',
    },
    medium: {
      bordure: 'border-energy-medium',
      fond: 'bg-energy-medium/10',
      badge: 'bg-energy-medium/20 text-energy-medium',
      point: 'bg-energy-medium',
      label: 'Énergie moyenne',
      emoji: '🌤',
    },
    low: {
      bordure: 'border-energy-low',
      fond: 'bg-energy-low/10',
      badge: 'bg-energy-low/20 text-energy-low',
      point: 'bg-energy-low',
      label: 'Basse énergie',
      emoji: '🌙',
    },
    avoid: {
      bordure: 'border-energy-low',
      fond: 'bg-energy-low/5',
      badge: 'bg-navy-700 text-muted',
      point: 'bg-navy-600',
      label: 'À éviter',
      emoji: '⛔',
    },
  }

  // On récupère le config du niveau courant, avec fallback sur 'medium' si inconnu
  const config = energyConfig[block.energy_level] || energyConfig.medium

  return (
    <div
      className={`
        relative flex gap-4 p-4 rounded-xl border-l-4
        ${config.bordure} ${config.fond}
        ${block.completed ? 'opacity-50' : ''}
        transition-all duration-200 hover:scale-[1.01]
      `}
    >
      {/* Colonne des horaires — police monospace pour l'alignement des chiffres */}
      <div className="flex-shrink-0 w-16 text-right">
        <span className="font-mono text-xs text-muted block">{block.time_start}</span>
        <span className="font-mono text-xs text-navy-600 block">↓</span>
        <span className="font-mono text-xs text-muted block">{block.time_end}</span>
      </div>

      {/* Ligne verticale de connexion entre les blocs */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${config.point}`} />
      </div>

      {/* Contenu du bloc */}
      <div className="flex-1 min-w-0">
        {/* Badge niveau d'énergie */}
        <span className={`badge ${config.badge} mb-2`}>
          {config.emoji} {config.label}
        </span>

        {/* Description de la tâche recommandée */}
        <p className={`text-sm text-slate-200 ${block.completed ? 'line-through' : ''}`}>
          {block.task || 'Aucune tâche assignée'}
        </p>

        {/* Notes supplémentaires du bloc si disponibles */}
        {block.notes && (
          <p className="text-xs text-muted mt-1 italic">{block.notes}</p>
        )}
      </div>

      {/* Bouton de complétion — checkbox personnalisée */}
      {onComplete && block.energy_level !== 'avoid' && (
        <button
          onClick={() => onComplete(block.id, { completed: !block.completed })}
          className={`
            flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200
            flex items-center justify-center self-start mt-0.5
            ${block.completed
              ? `${config.point} border-transparent text-white`
              : `border-navy-600 hover:border-accent`
            }
          `}
          title={block.completed ? 'Marquer comme non fait' : 'Marquer comme fait'}
        >
          {block.completed && (
            // Icône checkmark SVG inline
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
