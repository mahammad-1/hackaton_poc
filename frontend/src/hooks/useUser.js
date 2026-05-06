// hooks/useUser.js — Hook personnalisé pour la gestion de l'utilisateur
// Les hooks personnalisés encapsulent la logique métier (API + état)
// et la rendent réutilisable dans n'importe quel composant.

import { useState } from 'react'
import { createUser, getUser } from '../api/client.js'
import useAppStore from '../store/useAppStore.js'

/**
 * useUser — fournit les fonctions et états liés à l'utilisateur.
 * Retourne : { loading, error, register, loadUser }
 */
export function useUser() {
  // État local pour le chargement et les erreurs (pas besoin de les globaliser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // On récupère l'action setUser depuis le store Zustand
  const setUser = useAppStore((state) => state.setUser)

  /**
   * register — Crée un nouvel utilisateur via l'API puis le stocke
   * @param {object} formData - { name, email, chronotype, ... }
   * @returns {object|null} - profil créé ou null si erreur
   */
  const register = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      // Appel POST /users → le backend retourne le profil complet avec l'ID
      const profil = await createUser(formData)
      // On stocke l'ID et le profil dans le store global (+ localStorage via persist)
      setUser(profil.id, profil)
      return profil
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      // finally garantit que loading=false même si une erreur est levée
      setLoading(false)
    }
  }

  /**
   * loadUser — Récupère un profil existant par son ID
   * Utile au chargement de l'app si l'userId est déjà dans localStorage
   * @param {number} userId
   */
  const loadUser = async (userId) => {
    setLoading(true)
    setError(null)
    try {
      const profil = await getUser(userId)
      setUser(profil.id, profil)
      return profil
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, register, loadUser }
}
