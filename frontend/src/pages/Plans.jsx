// pages/Plans.jsx — Liste des plans d'action + génération + changement de statut

import { useEffect, useMemo, useState } from 'react'
import useAppStore from '../store/useAppStore.js'
import { deleteReportPlans, generatePlan, getDiagnosticReports, getPlans, updatePlan } from '../api/client.js'
import PlanCard from '../components/PlanCard.jsx'

export default function Plans() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [reports, setReports] = useState([])
  const [collapsedReports, setCollapsedReports] = useState({})

  const { userId, plans, diagnostic, setPlans, updatePlan: updatePlanInStore } = useAppStore((state) => ({
    userId: state.userId,
    plans: state.plans,
    diagnostic: state.diagnostic,
    setPlans: state.setPlans,
    updatePlan: state.updatePlan,
  }))

  // Filtre actif : 'all' | 'pending' | 'active' | 'completed'
  const [filtre, setFiltre] = useState('all')

  // Chargement initial des plans au montage du composant
  useEffect(() => {
    chargerPlans()
  }, [userId])

  const chargerPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const [plansData, reportsData] = await Promise.all([
        getPlans(userId),
        getDiagnosticReports(userId),
      ])
      setPlans(plansData)
      setReports(reportsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /** Génère un nouveau plan d'action personnalisé via le backend */
  const genererPlan = async (reportId = null) => {
    setGenerating(true)
    setError(null)
    try {
      const cibleReportId = reportId ?? diagnostic?.report_id ?? reports[0]?.report_id
      if (!cibleReportId) {
        setError("Aucun rapport actif. Ouvre l'onglet Diagnostic puis affiche le rapport avant de générer les plans.")
        return
      }
      // POST /users/{id}/plans/generate — le backend analyse le diagnostic
      const nouveauxPlans = await generatePlan(userId, cibleReportId)
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

  const supprimerBlocRapport = async (reportId) => {
    if (reportId === 'sans_rapport') return
    const confirmed = window.confirm('Supprimer tout ce bloc de plans ? Cette action est irreversible.')
    if (!confirmed) return
    setError(null)
    try {
      await deleteReportPlans(userId, reportId)
      await chargerPlans()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleReportCollapse = (reportId) => {
    setCollapsedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }))
  }

  // Filtrage des plans selon l'onglet sélectionné
  const plansFiltres = filtre === 'all'
    ? plans
    : plans.filter((p) => p.status === filtre)

  const plansParRapport = useMemo(() => {
    const groupes = new Map()

    reports.forEach((report) => {
      groupes.set(report.report_id, [])
    })

    plansFiltres.forEach((plan) => {
      const cle = plan.report_id ?? 'sans_rapport'
      if (!groupes.has(cle)) groupes.set(cle, [])
      groupes.get(cle).push(plan)
    })
    return Array.from(groupes.entries()).sort((a, b) => {
      if (a[0] === 'sans_rapport') return 1
      if (b[0] === 'sans_rapport') return -1
      return Number(b[0]) - Number(a[0])
    })
  }, [plansFiltres, reports])

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
      ) : plansParRapport.length === 0 ? (
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
        <div className="space-y-5">
          {plansParRapport.map(([reportId, plansDuRapport], rapportIndex) => (
            <div key={reportId} className="card border border-navy-600/80">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-100">
                  {reportId === 'sans_rapport'
                    ? 'Plans sans rapport'
                    : `Rapport ${rapportIndex + 1} · Diagnostic #${reportId}`}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReportCollapse(reportId)}
                    className="btn-ghost text-sm px-2.5 py-1.5 font-mono"
                    aria-label={collapsedReports[reportId] ? 'Deplier le rapport' : 'Plier le rapport'}
                    title={collapsedReports[reportId] ? 'Deplier' : 'Plier'}
                  >
                    {collapsedReports[reportId] ? '▸' : '▾'}
                  </button>
                  <span className="badge">{plansDuRapport.length} plan(s)</span>
                  {reportId !== 'sans_rapport' && (
                    <button
                      type="button"
                      onClick={() => genererPlan(reportId)}
                      disabled={generating}
                      className="btn-primary text-xs px-2.5 py-1.5"
                    >
                      + Générer pour ce rapport
                    </button>
                  )}
                  {reportId !== 'sans_rapport' && (
                    <button
                      type="button"
                      onClick={() => supprimerBlocRapport(reportId)}
                      className="btn-ghost text-xs border-red-400/40 text-red-300 hover:bg-red-500/10"
                    >
                      Supprimer ce rapport
                    </button>
                  )}
                </div>
              </div>

              {!collapsedReports[reportId] && (
                <div className="space-y-3">
                  {plansDuRapport.length === 0 ? (
                    <p className="text-xs text-muted">
                      Aucun plan dans ce rapport pour l'instant.
                    </p>
                  ) : (
                    plansDuRapport.map((plan, index) => (
                      <div key={plan.id} className="rounded-xl border border-navy-700 bg-navy-900/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="badge">Plan {index + 1}</span>
                          <span className="text-[11px] text-muted">ID #{plan.id}</span>
                        </div>
                        <PlanCard plan={plan} onStatusChange={changerStatut} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
