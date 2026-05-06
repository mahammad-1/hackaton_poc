// App.jsx — Racine de l'application : configure le Router et les routes
// React Router v6 : chaque <Route> correspond à une URL et rend un composant

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Diagnostic from './pages/Diagnostic.jsx'
import Plans from './pages/Plans.jsx'
import Agenda from './pages/Agenda.jsx'
import Dashboard from './pages/Dashboard.jsx'
import useAppStore from './store/useAppStore.js'

export default function App() {
  // On récupère l'userId depuis le store Zustand (lui-même lu depuis localStorage)
  // Si l'utilisateur n'existe pas encore → redirection vers /onboarding
  const userId = useAppStore((state) => state.userId)

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </BrowserRouter>
  )
}
