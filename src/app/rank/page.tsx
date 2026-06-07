"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

type Event = { id: string; name: string }

interface RankingState {
  phase: "loading" | "ranking" | "done"
  ranked: Event[]
  toRank: Event[]
  current: Event | null
  lo: number
  hi: number
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
  })
  const [history, setHistory] = useState<RankingState[]>([])
  const [flash, setFlash] = useState<"current" | "opponent" | null>(null)

  const saveRanking = useCallback(async (userId: string, ranked: Event[]) => {
    await fetch(`/api/users/${userId}/ranking`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rankedEvents: ranked.map((e) => e.id) }),
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
        const { ranked, unranked } = data as { ranked: Event[]; unranked: Event[] }
        if (unranked.length === 0) {
          setState({ phase: "done", ranked, toRank: [], current: null, lo: 0, hi: 0 })
          return
        }
        const [current, ...rest] = unranked
        setState({
          phase: "ranking",
          ranked,
          toRank: rest,
          current,
          lo: 0,
          hi: ranked.length,
        })
      })
      .catch(() => {
        localStorage.removeItem("user")
        window.location.href = "/"
      })
  }, [])

  function handleButtonClick(preferCurrent: boolean) {
    if (flash) return
    setFlash(preferCurrent ? "current" : "opponent")
    setTimeout(() => {
      setFlash(null)
      handleChoice(preferCurrent)
    }, 500)
  }

  function handleChoice(preferCurrent: boolean) {
    if (state.phase !== "ranking" || !state.current || !user) return

    setHistory((h) => [...h, state])

    const { ranked, current, toRank, lo, hi } = state
    const mid = Math.floor((lo + hi) / 2)

    let newLo = lo
    let newHi = hi

    if (preferCurrent) {
      newHi = mid
    } else {
      newLo = mid + 1
    }

    if (newLo >= newHi) {
      const newRanked = [
        ...ranked.slice(0, newLo),
        current,
        ...ranked.slice(newLo),
      ]

      saveRanking(user.id, newRanked)

      if (toRank.length === 0) {
        setState({ phase: "done", ranked: newRanked, toRank: [], current: null, lo: 0, hi: 0 })
        return
      }

      const [next, ...remaining] = toRank
      setState({
        phase: "ranking",
        ranked: newRanked,
        toRank: remaining,
        current: next,
        lo: 0,
        hi: newRanked.length,
      })
      return
    }

    setState({ ...state, lo: newLo, hi: newHi })
  }

  function handleUndo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]

    // If undoing a placement, roll back the DB too
    if (user && prev.ranked.length < state.ranked.length) {
      saveRanking(user.id, prev.ranked)
    }

    setHistory((h) => h.slice(0, -1))
    setState(prev)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You need to join first.</p>
          <Link href="/" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
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
                {state.ranked.map((event, i) => (
                  <li key={event.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-200 w-8 text-right">
                      {i + 1}
                    </span>
                    <span className="text-gray-800 font-medium">{event.name}</span>
                  </li>
                ))}
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
  const totalEvents = ranked.length + totalUnranked
  const progress = totalEvents - totalUnranked

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
            Ranking {progress + 1} of {totalEvents}
          </p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all"
              style={{ width: `${(progress / totalEvents) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 text-center mb-8">
          Which do you prefer?
        </h2>

        {ranked.length === 0 || !opponent ? (
          <div className="flex justify-center">
            <button
              onClick={() => handleButtonClick(true)}
              disabled={!!flash}
              className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border-2 border-black text-center hover:bg-gray-50 transition-all duration-300"
            >
              <span className="text-xl font-semibold text-gray-900">{current?.name}</span>
              <p className="text-sm text-gray-400 mt-2">Tap to confirm first ranking</p>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleButtonClick(true)}
              disabled={!!flash}
              className="p-8 rounded-2xl shadow-sm border-2 text-center transition-all duration-300"
              style={{
                backgroundColor: flash === "current" ? "#dcfce7" : flash === "opponent" ? "#fee2e2" : "white",
                borderColor: flash === "current" ? "#4ade80" : flash === "opponent" ? "#f87171" : "transparent",
              }}
            >
              <span className="text-xl font-semibold text-gray-900">{current?.name}</span>
            </button>
            <button
              onClick={() => handleButtonClick(false)}
              disabled={!!flash}
              className="p-8 rounded-2xl shadow-sm border-2 text-center transition-all duration-300"
              style={{
                backgroundColor: flash === "opponent" ? "#dcfce7" : flash === "current" ? "#fee2e2" : "white",
                borderColor: flash === "opponent" ? "#4ade80" : flash === "current" ? "#f87171" : "transparent",
              }}
            >
              <span className="text-xl font-semibold text-gray-900">{opponent.name}</span>
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          {totalUnranked} experience{totalUnranked !== 1 ? "s" : ""} left to rank
        </p>
      </div>
    </div>
  )
}
