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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-4">
          <Link to="/" className="btn-ghost inline-flex items-center gap-2">
            ← Retour à l'accueil
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
              <span className="text-accent text-lg">⟁</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Se connecter</h1>
              <p className="text-xs text-muted">Accédez à votre espace NeuroFlow</p>
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

            <button
              type="submit"
              disabled={loading || !formData.robotVerified}
              className="btn-primary w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="card animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">S'inscrire</h2>
          <p className="text-sm text-muted mb-6">
            Utilisez le formulaire complet actuel pour créer votre profil, choisir votre
            chronotype et configurer vos objectifs.
          </p>

          <div className="space-y-3 text-sm text-slate-300 mb-8">
            <p>• Informations personnelles</p>
            <p>• Chronotype et habitudes</p>
            <p>• Objectif principal</p>
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
