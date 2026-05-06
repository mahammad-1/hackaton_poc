// pages/Plans.jsx — Liste des plans d'action + génération + changement de statut

import { useEffect, useState } from 'react'
import useAppStore from '../store/useAppStore.js'
import { generatePlan, getPlans, updatePlan } from '../api/client.js'
import PlanCard from '../components/PlanCard.jsx'

export default function Plans() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const { userId, plans, setPlans, updatePlan: updatePlanInStore } = useAppStore((state) => ({
    userId: state.userId,
    plans: state.plans,
    setPlans: state.setPlans,
    updatePlan: state.updatePlan,
  }))

  // Filtre actif : 'all' | 'pending' | 'active' | 'completed'
  const [filtre, setFiltre] = useState('all')

  // Chargement initial des plans au montage du composant
  useEffect(() => {
    chargerPlans()
  }, [])

  const chargerPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPlans(userId)
      setPlans(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /** Génère un nouveau plan d'action personnalisé via le backend */
  const genererPlan = async () => {
    setGenerating(true)
    setError(null)
    try {
      // POST /users/{id}/plans/generate — le backend analyse le diagnostic
      const nouveauxPlans = await generatePlan(userId)
      if (!Array.isArray(nouveauxPlans) || nouveauxPlans.length === 0) {
        setError("Aucun plan n'a été généré. Vérifiez vos causes dans le diagnostic.")
        return
      }
      // Recharge la liste depuis le backend pour rester synchronisé.
      await chargerPlans()
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Met à jour le statut d'un plan localement ET sur le backend
   * @param {number} planId
   * @param {string} nouveauStatut - 'pending' | 'active' | 'completed'
   */
  const changerStatut = async (planId, nouveauStatut) => {
    // Mise à jour optimiste du store (l'UI réagit immédiatement)
    updatePlanInStore(planId, { status: nouveauStatut })
    try {
      await updatePlan(userId, planId, { status: nouveauStatut })
    } catch (err) {
      setError(err.message)
      // En cas d'erreur serveur, on recharge la liste pour retrouver l'état réel
      chargerPlans()
    }
  }

  // Filtrage des plans selon l'onglet sélectionné
  const plansFiltres = filtre === 'all'
    ? plans
    : plans.filter((p) => p.status === filtre)

  // Compteurs par statut pour les badges des filtres
  const compteurs = {
    all: plans.length,
    pending: plans.filter((p) => p.status === 'pending').length,
    active: plans.filter((p) => p.status === 'active').length,
    completed: plans.filter((p) => p.status === 'completed').length,
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 mb-1">Plans d'action</h1>
          <p className="text-muted text-sm">
            Protocoles personnalisés basés sur votre diagnostic
          </p>
        </div>

        {/* Bouton de génération */}
        <button
          onClick={genererPlan}
          disabled={generating}
          className="btn-primary flex-shrink-0 flex items-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Génération...
            </>
          ) : (
            '+ Nouveau plan'
          )}
        </button>
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'active', label: 'En cours' },
          { id: 'pending', label: 'En attente' },
          { id: 'completed', label: 'Complétés' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltre(f.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
              transition-colors duration-150
              ${filtre === f.id
                ? 'bg-accent text-white'
                : 'bg-navy-800 border border-navy-600 text-muted hover:text-slate-300'
              }
            `}
          >
            {f.label}
            {/* Badge compteur */}
            <span className={`
              text-[10px] font-mono px-1.5 py-0.5 rounded-full
              ${filtre === f.id ? 'bg-white/20' : 'bg-navy-700'}
            `}>
              {compteurs[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-energy-low/10 border border-energy-low/30 text-energy-low text-sm">
          Erreur : {error}
        </div>
      )}

      {/* État de chargement */}
      {loading ? (
        <div className="space-y-3">
          {/* Skeletons de chargement */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse-soft h-32" />
          ))}
        </div>
      ) : plansFiltres.length === 0 ? (
        /* État vide */
        <div className="text-center py-16 card">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-slate-300 font-medium mb-2">
            {filtre === 'all' ? 'Aucun plan généré' : `Aucun plan "${filtre}"`}
          </h3>
          <p className="text-muted text-sm mb-4">
            {filtre === 'all'
              ? 'Complétez d\'abord votre diagnostic, puis générez votre premier plan.'
              : 'Changez de filtre ou générez un nouveau plan.'}
          </p>
          {filtre === 'all' && (
            <button onClick={genererPlan} disabled={generating} className="btn-primary">
              Générer mon premier plan
            </button>
          )}
        </div>
      ) : (
        /* Liste des plans */
        <div className="space-y-4">
          {plansFiltres.map((plan) => (
            <div key={plan.id} className="animate-fade-up">
              <PlanCard plan={plan} onStatusChange={changerStatut} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
