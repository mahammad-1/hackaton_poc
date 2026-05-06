// pages/Diagnostic.jsx — Page de diagnostic complet
// 3 onglets : Habitudes → Causes → Rapport
// Chaque onglet sauvegarde ses données avant de passer au suivant

import { useState, useEffect } from 'react'
import { useDiagnostic } from '../hooks/useDiagnostic.js'
import useAppStore from '../store/useAppStore.js'
import HabitCard from '../components/HabitCard.jsx'
import CauseForm from '../components/CauseForm.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'

// Habitudes prédéfinies (l'utilisateur peut les sélectionner + personnaliser)
const HABITUDES_PREDEFINIES = [
  { name: 'Réseaux sociaux', category: 'distraction', severity: 4, frequency: 'Plusieurs fois/jour', trigger: 'Ennui, anxiété' },
  { name: 'Vidéos & streaming', category: 'distraction', severity: 3, frequency: 'Quotidien', trigger: 'Fatigue, fin de tâche' },
  { name: 'Gestion excessive des emails', category: 'fuite', severity: 2, frequency: 'Matin', trigger: 'Tâches difficiles' },
  { name: 'Nettoyage/rangement', category: 'évitement', severity: 2, frequency: 'Avant travail', trigger: 'Démarrage difficile' },
  { name: 'Surplanification', category: 'évitement', severity: 3, frequency: 'Quotidien', trigger: 'Peur de l\'échec' },
  { name: 'Pause excessive', category: 'distraction', severity: 3, frequency: 'Plusieurs fois/jour', trigger: 'Tâche monotone' },
]

// Labels explicatifs pour les causes — utilisés dans l'affichage du rapport
const LABELS_CAUSES = {
  fear_failure: 'Peur de l\'échec',
  perfectionism: 'Perfectionnisme',
  overwhelm: 'Surcharge cognitive',
  low_interest: 'Manque d\'intérêt',
  decision_paralysis: 'Paralysie décisionnelle',
  low_self_efficacy: 'Faible auto-efficacité',
  anxiety: 'Anxiété de performance',
  reward_insensitivity: 'Insensibilité aux récompenses',
}

export default function Diagnostic() {
  // Onglet actif : 'habits' | 'causes' | 'rapport'
  const [onglet, setOnglet] = useState('habits')

  // Habitudes sélectionnées par l'utilisateur (depuis les prédéfinies)
  const [habitudesSelectionnees, setHabitudesSelectionnees] = useState([])

  // Liste des causes soumises dans la session actuelle
  const [causesSession, setCausesSession] = useState([])

  const { loading, error, saveHabits, loadHabits, saveCauses, loadDiagnostic, loadDiagnosticReports } = useDiagnostic()
  const [rapportsHistorique, setRapportsHistorique] = useState([])

  // Données du store Zustand
  const { habits, diagnostic } = useAppStore((state) => ({
    habits: state.habits,
    diagnostic: state.diagnostic,
  }))

  // Au montage : charge les habitudes existantes si disponibles
  useEffect(() => {
    loadHabits()
  }, []) // [] = exécuté une seule fois au montage du composant

  /** Ajoute ou retire une habitude prédéfinie de la sélection */
  const toggleHabitude = (habitude) => {
    setHabitudesSelectionnees((prev) => {
      const dejaPresente = prev.some((h) => h.name === habitude.name)
      if (dejaPresente) {
        return prev.filter((h) => h.name !== habitude.name)
      }
      return [...prev, { ...habitude, id: Date.now() }]
    })
  }

  /** Sauvegarde les habitudes et passe à l'onglet Causes */
  const sauvegarderHabitudes = async () => {
    if (habitudesSelectionnees.length === 0) return
    const resultat = await saveHabits(habitudesSelectionnees)
    if (resultat) setOnglet('causes')
  }

  /** Reçoit une cause depuis CauseForm et l'ajoute à la session */
  const ajouterCause = async (causeData) => {
    const nouvelleCause = { ...causeData, id: Date.now() }
    setCausesSession((prev) => [...prev, nouvelleCause])
    // Envoi immédiat au backend (une cause à la fois)
    await saveCauses([nouvelleCause])
  }

  /** Charge le rapport de diagnostic */
  const voirRapport = async () => {
    const nouveauRapport = await loadDiagnostic()
    if (nouveauRapport) {
      const rapports = await loadDiagnosticReports()
      if (rapports) setRapportsHistorique(rapports)
    }
    setOnglet('rapport')
  }

  useEffect(() => {
    if (onglet !== 'rapport') return
    loadDiagnosticReports().then((rapports) => {
      if (rapports) setRapportsHistorique(rapports)
    })
  }, [onglet])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* En-tête de page */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">Diagnostic</h1>
        <p className="text-muted text-sm">
          Identifiez vos habitudes et les causes profondes de votre procrastination
        </p>
      </div>

      {/* Onglets de navigation */}
      <div className="flex gap-1 p-1 bg-navy-800 rounded-xl mb-6 border border-navy-700">
        {[
          { id: 'habits', label: '① Habitudes' },
          { id: 'causes', label: '② Causes' },
          { id: 'rapport', label: '③ Rapport' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOnglet(tab.id)}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
              ${onglet === tab.id
                ? 'bg-navy-950 text-slate-200 shadow-sm'
                : 'text-muted hover:text-slate-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-energy-low/10 border border-energy-low/30 text-energy-low text-sm">
          Erreur : {error}
        </div>
      )}

      {/* ── Onglet 1 : Habitudes ────────────────────────────────────── */}
      {onglet === 'habits' && (
        <div className="space-y-4 animate-fade-up">
          <p className="text-sm text-muted">
            Sélectionnez les habitudes qui vous correspondent (plusieurs choix possibles).
          </p>

          {/* Grille des habitudes prédéfinies (sélection toggle) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HABITUDES_PREDEFINIES.map((habitude) => {
              const selectionnee = habitudesSelectionnees.some((h) => h.name === habitude.name)
              return (
                <button
                  key={habitude.name}
                  type="button"
                  onClick={() => toggleHabitude(habitude)}
                  className={`
                    text-left p-4 rounded-xl border transition-all duration-150
                    ${selectionnee
                      ? 'border-accent bg-accent/10'
                      : 'border-navy-600 bg-navy-800 hover:border-navy-500'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{habitude.name}</p>
                      <p className="text-xs text-muted mt-0.5">{habitude.category}</p>
                    </div>
                    {/* Indicateur de sélection */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${selectionnee ? 'border-accent bg-accent' : 'border-navy-600'}
                    `}>
                      {selectionnee && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Barres de sévérité mini */}
                  <div className="flex gap-0.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < habitude.severity
                            ? habitude.severity >= 4 ? 'bg-energy-low' : habitude.severity === 3 ? 'bg-energy-medium' : 'bg-energy-high'
                            : 'bg-navy-700'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Compteur et bouton de validation */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted text-sm">
              {habitudesSelectionnees.length} habitude(s) sélectionnée(s)
            </span>
            <button
              onClick={sauvegarderHabitudes}
              disabled={habitudesSelectionnees.length === 0 || loading}
              className="btn-primary"
            >
              {loading ? 'Sauvegarde...' : 'Suivant : Causes →'}
            </button>
          </div>

          {/* Habitudes déjà sauvegardées */}
          {habits.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted uppercase tracking-wider mb-3">
                Habitudes enregistrées ({habits.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {habits.map((h, i) => <HabitCard key={h.id || i} habit={h} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet 2 : Causes ───────────────────────────────────────── */}
      {onglet === 'causes' && (
        <div className="space-y-5 animate-fade-up">
          <p className="text-sm text-muted">
            Identifiez les causes profondes qui déclenchent votre procrastination.
            Vous pouvez en ajouter plusieurs.
          </p>

          {/* Formulaire d'ajout de cause */}
          <div className="card">
            <h3 className="text-sm font-medium text-slate-200 mb-4">
              Ajouter une cause
            </h3>
            <CauseForm onSubmit={ajouterCause} loading={loading} />
          </div>

          {/* Causes ajoutées dans cette session */}
          {causesSession.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-3">
                Causes identifiées ({causesSession.length})
              </p>
              <div className="space-y-2">
                {causesSession.map((cause, i) => (
                  <div key={cause.id || i} className="card flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-200">
                        {LABELS_CAUSES[cause.type] || cause.type}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Intensité {cause.intensite}/5 · {cause.contexte}
                      </p>
                    </div>
                    {/* Mini jauge d'intensité */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className={`w-2 h-5 rounded-sm ${
                            j < cause.intensite ? 'bg-accent' : 'bg-navy-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton vers le rapport */}
          <div className="flex justify-end gap-3">
            <button onClick={() => setOnglet('habits')} className="btn-ghost">
              ← Retour
            </button>
            <button
              onClick={voirRapport}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Chargement...' : 'Voir mon rapport →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Onglet 3 : Rapport ──────────────────────────────────────── */}
      {onglet === 'rapport' && (
        <div className="space-y-6 animate-fade-up">
          {loading ? (
            <div className="text-center py-12 text-muted">
              <div className="animate-pulse-soft text-4xl mb-3">⟁</div>
              <p>Analyse en cours...</p>
            </div>
          ) : diagnostic ? (
            <>
              {/* Jauge de score centrale */}
              <div className="card text-center">
                <h2 className="text-slate-200 font-medium mb-4">
                  Votre score de procrastination
                </h2>
                <ScoreGauge
                  score={diagnostic.score || 0}
                  label="Indice global de procrastination"
                />
                {/* Interprétation textuelle */}
                <p className="text-muted text-sm mt-4 max-w-xs mx-auto leading-relaxed">
                  {diagnostic.interpretation ||
                    'Consultez les insights ci-dessous pour comprendre ce score.'}
                </p>
              </div>

              {/* Historique par rapport */}
              {rapportsHistorique.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs text-muted uppercase tracking-wider">
                    Historique des rapports ({rapportsHistorique.length})
                  </h3>
                  {rapportsHistorique.map((rapport, index) => (
                    <div key={rapport.report_id || index} className="card border border-navy-600/80">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-100">
                          Rapport {rapportsHistorique.length - index} · Diagnostic #{rapport.report_id}
                        </h4>
                        <span className="badge">Score {Math.round(rapport.score || 0)}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="rounded-xl border border-navy-700 bg-navy-900/40 p-3">
                          <p className="text-xs text-muted uppercase tracking-wider mb-2">
                            Habitudes ({rapport.habits_snapshot?.length || 0})
                          </p>
                          {(rapport.habits_snapshot || []).length === 0 ? (
                            <p className="text-xs text-muted">Aucune habitude dans ce rapport.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {(rapport.habits_snapshot || []).map((h, hIndex) => (
                                <p key={h.id || hIndex} className="text-sm text-slate-300">
                                  - {h.label} <span className="text-xs text-muted">({h.category})</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-navy-700 bg-navy-900/40 p-3">
                          <p className="text-xs text-muted uppercase tracking-wider mb-2">
                            Causes ({rapport.causes_snapshot?.length || 0})
                          </p>
                          {(rapport.causes_snapshot || []).length === 0 ? (
                            <p className="text-xs text-muted">Aucune cause dans ce rapport.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {(rapport.causes_snapshot || []).map((c, cIndex) => (
                                <p key={c.id || cIndex} className="text-sm text-slate-300">
                                  - {LABELS_CAUSES[c.cause_type] || c.cause_type}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {rapport.insights && rapport.insights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rapport.insights.map((insight, insightIndex) => (
                            <div key={insightIndex} className="rounded-xl border border-navy-700 bg-navy-900/40 p-3">
                              <p className="text-sm text-slate-300 leading-relaxed">
                                {typeof insight === 'string' ? insight : insight.text || insight.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CTA vers les plans d'action */}
              <div className="card bg-navy-700/50 text-center">
                <p className="text-slate-300 text-sm mb-3">
                  Prêt à agir ? Générez votre plan d'action personnalisé.
                </p>
                <a href="/app/plans" className="btn-primary inline-block">
                  Voir mes plans d'action →
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted text-sm mb-4">
                Complétez les étapes Habitudes et Causes pour générer votre rapport.
              </p>
              <button onClick={() => setOnglet('habits')} className="btn-ghost">
                ← Commencer le diagnostic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
