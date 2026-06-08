"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"

type Event = { id: string; name: string; location?: string | null; category?: string | null; description?: string | null }

interface RankingState {
  phase: "loading" | "ranking" | "done"
  ranked: Event[]
  toRank: Event[]
  current: Event | null
  lo: number
  hi: number
  skipped: Event[]
}

type User = { id: string; name: string }

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
  })
  const [history, setHistory] = useState<RankingState[]>([])
  const [flash, setFlash] = useState<"current" | "opponent" | null>(null)
  const [cardVisible, setCardVisible] = useState(true)
  const touchStartX = useRef<number | null>(null)

  const saveProgress = useCallback(async (userId: string, ranked: Event[], skipped: Event[]) => {
    await fetch(`/api/users/${userId}/ranking`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rankedEvents: ranked.map((e) => e.id),
        skippedEvents: skipped.map((e) => e.id),
      }),
    })
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
        if (unranked.length === 0) {
          setState({ phase: "done", ranked, toRank: [], current: null, lo: 0, hi: 0, skipped })
          return
        }
        const [current, ...rest] = unranked
        setState({ phase: "ranking", ranked, toRank: rest, current, lo: 0, hi: ranked.length, skipped })
      })
      .catch(() => {
        localStorage.removeItem("user")
        window.location.href = "/"
      })
  }, [])

  // Keyboard arrow navigation
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
    setFlash(preferCurrent ? "current" : "opponent")
    setTimeout(() => setCardVisible(false), 150)
    setTimeout(() => {
      setFlash(null)
      handleChoice(preferCurrent)
      requestAnimationFrame(() => requestAnimationFrame(() => setCardVisible(true)))
    }, 500)
  }

  function handleChoice(preferCurrent: boolean) {
    if (state.phase !== "ranking" || !state.current || !user) return

    setHistory((h) => [...h, state])

    const { ranked, current, toRank, lo, hi, skipped } = state
    const mid = Math.floor((lo + hi) / 2)

    let newLo = lo
    let newHi = hi

    if (preferCurrent) {
      newHi = mid
    } else {
      newLo = mid + 1
    }

    if (newLo >= newHi) {
      const newRanked = [...ranked.slice(0, newLo), current, ...ranked.slice(newLo)]
      saveProgress(user.id, newRanked, skipped)

      if (toRank.length === 0) {
        setState({ phase: "done", ranked: newRanked, toRank: [], current: null, lo: 0, hi: 0, skipped })
        return
      }

      const [next, ...remaining] = toRank
      setState({ phase: "ranking", ranked: newRanked, toRank: remaining, current: next, lo: 0, hi: newRanked.length, skipped })
      return
    }

    setState({ ...state, lo: newLo, hi: newHi })
  }

  function handleSkipCurrent() {
    if (state.phase !== "ranking" || !state.current || !user || flash) return

    setHistory((h) => [...h, state])

    const newSkipped = [...state.skipped, state.current]
    saveProgress(user.id, state.ranked, newSkipped)

    if (state.toRank.length === 0) {
      setState({ ...state, phase: "done", toRank: [], current: null, lo: 0, hi: 0, skipped: newSkipped })
      return
    }

    const [next, ...remaining] = state.toRank
    setState({ ...state, toRank: remaining, current: next, lo: 0, hi: state.ranked.length, skipped: newSkipped })
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
    saveProgress(user.id, newRanked, newSkipped)

    setState({ ...state, ranked: newRanked, lo: 0, hi: newRanked.length, skipped: newSkipped })
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
          <p className="text-gray-500 mb-8">All caught up! Head to rankings to see how you compare.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {state.ranked.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No experiences to rank yet.{" "}
                <Link href="/add" className="underline">Add some!</Link>
              </p>
            ) : (
              <ol className="space-y-3">
                {state.ranked.map((event, i) => {
                  const meta = [event.category, event.location].filter(Boolean).join(" · ")
                  return (
                    <li key={event.id} className="flex items-start gap-4">
                      <span className="text-2xl font-bold text-gray-200 w-8 text-right shrink-0 pt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-gray-800 font-medium">{event.name}</p>
                        {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
                        {event.description && <p className="text-xs text-gray-400 mt-0.5 italic">{event.description}</p>}
                      </div>
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

        <div className="mb-8">
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
            // swipe left = prefer left card, swipe right = prefer right card
            handleButtonClick(deltaX < 0)
          }}
        >
          {ranked.length === 0 || !opponent ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleButtonClick(true)}
                disabled={!!flash}
                className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border-2 border-[#00356B] text-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl font-semibold text-gray-900">{current?.name}</span>
                {[current?.category, current?.location].filter(Boolean).length > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {[current?.category, current?.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                {current?.description && (
                  <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">{current.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">Tap to confirm first ranking</p>
              </button>
              <button
                onClick={handleSkipCurrent}
                disabled={!!flash}
                className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors underline underline-offset-2"
              >
                Not my experience
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleButtonClick(true)}
                  disabled={!!flash}
                  className="p-8 rounded-2xl shadow-sm border-2 text-center flex-1"
                  style={{
                    backgroundColor: flash === "current" ? "#dcfce7" : flash === "opponent" ? "#fee2e2" : "white",
                    borderColor: flash === "current" ? "#4ade80" : flash === "opponent" ? "#f87171" : "transparent",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  <span className="text-xl font-semibold text-gray-900">{current?.name}</span>
                  {[current?.category, current?.location].filter(Boolean).length > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {[current?.category, current?.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {current?.description && (
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
                    borderColor: flash === "opponent" ? "#4ade80" : flash === "current" ? "#f87171" : "transparent",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
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

        <p className="text-center text-sm text-gray-400 mt-6">
          {totalUnranked} experience{totalUnranked !== 1 ? "s" : ""} left to rank
        </p>
      </div>
    </div>
  )
}
