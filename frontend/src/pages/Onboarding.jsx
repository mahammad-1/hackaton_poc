// pages/Onboarding.jsx — Création du profil utilisateur
// Première page vue si aucun utilisateur n'est enregistré (pas d'userId en localStorage)
// Redirige vers /dashboard après création réussie

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser.js'


// Options de chronotype (rythme biologique naturel)
const CHRONOTYPES = [
  {
    valeur: 'lion',
    label: 'Lion 🦁',
    description: 'Lève-tôt — pic d\'énergie le matin (5h-12h)',
  },
  {
    valeur: 'bear',
    label: 'Ours 🐻',
    description: 'Standard — suit le cycle solaire (8h-14h)',
  },
  {
    valeur: 'wolf',
    label: 'Loup 🐺',
    description: 'Couche-tard — pic d\'énergie en soirée (17h-24h)',
  },
  {
    valeur: 'dolphin',
    label: 'Dauphin 🐬',
    description: 'Léger sommeil — énergie irrégulière',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { loading, error, register, checkEmailAvailability } = useUser()

  // État du formulaire multi-champs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    robotVerified: false,
    age: '',
    chronotype: '',
    job: '',
    objectif_principal: '',
  })

  // Étape actuelle du formulaire (on le découpe en 2 étapes pour ne pas surcharger)
  const [etape, setEtape] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    available: null,
    message: '',
  })

  /** Handler générique : met à jour le champ correspondant par son `name` */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'email') {
      setEmailStatus({ checking: false, available: null, message: '' })
    }
  }

  const handleEmailBlur = async () => {
    if (!formData.email) return
    setEmailStatus({ checking: true, available: null, message: 'Vérification de l’email...' })
    const result = await checkEmailAvailability(formData.email)
    if (result.reason === 'ok') {
      setEmailStatus({ checking: false, available: true, message: 'Email disponible.' })
      return
    }
    if (result.reason === 'taken') {
      setEmailStatus({ checking: false, available: false, message: 'Cet email est déjà utilisé.' })
      return
    }
    setEmailStatus({ checking: false, available: false, message: 'Impossible de vérifier pour le moment.' })
  }

  /** Sélection du chronotype (boutons cliquables) */
  const selectionnerChronotype = (valeur) => {
    setFormData((prev) => ({ ...prev, chronotype: valeur }))
  }

  /** Soumission finale : appel API + redirection */
  const handleSubmit = async (e) => {
    e.preventDefault()
    // On convertit l'âge en number et on envoie au backend
    const profil = await register({
      ...formData,
      age: formData.age ? Number(formData.age) : undefined,
    })
    if (profil) {
      // Redirection vers le dashboard après création réussie
      navigate('/app/dashboard', { replace: true })
    }
  }

  // Validation de l'étape 1 avant de passer à l'étape 2
  const etape1Valide =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.chronotype &&
    formData.robotVerified &&
    emailStatus.available === true

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      {/* Fond décoratif : gradient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(129,140,248,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-4">
          <Link to="/" className="btn-ghost inline-flex items-center gap-2">
            ← Retour à l'accueil
          </Link>
        </div>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-accent/15 border border-accent/25 mb-4">
            <span className="text-accent text-2xl">⟁</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-100 mb-1">NeuroFlow</h1>
          <p className="text-muted text-sm">
            Vainquez la procrastination grâce aux neurosciences
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="card border-navy-600 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {/* Indicateur d'étape */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-colors duration-300
                  ${n <= etape ? 'bg-accent' : 'bg-navy-700'}`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* ── Étape 1 : Infos de base ── */}
            {etape === 1 && (
              <div className="space-y-4 animate-fade-up">
                <div>
                  <h2 className="text-slate-200 font-medium mb-4">
                    Votre profil <span className="text-muted font-normal">(étape 1/2)</span>
                  </h2>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Comment vous appelez-vous ?"
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    placeholder="votre@email.com"
                    className="input"
                    required
                  />
                  {emailStatus.message && (
                    <p
                      className={`mt-1 text-xs ${
                        emailStatus.available ? 'text-energy-high' : 'text-energy-low'
                      }`}
                    >
                      {emailStatus.message}
                    </p>
                  )}
                </div>

                {/* Âge */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">Âge</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="10"
                    max="99"
                    className="input"
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                      className="input pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-slate-300"
                    >
                      {showPassword ? 'Cacher' : 'Afficher'}
                    </button>
                  </div>
                </div>

                {/* Chronotype */}
                <div>
                  <label className="block text-xs text-muted mb-2">
                    Votre chronotype * — Quel type de dormeur êtes-vous ?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHRONOTYPES.map((type) => (
                      <button
                        key={type.valeur}
                        type="button"
                        onClick={() => selectionnerChronotype(type.valeur)}
                        className={`
                          p-3 rounded-lg border text-left transition-all duration-150
                          ${formData.chronotype === type.valeur
                            ? 'border-accent bg-accent/10 text-slate-200'
                            : 'border-navy-600 text-muted hover:border-navy-500'
                          }
                        `}
                      >
                        <div className="text-sm font-medium mb-0.5">{type.label}</div>
                        <div className="text-[10px] leading-tight opacity-70">
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="robotVerified"
                    checked={formData.robotVerified}
                    onChange={handleChange}
                    className="accent-accent"
                    required
                  />
                  Je ne suis pas un robot
                </label>

                <button
                  type="button"
                  onClick={() => setEtape(2)}
                  disabled={!etape1Valide}
                  className="btn-primary w-full mt-2"
                >
                  Continuer →
                </button>
              </div>
            )}

            {/* ── Étape 2 : Contexte + Objectif ── */}
            {etape === 2 && (
              <div className="space-y-4 animate-fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setEtape(1)}
                    className="text-muted hover:text-slate-300 transition-colors"
                  >
                    ← Retour
                  </button>
                  <h2 className="text-slate-200 font-medium">
                    Contexte <span className="text-muted font-normal">(étape 2/2)</span>
                  </h2>
                </div>

                {/* Profession / Statut */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Profession / Statut
                  </label>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    placeholder="Développeur, étudiant, freelance..."
                    className="input"
                  />
                </div>

                {/* Objectif principal */}
                <div>
                  <label className="block text-xs text-muted mb-1.5">
                    Objectif principal — Que voulez-vous accomplir ?
                  </label>
                  <textarea
                    name="objectif_principal"
                    value={formData.objectif_principal}
                    onChange={handleChange}
                    placeholder="Ex: Finir mon projet de fin d'études sans procrastiner..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                {/* Affichage des erreurs API */}
                {error && (
                  <div className="p-3 rounded-lg bg-energy-low/10 border border-energy-low/30
                                   text-energy-low text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    '🚀 Commencer mon diagnostic'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-4">
          Vos données sont stockées localement et sur votre serveur backend.
        </p>
      </div>
    </div>
  )
}