import { useEffect, useMemo, useRef, useState } from 'react'
import useAppStore from '../store/useAppStore.js'

const PRESETS = [
  { id: 'sprint5', label: 'Sprint 5 min', min: 5 },
  { id: 'focus10', label: 'Focus 10 min', min: 10 },
  { id: 'focus15', label: 'Focus 15 min', min: 15 },
  { id: 'pomodoro', label: 'Pomodoro 25', min: 25 },
]

function formatSeconds(total) {
  const s = Math.max(0, total)
  const hh = Math.floor(s / 3600)
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  if (hh > 0) return `${String(hh).padStart(2, '0')}:${mm}:${ss}`
  return `${mm}:${ss}`
}

function playAlarm() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    o.connect(g)
    g.connect(ctx.destination)
    g.gain.value = 0.0001
    o.start()
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45)
    o.stop(ctx.currentTime + 0.5)
  } catch {
    // navigateur sans WebAudio utilisable
  }
}

export default function Chrono() {
  const { focusSession, focusHistory, addFocusHistory, startFocusSession, completeFocusSession, resetFocusSession } = useAppStore((state) => ({
    focusSession: state.focusSession,
    focusHistory: state.focusHistory,
    addFocusHistory: state.addFocusHistory,
    startFocusSession: state.startFocusSession,
    completeFocusSession: state.completeFocusSession,
    resetFocusSession: state.resetFocusSession,
  }))

  const [selected, setSelected] = useState(PRESETS[0])
  const [customHours, setCustomHours] = useState(0)
  const [customMin, setCustomMin] = useState(8)
  const [customSec, setCustomSec] = useState(0)
  const [task, setTask] = useState('')
  const [review, setReview] = useState('')
  const [alarmShown, setAlarmShown] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [isPaused, setIsPaused] = useState(false)
  const [pausedRemainingSeconds, setPausedRemainingSeconds] = useState(0)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [alarmAnimationKey, setAlarmAnimationKey] = useState(0)
  const [isAlarmRinging, setIsAlarmRinging] = useState(false)
  const alarmIntervalRef = useRef(null)

  const durationSeconds = selected.id === 'custom'
    ? Math.max(
      1,
      Math.max(0, Number(customHours) || 0) * 3600
      + Math.max(0, Number(customMin) || 0) * 60
      + Math.min(59, Math.max(0, Number(customSec) || 0))
    )
    : selected.min * 60
  const durationMin = durationSeconds / 60

  const remainingSeconds = useMemo(() => {
    if (!focusSession.active || !focusSession.endsAt) return 0
    return Math.ceil((focusSession.endsAt - now) / 1000)
  }, [focusSession.active, focusSession.endsAt, now])

  const progress = useMemo(() => {
    if (!focusSession.active || (!focusSession.durationSec && !focusSession.durationMin)) return 0
    const total = focusSession.durationSec || Math.round(focusSession.durationMin * 60)
    const done = total - Math.max(0, remainingSeconds)
    return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
  }, [focusSession.active, focusSession.durationMin, focusSession.durationSec, remainingSeconds])

  useEffect(() => {
    if (!focusSession.active || isPaused) return undefined
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [focusSession.active, isPaused])

  useEffect(() => {
    if (!focusSession.active || isPaused) return
    if (remainingSeconds <= 0) {
      completeFocusSession()
      if (!alarmIntervalRef.current) {
        playAlarm()
        alarmIntervalRef.current = window.setInterval(playAlarm, 900)
      }
      setIsAlarmRinging(true)
      setAlarmShown(true)
      setAlarmAnimationKey((prev) => prev + 1)
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('NeuroFlow', { body: 'Session focus terminée. Fais ton bilan.' })
        } else if (Notification.permission === 'default') {
          Notification.requestPermission()
        }
      }
    }
  }, [remainingSeconds, focusSession.active, isPaused, completeFocusSession])

  useEffect(() => () => {
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
  }, [])

  const lancerSession = () => {
    stopAlarm()
    const endsAt = Date.now() + durationSeconds * 1000
    startFocusSession({
      mode: selected.id,
      durationMin,
      durationSec: durationSeconds,
      endsAt,
    })
    setAlarmShown(false)
    setReview('')
    setIsPaused(false)
    setPausedRemainingSeconds(0)
    setShowFinishConfirm(false)
  }

  const relancer5Min = () => {
    stopAlarm()
    const endsAt = Date.now() + 5 * 60 * 1000
    startFocusSession({
      mode: 'sprint5',
      durationMin: 5,
      durationSec: 5 * 60,
      endsAt,
    })
    setSelected({ id: 'sprint5', label: 'Sprint 5 min', min: 5 })
    setAlarmShown(false)
    setReview('')
    setIsPaused(false)
    setPausedRemainingSeconds(0)
    setShowFinishConfirm(false)
  }

  const togglePause = () => {
    if (!focusSession.active) return
    if (!isPaused) {
      setPausedRemainingSeconds(Math.max(0, remainingSeconds))
      setIsPaused(true)
      return
    }
    const endsAt = Date.now() + pausedRemainingSeconds * 1000
    startFocusSession({
      mode: focusSession.mode || selected.id,
      durationMin: focusSession.durationMin || durationMin,
      durationSec: pausedRemainingSeconds,
      endsAt,
    })
    setIsPaused(false)
    setPausedRemainingSeconds(0)
  }

  const confirmFinishEarly = () => {
    if (!focusSession.active) return
    setAlarmShown(true)
    setIsPaused(false)
    setPausedRemainingSeconds(0)
    setShowFinishConfirm(false)
    completeFocusSession()
  }

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
    setIsAlarmRinging(false)
  }

  const enregistrerBilan = (status) => {
    stopAlarm()
    const item = {
      id: Date.now(),
      at: new Date().toLocaleTimeString(),
      mode: selected.label,
      durationSec: focusSession.durationSec || durationSeconds,
      durationMin: focusSession.durationMin || durationMin,
      task: task || 'Tâche non précisée',
      status,
      review,
    }
    addFocusHistory(item)
    setReview('')
    setAlarmShown(false)
    resetFocusSession()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100 mb-1">Alarme anti-procrastination</h1>
        <p className="text-muted text-sm">
          Choisis une durée, définis une tâche claire, lance le focus, puis valide ton bilan à la fin.
        </p>
      </div>

      {!focusSession.active && alarmShown && (
        <div key={alarmAnimationKey} className="mb-4 rounded-2xl border border-accent/50 bg-accent/10 p-4 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${isAlarmRinging ? 'animate-bounce' : ''}`}>🔔</div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Session terminee</p>
                <p className="text-xs text-slate-300">
                  {isAlarmRinging
                    ? 'Alarme en cours. Clique sur Arreter pour couper la sonnerie.'
                    : 'Alarme arretee. Fais ton bilan rapide juste en dessous.'}
                </p>
              </div>
            </div>
            {isAlarmRinging && (
              <button type="button" onClick={stopAlarm} className="btn-primary text-xs">
                Arreter
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {!focusSession.active && (
            <div className="card">
              <h2 className="text-sm font-medium text-slate-200 mb-3">1) Intention de session</h2>
              <label className="block text-xs text-muted mb-1.5">Tâche précise à réaliser maintenant</label>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="input mb-4"
                placeholder="Ex: Écrire l'introduction du rapport (15 min)"
              />

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                      selected.id === p.id
                        ? 'border-accent bg-accent/10 text-slate-100'
                        : 'border-navy-600 text-muted hover:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelected({ id: 'custom', label: 'Custom', min: customMin })}
                  className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                    selected.id === 'custom'
                      ? 'border-accent bg-accent/10 text-slate-100'
                      : 'border-navy-600 text-muted hover:text-slate-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {selected.id === 'custom' && (
                <div className="mb-4">
                  <label className="block text-xs text-muted mb-1.5">Durée personnalisée (heures + minutes + secondes)</label>
                  <div className="flex items-center gap-2">
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={customHours}
                        onChange={(e) => setCustomHours(Math.max(0, Number(e.target.value) || 0))}
                        className="input w-24"
                      />
                      <p className="mt-1 text-[11px] text-muted">h</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={customMin}
                        onChange={(e) => setCustomMin(Math.max(0, Number(e.target.value) || 0))}
                        className="input w-24"
                      />
                      <p className="mt-1 text-[11px] text-muted">min</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customSec}
                        onChange={(e) => setCustomSec(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                        className="input w-24"
                      />
                      <p className="mt-1 text-[11px] text-muted">sec</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={lancerSession} disabled={!task.trim()} className="btn-primary">
                Démarrer {formatSeconds(durationSeconds)}
              </button>
            </div>
          )}

          <div className="card text-center">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">2) Session focus</p>
            <div className="font-mono text-6xl text-slate-100 mb-3">
              {focusSession.active ? formatSeconds(remainingSeconds) : '00:00'}
            </div>
            <div className="w-full h-2 rounded-full bg-navy-700 overflow-hidden mb-3">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted">
              {focusSession.active
                ? `Objectif: ${formatSeconds(focusSession.durationSec || Math.round((focusSession.durationMin || 0) * 60))} • Tâche: ${task}`
                : "L'alarme te prévient à la fin de session."}
            </p>
            {focusSession.active && (
              <div className="mt-4 flex justify-center gap-2">
                <button type="button" onClick={togglePause} className="btn-ghost text-xs">
                  {isPaused ? 'Reprendre' : 'Pause'}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFinishConfirm((prev) => !prev)}
                    className="btn-primary text-xs"
                  >
                    Fini
                  </button>
                  {showFinishConfirm && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl border border-navy-600 bg-navy-900 p-3 text-left shadow-lg">
                      <p className="text-xs text-slate-200 mb-2">Tu es sûr de terminer avant la fin ?</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={confirmFinishEarly} className="btn-primary text-[11px] px-2 py-1.5">
                          Oui, terminer
                        </button>
                        <button type="button" onClick={() => setShowFinishConfirm(false)} className="btn-ghost text-[11px] px-2 py-1.5">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!focusSession.active && alarmShown && (
            <div className="card">
              <h2 className="text-sm font-medium text-slate-200 mb-3">3) Bilan rapide</h2>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={2}
                className="input resize-none mb-3"
                placeholder="Qu'as-tu concrètement avancé pendant la session ?"
              />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => enregistrerBilan('done')} className="btn-primary text-xs">
                  Oui, j'ai avancé
                </button>
                <button onClick={() => enregistrerBilan('partial')} className="btn-ghost text-xs">
                  Un peu
                </button>
                <button onClick={relancer5Min} className="btn-ghost text-xs">
                  Relancer 5 min
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-slate-200 mb-3">Historique court</h2>
          {focusHistory.length === 0 ? (
            <p className="text-xs text-muted">Aucune session validée pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {focusHistory.slice(0, 6).map((h) => (
                <div key={h.id} className="rounded-lg border border-navy-700/80 bg-navy-900/50 p-2">
                  <p className="text-xs text-slate-300">
                    {h.at} • {formatSeconds(h.durationSec || Math.round((h.durationMin || 0) * 60))} • {h.mode}
                  </p>
                  <p className="text-[11px] text-muted truncate">{h.task}</p>
                  <p className={`text-[11px] ${h.status === 'done' ? 'text-energy-high' : 'text-energy-medium'}`}>
                    {h.status === 'done' ? 'Session productive' : 'Progression partielle'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
