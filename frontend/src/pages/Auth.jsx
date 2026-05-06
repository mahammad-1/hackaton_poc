import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser.js'

export default function Auth() {
  const navigate = useNavigate()
  const { login, loading, error } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    robotVerified: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const profile = await login({
      email: formData.email,
      password: formData.password,
    })
    if (profile) navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen p-6 sm:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="btn-ghost inline-flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Retour à l'accueil</span>
          </Link>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-800/70 px-3 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Espace sécurisé
          </div>
        </div>

        <div className="mx-auto mb-6 max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-muted">
            Reprenez votre progression anti-procrastination en quelques secondes.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.95fr]">
        <div className="card animate-fade-up bg-navy-800/85 p-7 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <img src="/logo_hackaton.png" alt="NeuroFlow" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Se connecter</h1>
              <p className="text-xs text-muted">Accedez a votre espace NeuroFlow</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-11"
                  placeholder="Votre mot de passe"
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

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                name="robotVerified"
                checked={formData.robotVerified}
                onChange={handleChange}
                className="accent-accent"
              />
              Je ne suis pas un robot
            </label>

            {error && (
              <div className="p-3 rounded-lg bg-energy-low/10 border border-energy-low/30 text-energy-low text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !formData.robotVerified} className="btn-primary w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="card animate-fade-up bg-navy-800/70 p-7 sm:p-8" style={{ animationDelay: '0.08s' }}>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Nouveau sur NeuroFlow ?</h2>
          <p className="text-sm text-muted mb-6">
            Creez votre profil et obtenez un plan personnalise base sur vos habitudes de procrastination.
          </p>

          <div className="space-y-2.5 text-sm text-slate-300 mb-8">
            <div className="rounded-lg border border-navy-700 bg-navy-900/40 px-3 py-2">Informations personnelles</div>
            <div className="rounded-lg border border-navy-700 bg-navy-900/40 px-3 py-2">Chronotype et habitudes</div>
            <div className="rounded-lg border border-navy-700 bg-navy-900/40 px-3 py-2">Objectif principal</div>
          </div>

          <Link to="/onboarding" className="btn-primary inline-block w-full text-center">
            Aller à l'inscription
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
