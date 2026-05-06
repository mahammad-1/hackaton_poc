// pages/Dashboard.jsx — Vue d'ensemble : stats, streak, graphe 30 jours, heatmap
// Toutes les données viennent des endpoints /stats et /logs du backend

import { useEffect, useMemo } from 'react'
import useAppStore from '../store/useAppStore.js'
import { getStats, getLogs, createLog } from '../api/client.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formLog, setFormLog] = useState({ energie: 3, focus: 3, humeur: 3, note: '' })

  const { userId, stats, logs, setStats, setLogs } = useAppStore((state) => ({
    userId: state.userId,
    stats: state.stats,
    logs: state.logs,
    setStats: state.setStats,
    setLogs: state.setLogs,
  }))

  // Chargement des stats et logs au montage
  useEffect(() => {
    const charger = async () => {
      setLoading(true)
      try {
        // On lance les deux requêtes en parallèle avec Promise.all
        // Plus rapide que d'attendre la première avant de lancer la seconde
        const [statsData, logsData] = await Promise.all([
          getStats(userId),
          getLogs(userId),
        ])
        setStats(statsData)
        setLogs(logsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [])

  /** Enregistre une entrée de journal (énergie, focus, humeur du jour) */
  const enregistrerLog = async () => {
    const today = new Date().toISOString().split('T')[0]
    const existingToday = logs.some((log) => (log.date || '').split('T')[0] === today)
    if (existingToday) {
      setError(`Une entrée existe déjà pour le ${today}.`)
      return
    }

    try {
      const log = await createLog(userId, {
        ...formLog,
        date: today,
      })
      setLogs([...logs, log])
    } catch (err) {
      setError(err.message)
    }
  }

  const bestStreakFromLogs = useMemo(() => {
    if (!logs.length) return 0
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date))
    let current = 0
    let best = 0
    sorted.forEach((log) => {
      if (!log.procrastinated) {
        current += 1
        best = Math.max(best, current)
      } else {
        current = 0
      }
    })
    return best
  }, [logs])

  const insightDuJour = useMemo(() => {
    const latest = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    if (!latest) return "Commence par une entrée du jour pour débloquer des insights personnalisés."
    if ((latest.focus ?? 0) <= 2) return "Focus bas : démarre par un bloc de 15 minutes sur ta tâche prioritaire."
    if ((latest.energie ?? 0) <= 2) return "Énergie basse : fais une micro-pause active de 5 minutes avant de reprendre."
    if (latest.procrastinated) return "Tu as procrastiné aujourd'hui : applique la règle des 2 minutes pour relancer l'élan."
    return "Belle dynamique aujourd'hui. Profite du momentum pour finir une tâche importante."
  }, [logs])

  const latestLog = useMemo(
    () => [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null,
    [logs]
  )

  const progressionJour = useMemo(() => {
    if (!latestLog) return 0
    const score = Math.round((((latestLog.energie || 0) + (latestLog.focus || 0)) / 10) * 100)
    return Math.max(0, Math.min(100, score))
  }, [latestLog])

  const prochaineAction = useMemo(() => {
    if (!latestLog) {
      return {
        titre: "Créer ton entrée du jour",
        description: "Commence par renseigner énergie, focus et humeur pour activer les recommandations.",
        cta: "Faire mon check-in",
        to: "journal",
      }
    }
    if (latestLog.procrastinated) {
      return {
        titre: "Relancer l'élan maintenant",
        description: "Fais une session de 15 minutes sur la tâche la plus importante, sans viser la perfection.",
        cta: "Voir mes plans",
        to: "/app/plans",
      }
    }
    if ((latestLog.focus || 0) <= 2) {
      return {
        titre: "Remonter ton focus",
        description: "Bloque 25 minutes de concentration et coupe les distractions pendant ce bloc.",
        cta: "Optimiser ma journée",
        to: "/app/agenda",
      }
    }
    return {
      titre: "Capitaliser sur ta dynamique",
      description: "Tu es dans un bon rythme : exécute une action de plan pour consolider ta progression.",
      cta: "Voir mes plans",
      to: "/app/plans",
    }
  }, [latestLog])

  const risques = useMemo(() => {
    const items = []
    if (!latestLog) items.push("Aucune entrée du jour enregistrée.")
    if ((stats?.completion_rate ?? 0) < 35) items.push("Taux de complétion faible cette semaine.")
    if (logs.length < 3) items.push("Peu de données : ajoute des logs pour des recommandations plus précises.")
    if ((latestLog?.energie ?? 3) <= 2) items.push("Énergie basse détectée aujourd'hui.")
    return items.slice(0, 3)
  }, [latestLog, logs.length, stats?.completion_rate])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">Dashboard</h1>
        <p className="text-muted text-sm">
          Vos tendances et statistiques de productivité
        </p>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-energy-low/10 border border-energy-low/30 text-energy-low text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 animate-pulse-soft"/>)}
        </div>
      ) : (
        <>
          <div className="card mb-6 animate-fade-up border-accent/30 bg-accent/5">
            <p className="text-[10px] uppercase tracking-wider text-accent mb-2">Prochaine action recommandée</p>
            <h2 className="text-lg font-semibold text-slate-100 mb-1">{prochaineAction.titre}</h2>
            <p className="text-sm text-muted mb-4">{prochaineAction.description}</p>
            <div className="flex items-center gap-2">
              {prochaineAction.to.startsWith('/') ? (
                <Link to={prochaineAction.to} className="btn-primary text-xs">{prochaineAction.cta}</Link>
              ) : prochaineAction.to === 'journal' ? (
                <button
                  type="button"
                  onClick={() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="btn-primary text-xs"
                >
                  {prochaineAction.cta}
                </button>
              ) : (
                <a href={prochaineAction.to} className="btn-primary text-xs">{prochaineAction.cta}</a>
              )}
              <Link to="/app/agenda" className="btn-ghost text-xs">Plan du jour</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Streak actuel */}
            <div className="card text-center animate-fade-up">
              <div className="font-mono text-3xl text-energy-medium mb-1">
                {stats?.current_streak ?? 0}
              </div>
              <p className="text-xs text-muted">Jours consécutifs</p>
              <p className="text-[10px] text-muted mt-0.5">🔥 Streak actuel</p>
            </div>

            {/* Meilleur streak */}
            <div className="card text-center animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <div className="font-mono text-3xl text-accent mb-1">
                {bestStreakFromLogs || stats?.best_streak || 0}
              </div>
              <p className="text-xs text-muted">Meilleur streak</p>
              <p className="text-[10px] text-muted mt-0.5">🏆 Record</p>
            </div>

            {/* Taux de complétion */}
            <div className="card text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="font-mono text-3xl text-energy-high mb-1">
                {stats?.completion_rate != null
                  ? `${Math.round(stats.completion_rate)}%`
                  : '—'}
              </div>
              <p className="text-xs text-muted">Taux de complétion</p>
              <p className="text-[10px] text-muted mt-0.5">✓ Blocs faits</p>
            </div>
          </div>

          <div className="card mb-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-slate-200 mb-1">Insight du jour</h2>
                <p className="text-sm text-muted">{insightDuJour}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/app/plans" className="btn-ghost text-xs">Voir mes plans</Link>
                <Link to="/app/agenda" className="btn-primary text-xs">Optimiser ma journée</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="card animate-fade-up">
              <h2 className="text-sm font-medium text-slate-200 mb-3">Progression du jour</h2>
              <div className="w-full h-2 rounded-full bg-navy-700 overflow-hidden mb-2">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${progressionJour}%` }}
                />
              </div>
              <p className="text-xs text-muted">{progressionJour}% de readiness (énergie + focus du dernier log)</p>
            </div>

            <div className="card animate-fade-up">
              <h2 className="text-sm font-medium text-slate-200 mb-3">Points d'attention</h2>
              {risques.length === 0 ? (
                <p className="text-xs text-energy-high">Aucun signal de risque majeur pour le moment.</p>
              ) : (
                <ul className="space-y-2 text-xs text-muted">
                  {risques.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Formulaire d'entrée de journal rapide ──────────────── */}
          <div id="journal" className="card animate-fade-up">
            <h2 className="text-sm font-medium text-slate-200 mb-4">
              Entrée du jour — Comment vous sentez-vous ?
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Les 3 curseurs sont générés dynamiquement pour éviter la répétition */}
              {[
                { cle: 'energie', label: '⚡ Énergie', couleur: 'text-energy-high' },
                { cle: 'focus', label: '🎯 Focus', couleur: 'text-accent' },
                { cle: 'humeur', label: '😊 Humeur', couleur: 'text-energy-medium' },
              ].map(({ cle, label, couleur }) => (
                <div key={cle}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-muted">{label}</label>
                    <span className={`font-mono text-sm font-medium ${couleur}`}>
                      {formLog[cle]}/5
                    </span>
                  </div>
                  {/* input[type=range] = slider natif HTML stylisé via Tailwind */}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formLog[cle]}
                    onChange={(e) =>
                      setFormLog((prev) => ({ ...prev, [cle]: Number(e.target.value) }))
                    }
                    className="w-full accent-indigo-400"
                  />
                </div>
              ))}
            </div>

            {/* Note libre */}
            <textarea
              value={formLog.note}
              onChange={(e) => setFormLog((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Note optionnelle sur votre journée..."
              rows={2}
              className="input resize-none mb-3"
            />

            <button onClick={enregistrerLog} className="btn-primary w-full">
              ✓ Enregistrer l'entrée du jour
            </button>
          </div>
        </>
      )}
    </div>
  )
}
