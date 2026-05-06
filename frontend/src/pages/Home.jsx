import { Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'

export default function Home() {
  const userId = useAppStore((state) => state.userId)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl card text-center animate-fade-up">
        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center">
          <span className="text-3xl text-accent">⟁</span>
        </div>

        <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">Bienvenue</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-100 mb-2">NeuroFlow</h1>
        <p className="text-muted max-w-xl mx-auto mb-8">
          Votre assistant anti-procrastination base sur les neurosciences, pour transformer
          vos intentions en actions quotidiennes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {userId ? (
            <Link to="/app/dashboard" className="btn-primary">
              Entrer dans l'application
            </Link>
          ) : (
            <>
              <Link to="/auth" className="btn-primary">
                Se connecter
              </Link>
              <Link to="/onboarding" className="btn-ghost">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
