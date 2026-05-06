// hooks/useUser.js — Hook personnalisé pour la gestion de l'utilisateur
// Les hooks personnalisés encapsulent la logique métier (API + état)
// et la rendent réutilisable dans n'importe quel composant.

import { useState } from 'react'
import { createUser, getUser, listUsers } from '../api/client.js'
import useAppStore from '../store/useAppStore.js'

const AUTH_STORAGE_KEY = 'neuroflow-auth'

function readAuthStore() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAuthStore(data) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
}

/**
 * useUser — fournit les fonctions et états liés à l'utilisateur.
 * Retourne : { loading, error, register, login, loadUser }
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
      const { password, ...profileData } = formData
      // Appel POST /users → le backend retourne le profil complet avec l'ID
      const profil = await createUser(profileData)
      // On stocke l'ID et le profil dans le store global (+ localStorage via persist)
      setUser(profil.id, profil)
      if (password && profil.email) {
        const authStore = readAuthStore()
        authStore[profil.email.toLowerCase()] = {
          userId: profil.id,
          password,
        }
        writeAuthStore(authStore)
      }
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
   * login — Connexion locale email+mot de passe
   * Le mot de passe est compare avec les infos enregistrees lors de l'inscription.
   */
  const login = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const normalizedEmail = (email || '').trim().toLowerCase()
      const authStore = readAuthStore()
      const authEntry = authStore[normalizedEmail]
      if (!authEntry) {
        throw new Error('Compte introuvable. Inscrivez-vous d abord.')
      }
      if (authEntry.password !== password) {
        throw new Error('Mot de passe incorrect.')
      }

      const users = await listUsers()
      const profile = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail)
      if (!profile) {
        throw new Error('Profil utilisateur introuvable sur le serveur.')
      }
      setUser(profile.id, profile)
      return profile
    } catch (err) {
      setError(err.message)
      return null
    } finally {
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

  return { loading, error, register, login, loadUser }
}
