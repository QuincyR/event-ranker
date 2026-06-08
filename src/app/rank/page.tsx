"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { CoinIcon } from "@/components/CoinIcon"

type Event = { id: string; name: string; location?: string | null; category?: string | null; description?: string | null }

interface RankingState {
  phase: "loading" | "ranking" | "done"
  ranked: Event[]
  toRank: Event[]
  current: Event | null
  lo: number
  hi: number
  skipped: Event[]
  isRerank: boolean
}

type User = { id: string; name: string }

const TIMER_MS = 7000

const FLAMES = [
  { id: 0, x: -130, delay: 0.00, dur: 1.10 },
  { id: 1, x: -70,  delay: 0.12, dur: 0.95 },
  { id: 2, x: -20,  delay: 0.05, dur: 1.20 },
  { id: 3, x:  40,  delay: 0.18, dur: 1.05 },
  { id: 4, x: 100,  delay: 0.08, dur: 1.15 },
  { id: 5, x: 150,  delay: 0.22, dur: 0.90 },
  { id: 6, x: -100, delay: 0.30, dur: 1.00 },
  { id: 7, x:  70,  delay: 0.15, dur: 1.10 },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function timerColor(progress: number): string {
  if (progress > 50) return "#22c55e"
  if (progress > 20) return "#eab308"
  return "#ef4444"
}

export default function RankPage() {
  const [user, setUser] = useState<User | null>(null)
  const [state, setState] = useState<RankingState>({
    phase: "loading",
    ranked: [],
    toRank: [],
    current: null,
    lo: 0,
    hi: 0,
    skipped: [],
    isRerank: false,
  })
  const [history, setHistory] = useState<RankingState[]>([])
  const [flash, setFlash] = useState<"current" | "opponent" | null>(null)
  const [cardVisible, setCardVisible] = useState(true)
  const touchStartX = useRef<number | null>(null)

  // Timer + streak state
  const [timerProgress, setTimerProgress] = useState(100)
  const [streak, setStreak] = useState(0)
  const [showHotStreak, setShowHotStreak] = useState(false)
  const [streakBump, setStreakBump] = useState(false)
  const [coinNotif, setCoinNotif] = useState<number | null>(null)
  const [coinNotifKey, setCoinNotifKey] = useState(0)
  const [streakNotif, setStreakNotif] = useState<number | null>(null)
  const [streakNotifKey, setStreakNotifKey] = useState(0)
  const streakRef = useRef(0)
  const timerStartRef = useRef(Date.now())
  const timerRafRef = useRef<number | null>(null)
  const hotStreakShownRef = useRef(false)

  // RAF timer loop
  useEffect(() => {
    if (state.phase !== "ranking") {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)
      return
    }

    timerStartRef.current = Date.now()

    function tick() {
      const elapsed = Date.now() - timerStartRef.current
      const progress = Math.max(0, (TIMER_MS - elapsed) / TIMER_MS * 100)
      setTimerProgress(progress)

      if (elapsed >= TIMER_MS && streakRef.current > 0) {
        streakRef.current = 0
        setStreak(0)
        setShowHotStreak(false)
        hotStreakShownRef.current = false
      }

      timerRafRef.current = requestAnimationFrame(tick)
    }

    timerRafRef.current = requestAnimationFrame(tick)
    return () => { if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current) }
  }, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const grantStreakCoins = useCallback(async (bonus: number, userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bonus }),
      })
      const data: { newCoins: number } = await res.json()
      const stored = localStorage.getItem("user")
      if (stored) {
        const u = JSON.parse(stored)
        localStorage.setItem("user", JSON.stringify({ ...u, coins: data.newCoins }))
      }
      window.dispatchEvent(new CustomEvent("coinGain", {
        detail: { from: data.newCoins - bonus, amount: bonus, mini: true },
      }))
    } catch {
      // non-critical
    }
  }, [])

  const saveProgress = useCallback(async (userId: string, ranked: Event[], skipped: Event[], earnedCoins = 0) => {
    const res = await fetch(`/api/users/${userId}/ranking`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rankedEvents: ranked.map((e) => e.id),
        skippedEvents: skipped.map((e) => e.id),
        earnedCoins,
      }),
    })
    if (earnedCoins > 0) {
      const data: { newCoins: number } = await res.json()
      const stored = localStorage.getItem("user")
      if (stored) {
        const u = JSON.parse(stored)
        localStorage.setItem("user", JSON.stringify({ ...u, coins: data.newCoins }))
      }
      window.dispatchEvent(new CustomEvent("coinGain", {
        detail: { from: data.newCoins - earnedCoins, amount: earnedCoins },
      }))
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return
    const u: User = JSON.parse(stored)
    setUser(u)

    fetch(`/api/users/${u.id}/ranking`)
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem("user")
          window.location.href = "/"
          return null
        }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        const { ranked, unranked, skipped = [] } = data as { ranked: Event[]; unranked: Event[]; skipped: Event[] }
        const shuffled = shuffle(unranked)

        if (shuffled.length === 0) {
          setState({ phase: "done", ranked, toRank: [], current: null, lo: 0, hi: 0, skipped, isRerank: false })
          return
        }

        if (ranked.length === 0) {
          if (shuffled.length === 1) {
            const newRanked = [shuffled[0]]
            saveProgress(u.id, newRanked, skipped)
            setState({ phase: "done", ranked: newRanked, toRank: [], current: null, lo: 0, hi: 0, skipped, isRerank: false })
            return
          }
          const [first, second, ...rest] = shuffled
          setState({ phase: "ranking", ranked: [second], toRank: rest, current: first, lo: 0, hi: 1, skipped, isRerank: false })
          return
        }

        const [current, ...rest] = shuffled
        setState({ phase: "ranking", ranked, toRank: rest, current, lo: 0, hi: ranked.length, skipped, isRerank: false })
      })
      .catch(() => {
        localStorage.removeItem("user")
        window.location.href = "/"
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (state.phase !== "ranking" || flash || !state.current) return
      if (e.key === "ArrowLeft") handleButtonClick(true)
      if (e.key === "ArrowRight") handleButtonClick(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [state, flash]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleButtonClick(preferCurrent: boolean) {
    if (flash) return

    // Measure elapsed BEFORE resetting — timer resets when new cards appear
    const elapsed = Date.now() - timerStartRef.current
    const withinTimer = elapsed < TIMER_MS

    if (withinTimer) {
      const newStreak = streakRef.current + 1
      streakRef.current = newStreak
      setStreak(newStreak)

      // Bounce animation on streak counter
      setStreakBump(true)
      setTimeout(() => setStreakBump(false), 300)

      // Hot streak trigger at exactly 5
      if (newStreak === 5 && !hotStreakShownRef.current) {
        hotStreakShownRef.current = true
        setShowHotStreak(true)
        setTimeout(() => setShowHotStreak(false), 2500)
      }

      // Bonus coins: picks after streak 5, capped at +5
      if (newStreak > 5 && user) {
        const bonus = Math.min(5, Math.floor(newStreak / 5))
        setStreakNotifKey((k) => k + 1)
        setStreakNotif(bonus)
        setTimeout(() => setStreakNotif(null), 1200)
        grantStreakCoins(bonus, user.id)
      }
    } else {
      // Expired — reset streak
      streakRef.current = 0
      setStreak(0)
      setShowHotStreak(false)
      hotStreakShownRef.current = false
    }

    setFlash(preferCurrent ? "current" : "opponent")
    setTimeout(() => setCardVisible(false), 150)
    setTimeout(() => {
      setFlash(null)
      handleChoice(preferCurrent)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setCardVisible(true)
        // Reset timer when new cards are actually visible
        timerStartRef.current = Date.now()
        setTimerProgress(100)
      }))
    }, 500)
  }

  function handleChoice(preferCurrent: boolean) {
    if (state.phase !== "ranking" || !state.current || !user) return

    setHistory((h) => [...h, state])

    const { ranked, current, toRank, lo, hi, skipped } = state
    const mid = Math.floor((lo + hi) / 2)
    const newLo = preferCurrent ? lo : mid + 1
    const newHi = preferCurrent ? mid : hi

    if (newLo >= newHi) {
      const newRanked = [...ranked.slice(0, newLo), current, ...ranked.slice(newLo)]
      saveProgress(user.id, newRanked, skipped, state.isRerank ? 0 : 5)

      if (!state.isRerank) {
        setCoinNotifKey((k) => k + 1)
        setCoinNotif(5)
        setTimeout(() => setCoinNotif(null), 1800)
      }

      if (toRank.length === 0) {
        setState({ ...state, phase: "done", ranked: newRanked, toRank: [], current: null, lo: 0, hi: 0 })
        return
      }

      const [next, ...remaining] = toRank
      setState({ ...state, ranked: newRanked, toRank: remaining, current: next, lo: 0, hi: newRanked.length, isRerank: false })
      return
    }

    setState({ ...state, lo: newLo, hi: newHi })
  }

  function handleSkipCurrent() {
    if (state.phase !== "ranking" || !state.current || !user || flash) return

    setHistory((h) => [...h, state])

    const newSkipped = [...state.skipped, state.current]
    saveProgress(user.id, state.ranked, newSkipped, 0)

    if (state.toRank.length === 0) {
      setState({ ...state, phase: "done", toRank: [], current: null, lo: 0, hi: 0, skipped: newSkipped })
      return
    }

    const [next, ...remaining] = state.toRank
    setState({ ...state, toRank: remaining, current: next, lo: 0, hi: state.ranked.length, skipped: newSkipped, isRerank: false })
  }

  function handleSkipOpponent() {
    if (state.phase !== "ranking" || !state.current || !user || flash) return

    const { ranked, skipped } = state
    const mid = Math.floor((state.lo + state.hi) / 2)
    const opponent = ranked[mid]
    if (!opponent) return

    setHistory((h) => [...h, state])

    const newRanked = ranked.filter((e) => e.id !== opponent.id)
    const newSkipped = [...skipped, opponent]

    if (newRanked.length === 0) {
      const finalRanked = [state.current!]
      saveProgress(user.id, finalRanked, newSkipped, 0)
      if (state.toRank.length === 0) {
        setState({ phase: "done", ranked: finalRanked, toRank: [], current: null, lo: 0, hi: 0, skipped: newSkipped, isRerank: false })
      } else {
        const [next, ...remaining] = state.toRank
        setState({ phase: "ranking", ranked: finalRanked, toRank: remaining, current: next, lo: 0, hi: 1, skipped: newSkipped, isRerank: false })
      }
      return
    }

    saveProgress(user.id, newRanked, newSkipped, 0)
    setState({ ...state, ranked: newRanked, lo: 0, hi: newRanked.length, skipped: newSkipped })
  }

  function handleRerank(event: Event) {
    if (!user) return

    // Reset streak when entering a rerank
    streakRef.current = 0
    setStreak(0)
    setShowHotStreak(false)
    hotStreakShownRef.current = false

    const newRanked = state.ranked.filter((e) => e.id !== event.id)
    if (newRanked.length === 0) {
      saveProgress(user.id, [event], state.skipped, 0)
      setState({ phase: "done", ranked: [event], toRank: [], current: null, lo: 0, hi: 0, skipped: state.skipped, isRerank: false })
      return
    }
    saveProgress(user.id, newRanked, state.skipped, 0)
    setState({
      phase: "ranking",
      ranked: newRanked,
      toRank: [],
      current: event,
      lo: 0,
      hi: newRanked.length,
      skipped: state.skipped,
      isRerank: true,
    })
  }

  function handleUndo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]

    const rankChanged = prev.ranked.length !== state.ranked.length
    const skipChanged = prev.skipped.length !== state.skipped.length
    if (user && (rankChanged || skipChanged)) {
      saveProgress(user.id, prev.ranked, prev.skipped)
    }

    setHistory((h) => h.slice(0, -1))
    setState(prev)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You need to join first.</p>
          <Link href="/" className="px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-medium hover:bg-[#a50d26] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (state.phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (state.phase === "done") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}&apos;s Experiences</h1>
          <p className="text-gray-500 mb-8">All caught up! Tap any experience to re-rank it.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {state.ranked.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No experiences to rank yet.{" "}
                <Link href="/add" className="underline">Add some!</Link>
              </p>
            ) : (
              <ol className="divide-y divide-gray-50">
                {state.ranked.map((event, i) => {
                  const meta = [event.category, event.location].filter(Boolean).join(" · ")
                  return (
                    <li key={event.id} className="flex items-center gap-4 py-3 group">
                      <span className="text-xl font-bold text-gray-200 w-8 text-right shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-800 font-medium leading-snug">{event.name}</p>
                        {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
                        {event.description && <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">{event.description}</p>}
                      </div>
                      <button
                        onClick={() => handleRerank(event)}
                        className="shrink-0 text-xs text-gray-300 hover:text-[#C8102E] transition-colors opacity-0 group-hover:opacity-100"
                        title="Re-rank this experience"
                      >
                        ↺ rerank
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Ranking phase
  const { ranked, current, lo, hi } = state
  const mid = Math.floor((lo + hi) / 2)
  const opponent = ranked[mid]
  const totalUnranked = state.toRank.length + 1
  const totalEvents = ranked.length + totalUnranked + state.skipped.length
  const progress = ranked.length + state.skipped.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hot streak overlay */}
      {showHotStreak && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          {/* Background glow */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(251,146,60,0.15) 0%, transparent 70%)" }}
          />

          {/* Floating flames */}
          {FLAMES.map((f) => (
            <div
              key={f.id}
              className="absolute text-5xl"
              style={{
                bottom: "42%",
                left: `calc(50% + ${f.x}px)`,
                animation: `flameFloat ${f.dur}s ease-out ${f.delay}s both`,
              }}
            >
              🔥
            </div>
          ))}

          {/* Main text */}
          <div
            className="relative text-center"
            style={{ animation: "hotStreakPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
          >
            <p
              className="text-5xl font-black text-orange-500"
              style={{ textShadow: "0 0 30px rgba(249,115,22,0.5)" }}
            >
              Hot Streak!
            </p>
            <p className="text-xl text-orange-400 mt-1 font-semibold">🔥 5 picks in a row</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </Link>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↩ Undo
          </button>
        </div>

        {/* Overall progress */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">
            {Math.round((progress / totalEvents) * 100)}% ranked
          </p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C8102E] rounded-full transition-all"
              style={{ width: `${(progress / totalEvents) * 100}%` }}
            />
          </div>
        </div>

        {/* 7-second timer bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${timerProgress}%`,
                backgroundColor: timerColor(timerProgress),
                transition: "width 0.05s linear, background-color 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Streak counter */}
        <div className="relative flex items-center justify-center gap-1.5 mb-4 h-8">
          {streakNotif !== null && (
            <span
              key={streakNotifKey}
              className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-sm font-bold text-yellow-500 pointer-events-none"
              style={{ animation: "floatUp 1.2s ease-out forwards" }}
            >
              +{streakNotif} <CoinIcon size={14} />
            </span>
          )}
          {streak >= 5 && (
            <>
              <span
                className="text-xl"
                style={{
                  display: "inline-block",
                  transform: streakBump ? "scale(1.6)" : "scale(1)",
                  transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                🔥
              </span>
              <span
                className="font-bold text-base text-orange-500"
                style={{
                  display: "inline-block",
                  transform: streakBump ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {streak} streak!
              </span>
            </>
          )}

        </div>

        <h2 className="text-xl font-semibold text-gray-700 text-center mb-8">
          Which do you prefer?
        </h2>

        <div
          style={{
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible ? "translateY(0px) scale(1)" : "translateY(10px) scale(0.97)",
            transition: cardVisible
              ? "opacity 0.35s ease-out, transform 0.35s ease-out"
              : "opacity 0.25s ease-in, transform 0.25s ease-in",
          }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || !!flash) return
            const deltaX = e.changedTouches[0].clientX - touchStartX.current
            touchStartX.current = null
            if (Math.abs(deltaX) < 50) return
            handleButtonClick(deltaX < 0)
          }}
        >
          {opponent && current && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleButtonClick(true)}
                  disabled={!!flash}
                  className="p-8 rounded-2xl shadow-sm border-2 text-center flex-1"
                  style={{
                    backgroundColor: flash === "current" ? "#dcfce7" : flash === "opponent" ? "#fee2e2" : "white",
                    borderColor: flash === "current" ? "#4ade80" : flash === "opponent" ? "#f87171" : streak >= 5 ? "#fb923c" : "transparent",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                    boxShadow: streak >= 5 ? "0 0 12px rgba(251,146,60,0.2)" : undefined,
                  }}
                >
                  <span className="text-xl font-semibold text-gray-900">{current.name}</span>
                  {[current.category, current.location].filter(Boolean).length > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {[current.category, current.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {current.description && (
                    <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">{current.description}</p>
                  )}
                </button>
                <button
                  onClick={handleSkipCurrent}
                  disabled={!!flash}
                  className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors underline underline-offset-2 text-center"
                >
                  Not my experience
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleButtonClick(false)}
                  disabled={!!flash}
                  className="p-8 rounded-2xl shadow-sm border-2 text-center flex-1"
                  style={{
                    backgroundColor: flash === "opponent" ? "#dcfce7" : flash === "current" ? "#fee2e2" : "white",
                    borderColor: flash === "opponent" ? "#4ade80" : flash === "current" ? "#f87171" : streak >= 5 ? "#fb923c" : "transparent",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                    boxShadow: streak >= 5 ? "0 0 12px rgba(251,146,60,0.2)" : undefined,
                  }}
                >
                  <span className="text-xl font-semibold text-gray-900">{opponent.name}</span>
                  {[opponent.category, opponent.location].filter(Boolean).length > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {[opponent.category, opponent.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {opponent.description && (
                    <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">{opponent.description}</p>
                  )}
                </button>
                <button
                  onClick={handleSkipOpponent}
                  disabled={!!flash}
                  className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors underline underline-offset-2 text-center"
                >
                  Not my experience
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative h-8 mt-4 flex items-center justify-center">
          {coinNotif !== null && (
            <span
              key={coinNotifKey}
              className="absolute flex items-center gap-1.5 text-sm font-semibold text-yellow-600 pointer-events-none whitespace-nowrap"
              style={{ animation: "floatUp 1.8s ease-out forwards" }}
            >
              Experience ranked! +{coinNotif} <CoinIcon size={15} />
            </span>
          )}
        </div>

        <p className="text-center text-sm text-gray-400">
          {totalUnranked} experience{totalUnranked !== 1 ? "s" : ""} left to rank
        </p>
      </div>
    </div>
  )
}
