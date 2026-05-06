// hooks/useDiagnostic.js — Hook pour tout le flux de diagnostic
// Gère : habitudes, causes, rapport de diagnostic

import { useState } from 'react'
import {
  createHabits, getHabits,
  createCauses, getCauses,
  getDiagnostic, getDiagnosticReports,
} from '../api/client.js'
import useAppStore from '../store/useAppStore.js'

/**
 * useDiagnostic — fournit les fonctions du diagnostic.
 * Retourne : { loading, error, saveHabits, loadHabits, saveCauses, loadCauses, loadDiagnostic }
 */
export function useDiagnostic() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Actions du store pour mettre à jour l'état global
  const { userId, setHabits, setCauses, setDiagnostic } = useAppStore((state) => ({
    userId: state.userId,
    setHabits: state.setHabits,
    setCauses: state.setCauses,
    setDiagnostic: state.setDiagnostic,
  }))

  /**
   * Helper interne : exécute une fonction async avec gestion loading/error
   * Évite la répétition du pattern try/catch/finally dans chaque fonction
   */
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

  /** Envoie les habitudes au backend et met à jour le store */
  const saveHabits = (habitsData) =>
    withLoading(async () => {
      // POST /users/{id}/habits — habitsData = liste d'objets habitude
      const resultat = await createHabits(userId, habitsData)
      setHabits(resultat)
      return resultat
    })

  /** Charge les habitudes existantes depuis le backend */
  const loadHabits = () =>
    withLoading(async () => {
      const habitudes = await getHabits(userId)
      setHabits(habitudes)
      return habitudes
    })

  /** Envoie les causes identifiées */
  const saveCauses = (causesData) =>
    withLoading(async () => {
      const resultat = await createCauses(userId, causesData)
      setCauses(resultat)
      return resultat
    })

  /** Charge les causes existantes */
  const loadCauses = () =>
    withLoading(async () => {
      const causesResult = await getCauses(userId)
      setCauses(causesResult)
      return causesResult
    })

  /**
   * Charge le rapport de diagnostic complet.
   * Le backend calcule le score 0-100, la cause dominante et les insights.
   */
  const loadDiagnostic = () =>
    withLoading(async () => {
      const rapport = await getDiagnostic(userId)
      setDiagnostic(rapport)
      return rapport
    })

  const loadDiagnosticReports = () =>
    withLoading(async () => getDiagnosticReports(userId))

  return {
    loading,
    error,
    saveHabits,
    loadHabits,
    saveCauses,
    loadCauses,
    loadDiagnostic,
    loadDiagnosticReports,
  }
}
