import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import GradientText from '../components/GradientText.jsx'
import ShinyText from '../components/ShinyText.jsx'
import BorderGlow from '../components/BorderGlow.jsx'

const BallpitBackground = lazy(() => import('../components/BallpitBackground.jsx'))

export default function Home() {
  const userId = useAppStore((state) => state.userId)

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <BallpitBackground className="opacity-70" count={140} />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-navy-950/45" />

      <BorderGlow
        className="relative z-10 w-full max-w-2xl animate-fade-up"
        edgeSensitivity={30}
        backgroundColor="#0d1117"
        borderRadius={24}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
      >
        <div className="card text-center">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <img src="/logo_hackaton.png" alt="NeuroFlow" className="h-36 w-36 object-contain" />
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">Bienvenue</p>
          <div className="flex items-center justify-center min-h-20 p-2 mb-2">
            <ShinyText
              text="NeuroFlow"
              speed={2}
              delay={0}
              color="#d1d5db"
              shineColor="#ffffff"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            />
          </div>
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
                  <GradientText
                    colors={['#ffffff', '#f3f4f6', '#d1d5db']}
                    animationSpeed={8}
                    showBorder={false}
                    className="font-semibold"
                  >
                    Se connecter
                  </GradientText>
                </Link>
                <Link to="/onboarding" className="btn-ghost">
                  <GradientText
                    colors={['#ffffff', '#f3f4f6', '#d1d5db']}
                    animationSpeed={8}
                    showBorder={false}
                    className="font-semibold"
                  >
                    S'inscrire
                  </GradientText>
                </Link>
              </>
            )}
          </div>
        </div>
      </BorderGlow>
    </div>
  )
}
