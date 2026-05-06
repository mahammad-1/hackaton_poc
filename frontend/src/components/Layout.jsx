// components/Layout.jsx — Squelette visuel de l'application
// Sidebar de navigation + zone de contenu principale
// <Outlet /> est le composant React Router qui injecte la page active

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore.js'
import DarkVeil from './DarkVeil.jsx'

// Configuration des liens de navigation
// Chaque item a : un chemin, un label et une icône SVG inline
const NAV_ITEMS = [
  {
    path: '/app/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/app/diagnostic',
    label: 'Diagnostic',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    path: '/app/plans',
    label: 'Plans',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    path: '/app/agenda',
    label: 'Agenda',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
]

export default function Layout() {
  const navigate = useNavigate()

  // Récupération du profil utilisateur depuis le store Zustand
  const { userProfile, clearUser } = useAppStore((state) => ({
    userProfile: state.userProfile,
    clearUser: state.clearUser,
  }))

  /** Déconnexion : vide le store + localStorage puis redirige vers onboarding */
  const handleLogout = () => {
    clearUser()
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="absolute inset-0">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0.06}
        />
      </div>
      <div className="absolute inset-0 bg-navy-950/60" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-energy-high/10 blur-3xl" />
      </div>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="relative z-10 w-64 h-screen flex-shrink-0 bg-navy-900/80 border-r border-navy-700/80
                         backdrop-blur-md flex flex-col overflow-hidden">
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-navy-700">
          <div className="flex items-center gap-2.5">
            {/* Icône cerveau symbolique */}
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm">⟁</span>
            </div>
            <div>
              <h1 className="text-slate-200 font-semibold text-sm leading-tight">NeuroFlow</h1>
              <p className="text-muted text-[10px] leading-tight">Anti-procrastination</p>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                // NavLink reçoit une fonction qui dit si le lien est actif
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                ${isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-muted hover:text-slate-300 hover:bg-navy-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profil utilisateur en bas de sidebar */}
        <div className="mt-auto px-3 py-4 border-t border-navy-700 flex flex-col gap-2">
          {/* Rubrique compte : hauteur fixe pour éviter les sauts de layout */}
          <div className="px-3 py-2 mb-2 rounded-xl border border-navy-700/80 bg-navy-800/50">
            <p className="text-[10px] uppercase tracking-wider text-muted mb-2">Compte</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center
                               text-accent text-xs font-medium flex-shrink-0">
                {(userProfile?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-xs font-medium truncate">
                  {userProfile?.name || 'Utilisateur'}
                </p>
                <p className="text-muted text-[10px] truncate">
                  {userProfile?.email || 'email non défini'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted mt-2 truncate capitalize">
              Chronotype : {userProfile?.chronotype || 'inconnu'}
            </p>
          </div>

          {/* Rubrique session */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs
                       text-muted hover:text-energy-low hover:bg-energy-low/10
                       transition-colors duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7"/>
              <path d="M9 6H5a2 2 0 00-2 2v8a2 2 0 002 2h4"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Zone de contenu principal ────────────────────────────── */}
      <main className="relative z-10 flex-1 h-screen overflow-y-auto">
        {/* <Outlet /> est remplacé par le composant de la route enfant active */}
        <Outlet />
      </main>
    </div>
  )
}
