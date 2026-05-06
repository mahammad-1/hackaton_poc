// pages/Agenda.jsx — Vue jour de l'agenda avec timeline verticale des blocs d'énergie
// Permet de naviguer entre les jours, générer les blocs et les marquer comme complétés

import { useState, useEffect } from 'react'
import { useAgenda } from '../hooks/useAgenda.js'
import useAppStore from '../store/useAppStore.js'
import EnergyBlock from '../components/EnergyBlock.jsx'

/**
 * Formate une date JS en string 'YYYY-MM-DD' (format attendu par le backend)
 * @param {Date} date
 * @returns {string}
 */
function formatDateISO(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Formate une date JS en string lisible en français
 * @param {Date} date
 * @returns {string} ex: "Mercredi 14 mai 2025"
 */
function formatDateFR(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Agenda() {
  // Date sélectionnée pour l'affichage (par défaut : aujourd'hui)
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date())

  const { loading, error, loadAgenda, generateDay, completeBlock } = useAgenda()
  const agendaBlocks = useAppStore((state) => state.agendaBlocks)

  // Chaque fois que la date change → recharge les blocs du jour
  useEffect(() => {
    const dateStr = formatDateISO(dateSelectionnee)
    loadAgenda(dateStr)
  }, [dateSelectionnee]) // La dépendance [dateSelectionnee] re-exécute l'effet à chaque changement

  /** Génère les blocs pour la date actuelle si aucun n'existe */
  const genererJour = async () => {
    const dateStr = formatDateISO(dateSelectionnee)
    await generateDay(dateStr)
  }

  /** Navigation : jour précédent */
  const jourPrecedent = () => {
    setDateSelectionnee((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  /** Navigation : jour suivant */
  const jourSuivant = () => {
    setDateSelectionnee((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  /** Revient à aujourd'hui */
  const allerAujourdhui = () => setDateSelectionnee(new Date())

  /** Vérifie si la date sélectionnée est aujourd'hui */
  const estAujourdhui =
    formatDateISO(dateSelectionnee) === formatDateISO(new Date())

  // Statistiques rapides du jour
  const blocksCompletes = agendaBlocks.filter((b) => b.completed).length
  const blocksHauteEnergie = agendaBlocks.filter((b) => b.energy_level === 'high').length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* En-tête avec navigation de date */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100 mb-4">Agenda</h1>

        {/* Sélecteur de date : boutons précédent/suivant + date centrale */}
        <div className="flex items-center gap-3">
          {/* Bouton jour précédent */}
          <button
            onClick={jourPrecedent}
            className="btn-ghost p-2"
            title="Jour précédent"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Date affichée (cliquable pour revenir à aujourd'hui) */}
          <div className="flex-1 text-center">
            <p className="text-slate-200 font-medium capitalize">
              {formatDateFR(dateSelectionnee)}
            </p>
            {!estAujourdhui && (
              <button
                onClick={allerAujourdhui}
                className="text-xs text-accent hover:underline mt-0.5"
              >
                Revenir à aujourd'hui
              </button>
            )}
          </div>

          {/* Bouton jour suivant */}
          <button
            onClick={jourSuivant}
            className="btn-ghost p-2"
            title="Jour suivant"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Légende des niveaux d'énergie */}
      <div className="flex gap-3 flex-wrap mb-5 text-xs">
        {[
          { niveau: 'high', label: 'Haute énergie', couleur: 'bg-energy-high' },
          { niveau: 'medium', label: 'Moyenne', couleur: 'bg-energy-medium' },
          { niveau: 'low', label: 'Basse énergie', couleur: 'bg-energy-low' },
          { niveau: 'avoid', label: 'À éviter', couleur: 'bg-navy-600' },
        ].map((l) => (
          <div key={l.niveau} className="flex items-center gap-1.5 text-muted">
            <div className={`w-2.5 h-2.5 rounded-full ${l.couleur}`} />
            <span>{l.label}</span>
          </div>
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-navy-800 animate-pulse-soft" />
          ))}
        </div>
      ) : agendaBlocks.length === 0 ? (
        /* État vide : aucun bloc pour ce jour */
        <div className="text-center py-16 card">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-slate-300 font-medium mb-2">
            Aucun bloc pour cette journée
          </h3>
          <p className="text-muted text-sm mb-4">
            Générez les créneaux d'énergie optimaux pour le{' '}
            {formatDateFR(dateSelectionnee)}.
          </p>
          <button onClick={genererJour} disabled={loading} className="btn-primary">
            {loading ? 'Génération...' : '⚡ Générer l\'agenda du jour'}
          </button>
        </div>
      ) : (
        <>
          {/* Statistiques rapides du jour */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="card text-center py-3">
              <p className="font-mono text-lg text-energy-high">{blocksCompletes}</p>
              <p className="text-xs text-muted mt-0.5">Blocs complétés</p>
            </div>
            <div className="card text-center py-3">
              <p className="font-mono text-lg text-slate-200">{agendaBlocks.length}</p>
              <p className="text-xs text-muted mt-0.5">Total blocs</p>
            </div>
            <div className="card text-center py-3">
              <p className="font-mono text-lg text-accent">{blocksHauteEnergie}</p>
              <p className="text-xs text-muted mt-0.5">Haute énergie</p>
            </div>
          </div>

          {/* Timeline verticale des blocs */}
          {/* relative + before: crée la ligne verticale via CSS pseudo-élément simulé */}
          <div className="space-y-2 relative">
            {/* Ligne verticale de timeline (décorative) */}
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-navy-700 pointer-events-none" />

            {agendaBlocks.map((bloc, index) => (
              <div
                key={bloc.id || index}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <EnergyBlock
                  block={bloc}
                  onComplete={completeBlock}
                />
              </div>
            ))}
          </div>

          {/* Bouton pour regénérer le jour */}
          <div className="mt-5 text-center">
            <button
              onClick={genererJour}
              className="btn-ghost text-sm"
            >
              ↻ Regénérer le planning
            </button>
          </div>
        </>
      )}
    </div>
  )
}
