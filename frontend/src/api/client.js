// api/client.js — Couche d'abstraction HTTP
// Centralise toutes les requêtes vers le backend FastAPI
// Avantage : si l'URL de base change, on ne modifie qu'ici

// URL de base du backend FastAPI (modifiable selon l'environnement)
const BASE_URL = 'http://localhost:8000'

function formatApiError(errData, fallbackMessage) {
  const detail = errData?.detail ?? errData?.message
  if (!detail) return fallbackMessage
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.msg && item?.loc) return `${item.msg} (${item.loc.join(' > ')})`
        return JSON.stringify(item)
      })
      .join(' | ')
  }
  if (typeof detail === 'object') return JSON.stringify(detail)
  return String(detail)
}

function mapHabitToApi(habit) {
  const categoryMap = {
    distraction: 'distraction',
    evitement: 'avoidance',
    évitement: 'avoidance',
    fuite: 'decision_delay',
    perfectionnisme: 'perfectionism',
    perfectionism: 'perfectionism',
    avoidance: 'avoidance',
    decision_delay: 'decision_delay',
  }
  return {
    label: habit.label || habit.name || 'Habitude',
    category: categoryMap[habit.category] || 'distraction',
    severity: Number(habit.severity) || 3,
  }
}

function mapCauseToApi(cause) {
  const causeTypeMap = {
    fear_failure: 'fear_failure',
    perfectionism: 'fear_failure',
    overwhelm: 'decision_overload',
    low_interest: 'lack_of_meaning',
    decision_paralysis: 'decision_overload',
    low_self_efficacy: 'fear_failure',
    anxiety: 'anxiety',
    reward_insensitivity: 'lack_of_meaning',
    task_aversion: 'task_aversion',
    lack_of_meaning: 'lack_of_meaning',
    decision_overload: 'decision_overload',
    low_energy: 'low_energy',
  }
  const contextMap = {
    work: 'work',
    personal: 'personal',
    social: 'social',
    administrative: 'administrative',
    health: 'personal',
    finances: 'administrative',
    household: 'personal',
  }
  return {
    cause_type: causeTypeMap[cause.cause_type || cause.type] || 'fear_failure',
    description: cause.description || '',
    trigger_context: contextMap[cause.trigger_context || cause.contexte] || null,
    frequency: Number(cause.frequency || cause.intensite) || 3,
  }
}

function normalizeLogFromApi(log) {
  return {
    ...log,
    energie: log.energy_score,
    focus: log.focus_score,
    humeur: log.mood_score,
    note: log.notes || '',
  }
}

function mapLogToApi(data) {
  return {
    date: data.date,
    energy_score: Number(data.energy_score ?? data.energie ?? 3),
    focus_score: Number(data.focus_score ?? data.focus ?? 3),
    mood_score: Number(data.mood_score ?? data.humeur ?? 3),
    procrastinated: Boolean(data.procrastinated ?? false),
    notes: data.notes ?? data.note ?? '',
  }
}

/**
 * Wrapper autour de fetch() qui :
 * 1. Préfixe automatiquement l'URL avec BASE_URL
 * 2. Sérialise le body en JSON si fourni
 * 3. Lève une Error lisible si le statut HTTP est une erreur (4xx, 5xx)
 * 4. Désérialise la réponse JSON automatiquement
 *
 * @param {string} endpoint - ex: "/users/42/plans"
 * @param {object} options  - options fetch standard (method, body, etc.)
 * @returns {Promise<any>}  - données JSON de la réponse
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`

  // Construction des headers : on ajoute Content-Type JSON si on envoie un body
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Les headers custom passés par l'appelant écrasent les defaults
  }

  // Sérialisation du body : si c'est un objet JS, on le convertit en JSON string
  const config = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }

  const response = await fetch(url, config)

  // Si le serveur renvoie une erreur HTTP, on lit le message et on lève une exception
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const errData = await response.json()
      message = formatApiError(errData, message)
    } catch {
      // Si la réponse d'erreur n'est pas du JSON, on garde le message générique
    }
    throw new Error(message)
  }

  // Cas particulier : certains endpoints retournent 204 No Content (pas de body)
  if (response.status === 204) return null

  return response.json()
}

// ─────────────────────────────────────────────
// API Utilisateurs
// ─────────────────────────────────────────────

/** Crée un nouvel utilisateur avec son profil */
export const createUser = (data) =>
  apiRequest('/users/', { method: 'POST', body: data })

/** Récupère un utilisateur par son ID */
export const getUser = (userId) =>
  apiRequest(`/users/${userId}`)

// ─────────────────────────────────────────────
// API Diagnostic — Habitudes
// ─────────────────────────────────────────────

/** Enregistre les habitudes de procrastination d'un utilisateur */
export const createHabits = (userId, data) =>
  Array.isArray(data)
    ? Promise.all(
      data.map((habit) =>
        apiRequest(`/users/${userId}/habits`, { method: 'POST', body: mapHabitToApi(habit) })
      )
    )
    : apiRequest(`/users/${userId}/habits`, { method: 'POST', body: mapHabitToApi(data) })

/** Récupère toutes les habitudes enregistrées */
export const getHabits = (userId) =>
  apiRequest(`/users/${userId}/habits`)

// ─────────────────────────────────────────────
// API Diagnostic — Causes
// ─────────────────────────────────────────────

/** Enregistre les causes identifiées de procrastination */
export const createCauses = (userId, data) =>
  Array.isArray(data)
    ? Promise.all(
      data.map((cause) =>
        apiRequest(`/users/${userId}/causes`, { method: 'POST', body: mapCauseToApi(cause) })
      )
    )
    : apiRequest(`/users/${userId}/causes`, { method: 'POST', body: mapCauseToApi(data) })

/** Récupère les causes enregistrées */
export const getCauses = (userId) =>
  apiRequest(`/users/${userId}/causes`)

/** Récupère le rapport de diagnostic complet (score + insights) */
export const getDiagnostic = (userId) =>
  apiRequest(`/users/${userId}/diagnostic`).then((diagnostic) => ({
    ...diagnostic,
    score: diagnostic.procrastination_score,
    interpretation: diagnostic.dominant_cause
      ? `Cause dominante détectée : ${diagnostic.dominant_cause}`
      : 'Diagnostic généré à partir de vos habitudes et causes.',
  }))

// ─────────────────────────────────────────────
// API Plans d'action
// ─────────────────────────────────────────────

/** Génère un plan d'action personnalisé depuis le backend */
export const generatePlan = (userId) =>
  apiRequest(`/users/${userId}/plans/generate`, { method: 'POST' })

/** Liste tous les plans d'action d'un utilisateur */
export const getPlans = (userId) =>
  apiRequest(`/users/${userId}/plans`)

/** Met à jour partiellement un plan (ex: changer son statut) */
export const updatePlan = (userId, planId, data) =>
  apiRequest(`/users/${userId}/plans/${planId}`, { method: 'PATCH', body: data })

// ─────────────────────────────────────────────
// API Agenda
// ─────────────────────────────────────────────

/** Génère les blocs d'agenda pour une date donnée (format YYYY-MM-DD) */
export const generateAgenda = (userId, targetDate) =>
  apiRequest(`/users/${userId}/agenda/generate?target_date=${targetDate}`, { method: 'POST' })

/** Récupère les blocs d'agenda pour une date donnée */
export const getAgenda = (userId, date) =>
  apiRequest(`/users/${userId}/agenda?date=${date}`)

/** Modifie un bloc d'agenda (ex: marquer comme complété) */
export const updateAgendaBlock = (userId, blockId, data) =>
  apiRequest(`/users/${userId}/agenda/${blockId}`, { method: 'PATCH', body: data })

// ─────────────────────────────────────────────
// API Journal & Stats
// ─────────────────────────────────────────────

/** Enregistre une entrée de journal (humeur, énergie, focus) */
export const createLog = (userId, data) =>
  apiRequest(`/users/${userId}/logs`, { method: 'POST', body: mapLogToApi(data) })
    .then(normalizeLogFromApi)

/** Récupère toutes les entrées de journal */
export const getLogs = (userId) =>
  apiRequest(`/users/${userId}/logs`).then((logs) => logs.map(normalizeLogFromApi))

/** Récupère les statistiques agrégées (streaks, moyennes, scores) */
export const getStats = (userId) =>
  apiRequest(`/users/${userId}/stats`).then((stats) => ({
    ...stats,
    current_streak: stats.current_streak_days ?? 0,
    best_streak: stats.current_streak_days ?? 0,
    completion_rate: stats.plans_completion_rate_pct ?? 0,
  }))
