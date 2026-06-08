"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CoinIcon } from "@/components/CoinIcon"

type User = { id: string; name: string; coins: number }
type EventItem = { id: string; name: string }

const SHOP_ITEMS = [
  {
    id: "sneak-peek",
    name: "Sneak Peek",
    tagline: "Spy on a Whiff",
    description: "Find out exactly where a specific Whiff ranked one of your shared events.",
    cost: 15,
    emoji: "👀",
    params: ["target", "event"] as string[],
  },
  {
    id: "wildest-take",
    name: "Wildest Take",
    tagline: "Your most controversial ranking",
    description: "Discover which event you ranked most differently compared to everyone else.",
    cost: 25,
    emoji: "🔥",
    params: [] as string[],
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    tagline: "Full compatibility breakdown",
    description: "Choose any Whiff and see your compatibility score plus your top 3 agreements and top 3 disagreements.",
    cost: 40,
    emoji: "🔍",
    params: ["target"] as string[],
  },
  {
    id: "consensus",
    name: "Most Agreed Upon",
    tagline: "The group's true favorites",
    description: "Reveal the 5 events the whole group agrees on most — lowest variance in rankings across all Whiffs.",
    cost: 60,
    emoji: "🤝",
    params: [] as string[],
  },
]

type ShopResult =
  | { type: "sneak-peek"; targetName: string; eventName: string; rank: number; total: number }
  | { type: "wildest-take"; eventName: string; myRank: number; groupRank: number; deviation: number }
  | { type: "deep-dive"; targetName: string; similarity: number; sharedCount: number; agreements: { name: string; myRank: number; theirRank: number }[]; disagreements: { name: string; myRank: number; theirRank: number }[] }
  | { type: "consensus"; events: { name: string; avgRank: number; rankedBy: number }[] }

export default function ShopPage() {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<{ id: string; name: string }[]>([])
  const [myRanked, setMyRanked] = useState<EventItem[]>([])
  const [displayCoins, setDisplayCoins] = useState(0)

  // Modal state
  const [activeItem, setActiveItem] = useState<typeof SHOP_ITEMS[0] | null>(null)
  const [targetId, setTargetId] = useState("")
  const [eventId, setEventId] = useState("")
  const [targetRanked, setTargetRanked] = useState<EventItem[]>([])
  const [loadingTarget, setLoadingTarget] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ShopResult | null>(null)

  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.replace("/"); return }
    const u: User = JSON.parse(stored)
    setUser(u)
    setDisplayCoins(u.coins)

    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch(`/api/users/${u.id}/ranking`).then((r) => r.json()),
    ]).then(([users, myRanking]) => {
      setAllUsers(users.filter((x: { id: string }) => x.id !== u.id))
      setMyRanked(myRanking.ranked ?? [])
    })
  }, [router])

  // When target changes in Sneak Peek, load their ranked events to filter shared events
  useEffect(() => {
    if (!targetId || activeItem?.id !== "sneak-peek") { setTargetRanked([]); return }
    setLoadingTarget(true)
    setEventId("")
    fetch(`/api/users/${targetId}/ranking`)
      .then((r) => r.json())
      .then((data) => {
        setTargetRanked(data.ranked ?? [])
        setLoadingTarget(false)
      })
  }, [targetId, activeItem])

  const sharedEvents = useCallback(() => {
    if (!targetRanked.length || !myRanked.length) return []
    const theirIds = new Set(targetRanked.map((e) => e.id))
    return myRanked.filter((e) => theirIds.has(e.id))
  }, [targetRanked, myRanked])

  function openItem(item: typeof SHOP_ITEMS[0]) {
    setActiveItem(item)
    setTargetId("")
    setEventId("")
    setTargetRanked([])
    setError("")
    setResult(null)
  }

  function closeModal() {
    setActiveItem(null)
    setResult(null)
    setError("")
  }

  async function handlePurchase() {
    if (!user || !activeItem) return
    setPurchasing(true)
    setError("")

    const params: Record<string, string> = {}
    if (activeItem.params.includes("target")) params.targetId = targetId
    if (activeItem.params.includes("event")) params.eventId = eventId

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, item: activeItem.id, params }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Purchase failed"); setPurchasing(false); return }

      // Update coins
      const newCoins = data.newCoins as number
      const spent = displayCoins - newCoins
      setDisplayCoins(newCoins)
      const updated = { ...user, coins: newCoins }
      setUser(updated)
      localStorage.setItem("user", JSON.stringify(updated))

      // Animate coin loss in header (negative gain)
      window.dispatchEvent(new CustomEvent("coinGain", { detail: { from: displayCoins, amount: -spent } }))

      setResult(data.result as ShopResult)
    } catch {
      setError("Something went wrong")
    }
    setPurchasing(false)
  }

  if (!user) return null

  const canAfford = (cost: number) => displayCoins >= cost

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
            <CoinIcon size={18} />
            <span className="font-bold text-sm text-yellow-700">{displayCoins}</span>
          </div>
        </div>

        {/* Shop grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SHOP_ITEMS.map((item) => {
            const affordable = canAfford(item.cost)
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 ${affordable ? "" : "opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-4xl leading-none">{item.emoji}</div>
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-1 shrink-0">
                    <CoinIcon size={14} />
                    <span className="text-xs font-bold text-yellow-700">{item.cost}</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-snug">{item.name}</p>
                  <p className="text-xs text-[#C8102E] font-medium mt-0.5">{item.tagline}</p>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.description}</p>
                </div>
                <button
                  onClick={() => openItem(item)}
                  disabled={!affordable}
                  className={`mt-auto w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                    affordable
                      ? "bg-[#C8102E] text-white hover:bg-[#a50d26]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {affordable ? "Unlock" : "Not enough coins"}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeItem.emoji}</span>
                <div>
                  <p className="font-bold text-gray-900">{activeItem.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CoinIcon size={13} />
                    <span className="text-xs font-semibold text-yellow-700">{activeItem.cost} coins</span>
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="p-5">
              {result ? (
                <ResultDisplay result={result} />
              ) : (
                <>
                  {/* Param selectors */}
                  {activeItem.params.includes("target") && (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Which Whiff?</label>
                      <select
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white"
                      >
                        <option value="">Select a Whiff…</option>
                        {allUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeItem.params.includes("event") && (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Which event?</label>
                      {!targetId ? (
                        <p className="text-sm text-gray-400 italic">Select a Whiff first</p>
                      ) : loadingTarget ? (
                        <p className="text-sm text-gray-400">Loading…</p>
                      ) : sharedEvents().length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No shared ranked events</p>
                      ) : (
                        <select
                          value={eventId}
                          onChange={(e) => setEventId(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white"
                        >
                          <option value="">Select an event…</option>
                          {sharedEvents().map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing || (activeItem.params.includes("target") && !targetId) || (activeItem.params.includes("event") && !eventId)}
                      className="flex-1 py-2.5 bg-[#C8102E] text-white rounded-xl text-sm font-semibold hover:bg-[#a50d26] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {purchasing ? "Unlocking…" : (
                        <>
                          <CoinIcon size={16} />
                          Spend {activeItem.cost} coins
                        </>
                      )}
                    </button>
                    <button onClick={closeModal} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                  </div>
                </>
              )}
            </div>

            {result && (
              <div className="px-5 pb-5">
                <button onClick={closeModal} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultDisplay({ result }: { result: ShopResult }) {
  if (result.type === "sneak-peek") {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm mb-3">Here&apos;s what you bought…</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="text-gray-700 text-sm mb-2">
            <span className="font-bold text-gray-900">{result.targetName}</span> ranked
          </p>
          <p className="text-xl font-bold text-gray-900 mb-3">&ldquo;{result.eventName}&rdquo;</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-extrabold text-[#C8102E]">#{result.rank}</span>
            <span className="text-gray-400 text-sm">out of {result.total}</span>
          </div>
        </div>
      </div>
    )
  }

  if (result.type === "wildest-take") {
    const higher = result.myRank < result.groupRank
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm mb-3">Your most controversial pick…</p>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <p className="text-xl font-bold text-gray-900 mb-4">&ldquo;{result.eventName}&rdquo;</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Your rank</p>
              <p className="text-2xl font-extrabold text-[#C8102E]">#{result.myRank}</p>
            </div>
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Group avg</p>
              <p className="text-2xl font-extrabold text-gray-700">#{result.groupRank}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            You ranked it <span className="font-bold">{result.deviation} spots {higher ? "higher" : "lower"}</span> than everyone else.
          </p>
        </div>
      </div>
    )
  }

  if (result.type === "deep-dive") {
    return (
      <div className="py-2">
        <div className="text-center mb-5">
          <p className="text-sm text-gray-500 mb-1">You &amp; {result.targetName}</p>
          <p className="text-4xl font-extrabold text-[#C8102E]">{result.similarity}%</p>
          <p className="text-xs text-gray-400">compatible · {result.sharedCount} shared events</p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Top agreements</p>
            <div className="space-y-1.5">
              {result.agreements.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-800 flex-1 truncate">{a.name}</span>
                  <span className="text-xs text-gray-400">#{a.myRank} · #{a.theirRank}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Biggest disagreements</p>
            <div className="space-y-1.5">
              {result.disagreements.map((d, i) => (
                <div key={i} className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-800 flex-1 truncate">{d.name}</span>
                  <span className="text-xs text-gray-400">#{d.myRank} · #{d.theirRank}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (result.type === "consensus") {
    return (
      <div className="py-2">
        <p className="text-sm text-gray-500 text-center mb-4">The events every Whiff agrees on…</p>
        <div className="space-y-2">
          {result.events.map((e, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-lg font-extrabold text-gray-200 w-6 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{e.name}</p>
                <p className="text-xs text-gray-400">avg rank #{e.avgRank} · ranked by {e.rankedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
