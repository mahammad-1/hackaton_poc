// hooks/useAgenda.js — Hook pour la gestion de l'agenda journalier
// Gère la génération, le chargement et la mise à jour des blocs d'énergie

import { useState } from 'react'
import { generateAgenda, getAgenda, updateAgendaBlock } from '../api/client.js'
import useAppStore from '../store/useAppStore.js'

/**
 * useAgenda — fournit les fonctions liées à l'agenda.
 * Retourne : { loading, error, loadAgenda, generateDay, completeBlock }
 */
export function useAgenda() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { userId, setAgendaBlocks, updateAgendaBlock: updateBlockInStore } = useAppStore(
    (state) => ({
      userId: state.userId,
      setAgendaBlocks: state.setAgendaBlocks,
      updateAgendaBlock: state.updateAgendaBlock,
    })
  )

  /** Helper loading/error identique à useDiagnostic */
  const withLoading = async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * loadAgenda — Charge les blocs d'un jour spécifique
   * @param {string} date - format 'YYYY-MM-DD'
   */
  const loadAgenda = (date) =>
    withLoading(async () => {
      // GET /users/{id}/agenda?date=YYYY-MM-DD
      const blocs = await getAgenda(userId, date)
      setAgendaBlocks(blocs)
      return blocs
    })

  /**
   * generateDay — Génère les blocs d'agenda pour un jour donné
   * Utile si l'agenda n'existe pas encore pour cette date
   * @param {string} date - format 'YYYY-MM-DD'
   */
  const generateDay = (date) =>
    withLoading(async () => {
      // POST /users/{id}/agenda/generate?target_date=YYYY-MM-DD
      const blocs = await generateAgenda(userId, date)
      setAgendaBlocks(blocs)
      return blocs
    })

  /**
   * completeBlock — Marque un bloc comme complété (ou autre statut)
   * Met à jour le store localement (optimistic) ET le backend
   * @param {number} blockId
   * @param {object} changes - ex: { completed: true }
   */
  const completeBlock = async (blockId, changes) => {
    // Mise à jour optimiste : on met à jour le store AVANT la réponse du serveur
    // L'UI est ainsi réactive instantanément sans attendre le réseau
    updateBlockInStore(blockId, changes)

    try {
      await updateAgendaBlock(userId, blockId, changes)
    } catch (err) {
      // En cas d'erreur, on pourrait rollback l'état — ici on affiche juste l'erreur
      setError(err.message)
      // Rollback : restaurer l'ancien état (non implémenté pour garder le code simple)
    }
  }

  return { loading, error, loadAgenda, generateDay, completeBlock }
}
