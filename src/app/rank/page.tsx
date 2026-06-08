"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"

type Event = { id: string; name: string; location?: string | null; category?: string | null; description?: string | null }

// Items being actively binary-sorted in parallel. queue[0] is the "current" item shown on the left card.
// nextMid is stored in state (not derived) so each item compares against a different opponent.
type PendingSort = { event: Event; lo: number; hi: number; nextMid: number }

function makePending(event: Event, lo: number, hi: number): PendingSort {
  const nextMid = hi > lo ? lo + Math.floor(Math.random() * (hi - lo)) : lo
  return { event, lo, hi, nextMid }
}

interface RankingState {
  phase: "loading" | "ranking" | "done"
  ranked: Event[]
  queue: PendingSort[]  // up to POOL_SIZE items being sorted simultaneously; rotates after each step
  toRank: Event[]       // not yet started
  skipped: Event[]
}

type User = { id: string; name: string }

const POOL_SIZE = 10

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RankPage() {
  const [user, setUser] = useState<User | null>(null)
  const [state, setState] = useState<RankingState>({
    phase: "loading",
    ranked: [],
    queue: [],
    toRank: [],
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
        const shuffled = shuffle(unranked)

        if (shuffled.length === 0) {
          setState({ phase: "done", ranked, queue: [], toRank: [], skipped })
          return
        }

        if (ranked.length === 0) {
          if (shuffled.length === 1) {
            const newRanked = [shuffled[0]]
            saveProgress(u.id, newRanked, skipped)
            setState({ phase: "done", ranked: newRanked, queue: [], toRank: [], skipped })
            return
          }
          // Seed one item into ranked so the first pool has opponents to compare against
          const [seed, ...rest] = shuffled
          const poolItems = rest.slice(0, POOL_SIZE)
          const toRank = rest.slice(POOL_SIZE)
          const queue = poolItems.map((e) => makePending(e, 0, 1))
          setState({ phase: "ranking", ranked: [seed], queue, toRank, skipped })
          return
        }

        const poolItems = shuffled.slice(0, POOL_SIZE)
        const toRank = shuffled.slice(POOL_SIZE)
        const queue = poolItems.map((e) => makePending(e, 0, ranked.length))
        setState({ phase: "ranking", ranked, queue, toRank, skipped })
      })
      .catch(() => {
        localStorage.removeItem("user")
        window.location.href = "/"
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (state.phase !== "ranking" || flash || !state.queue.length) return
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
    if (state.phase !== "ranking" || !state.queue.length || !user) return

    setHistory((h) => [...h, state])

    const [head, ...restQueue] = state.queue
    const { ranked, toRank, skipped } = state
    const mid = head.nextMid
    const newLo = preferCurrent ? head.lo : mid + 1
    const newHi = preferCurrent ? mid : head.hi

    if (newLo >= newHi) {
      // Place this item into ranked
      const newRanked = [...ranked.slice(0, newLo), head.event, ...ranked.slice(newLo)]
      saveProgress(user.id, newRanked, skipped)

      // Reset remaining queue items' ranges (ranked changed) with fresh random midpoints
      const resetQueue = restQueue.map((p) => makePending(p.event, 0, newRanked.length))
      const newItem = toRank.length > 0 ? makePending(toRank[0], 0, newRanked.length) : null
      const finalQueue = newItem ? [...resetQueue, newItem] : resetQueue
      const remainingToRank = toRank.slice(1)

      if (finalQueue.length === 0) {
        setState({ phase: "done", ranked: newRanked, queue: [], toRank: [], skipped })
        return
      }

      setState({ phase: "ranking", ranked: newRanked, queue: finalQueue, toRank: remainingToRank, skipped })
      return
    }

    // Not placed yet — pick a new random comparison point in the narrowed range, rotate to back
    const updatedHead: PendingSort = makePending(head.event, newLo, newHi)
    setState({ ...state, queue: [...restQueue, updatedHead] })
  }

  function handleSkipCurrent() {
    if (state.phase !== "ranking" || !state.queue.length || !user || flash) return

    setHistory((h) => [...h, state])

    const [head, ...restQueue] = state.queue
    const newSkipped = [...state.skipped, head.event]
    const newItem = state.toRank.length > 0 ? makePending(state.toRank[0], 0, state.ranked.length) : null
    const finalQueue = newItem ? [...restQueue, newItem] : restQueue
    const remainingToRank = state.toRank.slice(1)

    saveProgress(user.id, state.ranked, newSkipped)

    if (finalQueue.length === 0) {
      setState({ phase: "done", ranked: state.ranked, queue: [], toRank: [], skipped: newSkipped })
      return
    }

    setState({ ...state, queue: finalQueue, toRank: remainingToRank, skipped: newSkipped })
  }

  function handleSkipOpponent() {
    if (state.phase !== "ranking" || !state.queue.length || !user || flash) return

    const head = state.queue[0]
    const { ranked, skipped } = state
    const mid = Math.floor((head.lo + head.hi) / 2)
    const opponent = ranked[mid]
    if (!opponent) return

    setHistory((h) => [...h, state])

    const newRanked = ranked.filter((e) => e.id !== opponent.id)
    const newSkipped = [...skipped, opponent]

    if (newRanked.length === 0) {
      // All opponents skipped; place current as sole ranked item
      const [, ...restQueue] = state.queue
      const finalRanked = [head.event]
      const resetQueue = restQueue.map((p) => makePending(p.event, 0, 1))
      const newItem = state.toRank.length > 0 ? makePending(state.toRank[0], 0, 1) : null
      const finalQueue = newItem ? [...resetQueue, newItem] : resetQueue
      saveProgress(user.id, finalRanked, newSkipped)
      if (finalQueue.length === 0) {
        setState({ phase: "done", ranked: finalRanked, queue: [], toRank: state.toRank.slice(1), skipped: newSkipped })
      } else {
        setState({ phase: "ranking", ranked: finalRanked, queue: finalQueue, toRank: state.toRank.slice(1), skipped: newSkipped })
      }
      return
    }

    // Reset all queue items' ranges since ranked changed, with fresh random midpoints
    const newQueue = state.queue.map((p) => makePending(p.event, 0, newRanked.length))
    saveProgress(user.id, newRanked, newSkipped)
    setState({ ...state, ranked: newRanked, queue: newQueue, skipped: newSkipped })
  }

  function handleRerank(event: Event) {
    if (!user) return
    const newRanked = state.ranked.filter((e) => e.id !== event.id)
    if (newRanked.length === 0) {
      saveProgress(user.id, [event], state.skipped)
      setState({ phase: "done", ranked: [event], queue: [], toRank: [], skipped: state.skipped })
      return
    }
    saveProgress(user.id, newRanked, state.skipped)
    setState({
      phase: "ranking",
      ranked: newRanked,
      queue: [makePending(event, 0, newRanked.length)],
      toRank: [],
      skipped: state.skipped,
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
  const head = state.queue[0]
  const current = head?.event ?? null
  const opponent = head != null ? state.ranked[head.nextMid] : undefined
  const totalUnranked = state.queue.length + state.toRank.length
  const totalEvents = state.ranked.length + totalUnranked + state.skipped.length
  const progress = state.ranked.length + state.skipped.length

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
                    borderColor: flash === "current" ? "#4ade80" : flash === "opponent" ? "#f87171" : "transparent",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
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
