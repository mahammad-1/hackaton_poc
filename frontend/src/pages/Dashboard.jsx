// pages/Dashboard.jsx — Vue d'ensemble : stats, streak, graphe 30 jours, heatmap
// Toutes les données viennent des endpoints /stats et /logs du backend

import { useEffect, useMemo } from 'react'
import useAppStore from '../store/useAppStore.js'
import { getStats, getLogs, createLog } from '../api/client.js'
import { useState } from 'react'

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

  /**
   * Prépare les données du graphe : 30 dernières entrées de logs
   * On utilise useMemo pour ne recalculer que si `logs` change
   */
  const donneesGraphe = useMemo(() => {
    // Trie par date ascendante et prend les 30 dernières
    return [...logs]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30)
  }, [logs])

  /**
   * Données pour la heatmap annuelle
   * On compte le nombre d'entrées par jour sur l'année en cours
   */
  const donneesHeatmap = useMemo(() => {
    const anneeActuelle = new Date().getFullYear()
    const comptes = {}

    logs.forEach((log) => {
      const dateStr = log.date?.split('T')[0]
      if (dateStr && new Date(dateStr).getFullYear() === anneeActuelle) {
        comptes[dateStr] = (comptes[dateStr] || 0) + 1
      }
    })
    return comptes
  }, [logs])

  /**
   * Génère toutes les semaines de l'année courante pour la heatmap
   * Retourne un tableau de semaines, chaque semaine étant un tableau de 7 dates
   */
  const semainesAnnee = useMemo(() => {
    const semaines = []
    const debut = new Date(new Date().getFullYear(), 0, 1) // 1er janvier
    const fin = new Date()

    // On commence au premier lundi de l'année
    const premierLundi = new Date(debut)
    premierLundi.setDate(debut.getDate() - debut.getDay() + 1)

    let dateCourante = new Date(premierLundi)
    let semaine = []

    while (dateCourante <= fin) {
      semaine.push(new Date(dateCourante))
      if (semaine.length === 7) {
        semaines.push(semaine)
        semaine = []
      }
      dateCourante.setDate(dateCourante.getDate() + 1)
    }
    if (semaine.length > 0) semaines.push(semaine)

    return semaines
  }, [])

  /**
   * Renvoie la classe CSS de couleur pour une cellule de heatmap
   * selon le nombre d'entrées ce jour-là
   */
  const couleurHeatmap = (dateStr) => {
    const count = donneesHeatmap[dateStr] || 0
    if (count === 0) return 'bg-navy-800'
    if (count === 1) return 'bg-energy-high/30'
    if (count === 2) return 'bg-energy-high/60'
    return 'bg-energy-high'
  }

  /**
   * MiniGraphe SVG — Graphe en courbes pour énergie/focus/humeur sur 30 jours
   * Dessiné en SVG pur (pas de lib) : calcul des points → polyline
   */
  function MiniGraphe({ donnees, cle, couleur, label }) {
    if (donnees.length < 2) {
      return (
        <div className="flex items-center justify-center h-16 text-xs text-muted">
          Pas assez de données
        </div>
      )
    }

    const largeur = 300
    const hauteur = 60
    const maxVal = 5 // Les scores sont sur 5

    // Calcul des coordonnées pour chaque point de données
    const points = donnees.map((d, i) => {
      const x = (i / (donnees.length - 1)) * largeur
      const valeur = d[cle] || 0
      // SVG : y=0 est en haut, donc on inverse : valeur haute → y faible
      const y = hauteur - (valeur / maxVal) * hauteur
      return `${x},${y}`
    })

    const pointsStr = points.join(' ')

    return (
      <div>
        <div className="flex items-center justify-between mb-1 text-xs">
          <span className="text-muted">{label}</span>
          <span className="font-mono" style={{ color: couleur }}>
            {/* Valeur la plus récente */}
            {donnees.length > 0 ? (donnees[donnees.length - 1][cle] || 0).toFixed(1) : '—'}/5
          </span>
        </div>
        <svg
          viewBox={`0 0 ${largeur} ${hauteur}`}
          className="w-full"
          style={{ height: '60px' }}
          preserveAspectRatio="none"
        >
          {/* Zone remplie sous la courbe */}
          <defs>
            <linearGradient id={`grad-${cle}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={couleur} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={couleur} stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Ligne de grille horizontale à mi-hauteur */}
          <line x1="0" y1={hauteur / 2} x2={largeur} y2={hauteur / 2}
                stroke="#21262d" strokeWidth="1" strokeDasharray="4,4"/>

          {/* Zone de remplissage (area chart) */}
          <polygon
            points={`0,${hauteur} ${pointsStr} ${largeur},${hauteur}`}
            fill={`url(#grad-${cle})`}
          />

          {/* Ligne de la courbe */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke={couleur}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point final mis en valeur */}
          {points.length > 0 && (() => {
            const dernierPoint = points[points.length - 1].split(',')
            return (
              <circle
                cx={dernierPoint[0]}
                cy={dernierPoint[1]}
                r="3"
                fill={couleur}
              />
            )
          })()}
        </svg>
      </div>
    )
  }

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
          {/* ── Métriques principales ────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
                {stats?.best_streak ?? 0}
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

            {/* Total des logs */}
            <div className="card text-center animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="font-mono text-3xl text-slate-300 mb-1">
                {logs.length}
              </div>
              <p className="text-xs text-muted">Entrées de journal</p>
              <p className="text-[10px] text-muted mt-0.5">📔 Total</p>
            </div>
          </div>

          {/* ── Graphes des scores sur 30 jours ─────────────────────── */}
          <div className="card mb-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-200">
                Évolution sur 30 jours
              </h2>
              <span className="text-xs text-muted font-mono">
                {donneesGraphe.length} entrée(s)
              </span>
            </div>

            <div className="space-y-5">
              <MiniGraphe
                donnees={donneesGraphe}
                cle="energie"
                couleur="#10b981"
                label="⚡ Énergie"
              />
              <MiniGraphe
                donnees={donneesGraphe}
                cle="focus"
                couleur="#818cf8"
                label="🎯 Focus"
              />
              <MiniGraphe
                donnees={donneesGraphe}
                cle="humeur"
                couleur="#f59e0b"
                label="😊 Humeur"
              />
            </div>
          </div>

          {/* ── Heatmap annuelle ─────────────────────────────────────── */}
          <div className="card mb-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-200">
                Activité {new Date().getFullYear()}
              </h2>
              {/* Légende de la heatmap */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted">
                <span>Moins</span>
                {['bg-navy-800', 'bg-energy-high/30', 'bg-energy-high/60', 'bg-energy-high'].map((c, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                ))}
                <span>Plus</span>
              </div>
            </div>

            {/* Grille de la heatmap : semaines en colonnes, jours en lignes */}
            <div className="overflow-x-auto">
              <div className="flex gap-0.5 min-w-max">
                {semainesAnnee.map((semaine, si) => (
                  <div key={si} className="flex flex-col gap-0.5">
                    {semaine.map((jour, ji) => {
                      const dateStr = jour.toISOString().split('T')[0]
                      const count = donneesHeatmap[dateStr] || 0
                      return (
                        <div
                          key={ji}
                          title={`${dateStr} — ${count} entrée(s)`}
                          className={`w-2.5 h-2.5 rounded-sm ${couleurHeatmap(dateStr)} cursor-default`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Formulaire d'entrée de journal rapide ──────────────── */}
          <div className="card animate-fade-up">
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
