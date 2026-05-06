// store/useAppStore.js — Store global Zustand
// Zustand est une bibliothèque de state management légère.
// Contrairement à Redux, pas de boilerplate : un simple hook suffit.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// create() définit le store. La fonction reçoit `set` pour modifier l'état.
const useAppStore = create(
  // persist() est un middleware Zustand qui sauvegarde automatiquement
  // certaines clés dans localStorage, ici uniquement `userId`.
  persist(
    (set) => ({
      // ── État utilisateur ──────────────────────────────────────────────
      userId: null,          // ID de l'utilisateur connecté (persisté en localStorage)
      userProfile: null,     // Données complètes du profil (nom, chronotype, etc.)

      // ── État diagnostic ───────────────────────────────────────────────
      habits: [],            // Liste des habitudes de procrastination
      causes: [],            // Liste des causes identifiées
      diagnostic: null,      // Rapport complet { score, cause_dominante, insights }

      // ── État plans d'action ───────────────────────────────────────────
      plans: [],             // Liste des plans générés par le backend

      // ── État agenda ───────────────────────────────────────────────────
      agendaBlocks: [],      // Blocs du jour sélectionné

      // ── État journal & stats ──────────────────────────────────────────
      logs: [],              // Entrées du journal quotidien
      stats: null,           // Stats agrégées (streaks, moyennes sur 30j)

      // ── Actions (fonctions pour modifier l'état) ─────────────────────

      /** Définit l'utilisateur connecté après création ou récupération */
      setUser: (userId, profile) => set({ userId, userProfile: profile }),

      /** Déconnexion complète : nettoie la session et les données liées */
      clearUser: () =>
        set({
          userId: null,
          userProfile: null,
          habits: [],
          causes: [],
          diagnostic: null,
          plans: [],
          agendaBlocks: [],
          logs: [],
          stats: null,
        }),

      /** Met à jour les habitudes dans le store */
      setHabits: (habits) => set({ habits }),

      /** Met à jour les causes dans le store */
      setCauses: (causes) => set({ causes }),

      /** Stocke le rapport de diagnostic */
      setDiagnostic: (diagnostic) => set({ diagnostic }),

      /** Remplace la liste complète des plans */
      setPlans: (plans) => set({ plans }),

      /**
       * Met à jour un seul plan dans la liste (optimistic update).
       * On utilise map() pour recréer le tableau en modifiant seulement le plan ciblé.
       */
      updatePlan: (planId, changes) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, ...changes } : plan
          ),
        })),

      /** Remplace les blocs d'agenda du jour */
      setAgendaBlocks: (blocks) => set({ agendaBlocks: blocks }),

      /**
       * Met à jour un seul bloc d'agenda dans la liste.
       * Même pattern que updatePlan : map + spread pour l'immutabilité.
       */
      updateAgendaBlock: (blockId, changes) =>
        set((state) => ({
          agendaBlocks: state.agendaBlocks.map((block) =>
            block.id === blockId ? { ...block, ...changes } : block
          ),
        })),

      /** Remplace les entrées de journal */
      setLogs: (logs) => set({ logs }),

      /** Stocke les statistiques agrégées */
      setStats: (stats) => set({ stats }),
    }),
    {
      name: 'neuroflow-storage', // Clé dans localStorage
      // On persiste les infos de session utiles entre refresh
      partialize: (state) => ({
        userId: state.userId,
        userProfile: state.userProfile,
      }),
    }
  )
)

export default useAppStore
