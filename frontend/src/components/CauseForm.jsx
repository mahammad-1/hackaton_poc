// components/CauseForm.jsx — Formulaire d'identification des causes de procrastination
// Utilise des selects contrôlés par React pour chaque dimension de cause

import { useState } from 'react'

// Options disponibles pour chaque dimension (selon la taxonomie neuroscientifique)
const OPTIONS_CAUSES = {
  type: [
    { valeur: 'fear_failure', label: 'Peur de l\'échec' },
    { valeur: 'perfectionism', label: 'Perfectionnisme' },
    { valeur: 'overwhelm', label: 'Sentiment de surcharge' },
    { valeur: 'low_interest', label: 'Manque d\'intérêt/motivation' },
    { valeur: 'decision_paralysis', label: 'Paralysie décisionnelle' },
    { valeur: 'low_self_efficacy', label: 'Faible sentiment d\'auto-efficacité' },
    { valeur: 'anxiety', label: 'Anxiété de performance' },
    { valeur: 'reward_insensitivity', label: 'Insensibilité aux récompenses futures' },
  ],
  intensite: [
    { valeur: 1, label: '1 — Très légère' },
    { valeur: 2, label: '2 — Légère' },
    { valeur: 3, label: '3 — Modérée' },
    { valeur: 4, label: '4 — Forte' },
    { valeur: 5, label: '5 — Très forte' },
  ],
  contexte: [
    { valeur: 'work', label: 'Travail / Études' },
    { valeur: 'personal', label: 'Projets personnels' },
    { valeur: 'health', label: 'Santé / Sport' },
    { valeur: 'social', label: 'Relations sociales' },
    { valeur: 'finances', label: 'Gestion financière' },
    { valeur: 'household', label: 'Tâches ménagères' },
  ],
}

/**
 * CauseForm — Formulaire ajout d'une cause
 * @param {function} onSubmit   - Callback appelé avec les données de la cause
 * @param {boolean}  loading    - Désactive le bouton pendant l'envoi
 */
export default function CauseForm({ onSubmit, loading = false }) {
  // État du formulaire : un objet avec une clé par champ
  // useState avec un objet → mise à jour partielle avec spread
  const [formData, setFormData] = useState({
    type: '',
    intensite: 3,
    contexte: '',
    description: '',
  })

  /**
   * Handler générique pour tous les inputs/selects
   * e.target.name correspond à l'attribut name="" du champ
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev, // On garde les autres champs intacts
      // Conversion en number pour les champs numériques
      [name]: name === 'intensite' ? Number(value) : value,
    }))
  }

  /** Validation simple avant envoi */
  const peutSoumettre = formData.type && formData.contexte && !loading

  /** Handler de soumission */
  const handleSubmit = (e) => {
    e.preventDefault() // Empêche le rechargement de page (comportement natif des forms)
    if (!peutSoumettre) return
    onSubmit(formData)
    // Réinitialisation du formulaire après soumission
    setFormData({ type: '', intensite: 3, contexte: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sélecteur de type de cause */}
      <div>
        <label className="block text-xs text-muted mb-1.5 font-medium">
          Type de cause *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Sélectionner une cause...</option>
          {OPTIONS_CAUSES.type.map((opt) => (
            <option key={opt.valeur} value={opt.valeur}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ligne : intensité + contexte côte à côte */}
      <div className="grid grid-cols-2 gap-3">
        {/* Intensité */}
        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">
            Intensité *
          </label>
          <select
            name="intensite"
            value={formData.intensite}
            onChange={handleChange}
            className="input"
          >
            {OPTIONS_CAUSES.intensite.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contexte */}
        <div>
          <label className="block text-xs text-muted mb-1.5 font-medium">
            Contexte *
          </label>
          <select
            name="contexte"
            value={formData.contexte}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Domaine...</option>
            {OPTIONS_CAUSES.contexte.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description libre (optionnelle) */}
      <div>
        <label className="block text-xs text-muted mb-1.5 font-medium">
          Description personnelle <span className="text-navy-600">(optionnel)</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez cette situation en vos mots..."
          rows={2}
          className="input resize-none"
        />
      </div>

      {/* Bouton soumission */}
      <button
        type="submit"
        disabled={!peutSoumettre}
        className="btn-primary w-full"
      >
        {loading ? (
          // Indicateur de chargement inline
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Enregistrement...
          </span>
        ) : (
          '+ Ajouter cette cause'
        )}
      </button>
    </form>
  )
}
