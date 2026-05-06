// App.jsx — Racine de l'application : configure le Router et les routes
// React Router v6 : chaque <Route> correspond à une URL et rend un composant

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import useAppStore from './store/useAppStore.js'

const Home = lazy(() => import('./pages/Home.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Diagnostic = lazy(() => import('./pages/Diagnostic.jsx'))
const Plans = lazy(() => import('./pages/Plans.jsx'))
const Agenda = lazy(() => import('./pages/Agenda.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

export default function App() {
  // On attend la réhydratation du store avant d'évaluer les redirections.
  const { userId, hasHydrated } = useAppStore((state) => ({
    userId: state.userId,
    hasHydrated: state.hasHydrated,
  }))

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Chargement de la session...
      </div>
    )
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-muted">
            Chargement...
          </div>
        }
      >
        <Routes>
          {/* Accueil public */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Route publique : création de compte */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Routes protégées : wrappées dans Layout (nav + sidebar) */}
          {/* Si pas de userId → redirige vers onboarding */}
          <Route
            path="/app"
            element={userId ? <Layout /> : <Navigate to="/auth" replace />}
          >
            {/* Route index = page par défaut quand on arrive sur "/app" */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="diagnostic" element={<Diagnostic />} />
            <Route path="plans" element={<Plans />} />
            <Route path="agenda" element={<Agenda />} />
          </Route>

          {/* Fallback : toute URL inconnue → accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
