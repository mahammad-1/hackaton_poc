// components/PlanCard.jsx — Carte d'un plan d'action avec son protocole
// Affiche le protocole détaillé et permet de changer le statut du plan

/**
 * PlanCard — Carte plan d'action
 * @param {object}   plan              - Données du plan
 * @param {string}   plan.title        - Titre du plan
 * @param {string}   plan.description  - Description de l'objectif
 * @param {string}   plan.status       - 'pending' | 'active' | 'completed'
 * @param {string}   plan.protocol     - Protocole détaillé (texte ou JSON stringifié)
 * @param {string}   plan.duration     - Durée estimée (ex: "21 jours")
 * @param {number}   plan.difficulty   - Difficulté 1-5
 * @param {string}   plan.cause_type   - Cause ciblée par ce plan
 * @param {function} onStatusChange    - Callback(planId, nouveauStatut)
 */
export default function PlanCard({ plan, onStatusChange }) {
  // Mapping statut → style
  const statutConfig = {
    pending: {
      badge: 'bg-navy-700 text-muted',
      label: 'En attente',
      icon: '○',
    },
    active: {
      badge: 'bg-accent/20 text-accent',
      label: 'En cours',
      icon: '◉',
    },
    completed: {
      badge: 'bg-energy-high/20 text-energy-high',
      label: 'Complété',
      icon: '✓',
    },
  }

  const statut = statutConfig[plan.status] || statutConfig.pending

  // Parsing du protocole : peut être une string texte ou un tableau JSON
  let etapesProtocole = []
  try {
    const parsed = JSON.parse(plan.protocol)
    // Si c'est un tableau → on l'utilise directement
    etapesProtocole = Array.isArray(parsed) ? parsed : [plan.protocol]
  } catch {
    // Si le parsing échoue → on affiche le texte brut comme une seule étape
    etapesProtocole = plan.protocol ? [plan.protocol] : []
  }

  // Couleur de difficulté (1-5 barres)
  const couleurDifficulte =
    (plan.difficulty || 1) <= 2 ? 'bg-energy-high' :
    (plan.difficulty || 1) <= 3 ? 'bg-energy-medium' :
    'bg-energy-low'

  return (
    <div
      className={`
        card transition-all duration-200
        ${plan.status === 'completed' ? 'opacity-60' : 'hover:border-navy-500'}
        ${plan.status === 'active' ? 'border-accent/40' : ''}
      `}
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Badge statut */}
            <span className={`badge ${statut.badge}`}>
              {statut.icon} {statut.label}
            </span>
            {/* Badge cause ciblée */}
            {plan.cause_type && (
              <span className="badge bg-navy-700 text-muted">
                Cible : {plan.cause_type}
              </span>
            )}
          </div>
          <h3 className="text-slate-200 font-medium">{plan.title}</h3>
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <p className="text-muted text-sm mb-4 leading-relaxed">{plan.description}</p>
      )}

      {/* Méta-informations : durée + difficulté */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        {plan.duration && (
          <div className="flex items-center gap-1.5 text-muted">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 8.414V4a1 1 0 00-2 0v5a1 1 0 00.293.707l2.5 2.5a1 1 0 001.414-1.414L9 8.414z"/>
            </svg>
            <span>{plan.duration}</span>
          </div>
        )}
        {/* Barres de difficulté */}
        {plan.difficulty && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted">Difficulté</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-1.5 rounded-full ${i < plan.difficulty ? couleurDifficulte : 'bg-navy-700'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Protocole : liste d'étapes */}
      {etapesProtocole.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-2 font-medium">
            Protocole
          </p>
          <ol className="space-y-1.5">
            {etapesProtocole.map((etape, index) => (
              <li key={index} className="flex gap-2 text-sm">
                {/* Numéro de l'étape */}
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-navy-700 text-muted
                                 text-[10px] flex items-center justify-center font-mono mt-0.5">
                  {index + 1}
                </span>
                <span className="text-slate-300">{etape}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Bouton de changement de statut */}
      {onStatusChange && plan.status !== 'completed' && (
        <div className="flex gap-2 pt-3 border-t border-navy-700">
          {plan.status === 'pending' && (
            <button
              onClick={() => onStatusChange(plan.id, 'active')}
              className="btn-primary flex-1 text-sm py-1.5"
            >
              ▶ Commencer ce plan
            </button>
          )}
          {plan.status === 'active' && (
            <>
              <button
                onClick={() => onStatusChange(plan.id, 'completed')}
                className="btn-primary flex-1 text-sm py-1.5"
              >
                ✓ Marquer comme complété
              </button>
              <button
                onClick={() => onStatusChange(plan.id, 'pending')}
                className="btn-ghost text-sm py-1.5 px-3"
              >
                Pause
              </button>
            </>
          )}
        </div>
      )}

      {/* Plan complété : message de félicitation */}
      {plan.status === 'completed' && (
        <div className="pt-3 border-t border-navy-700 text-center text-xs text-energy-high">
          🎉 Plan complété avec succès !
        </div>
      )}
    </div>
  )
}
