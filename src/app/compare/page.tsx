"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MonsterAvatar } from "@/components/MonsterAvatar"

type EventData = {
  id: string
  name: string
  location?: string | null
  category?: string | null
}

type RankingEntry = {
  event: EventData
  myRank: number
  theirRank: number
  diff: number
}

type Comparison = {
  userId: string
  name: string
  similarity: number
  sharedCount: number
  rankings: RankingEntry[]
}

type User = { id: string; name: string; character?: string; equipped?: string[] }

function SimilarityBar({ pct }: { pct: number }) {
  const color = pct >= 65 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444"
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-semibold tabular-nums" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

function DetailList({ entries, mode, theirName }: { entries: RankingEntry[]; mode: "close" | "far"; theirName: string }) {
  const sorted = [...entries].sort((a, b) =>
    mode === "close" ? a.diff - b.diff : b.diff - a.diff
  )
  const shortName = theirName.split(" ")[0]

  return (
    <>
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Experience</span>
        <div className="flex gap-6 text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
          <span className="w-10 text-right">You</span>
          <span className="w-14 text-right">{shortName}</span>
        </div>
      </div>
      <ul className="divide-y divide-gray-50">
        {sorted.map(({ event, myRank, theirRank, diff }) => {
          const meta = [event.category, event.location].filter(Boolean).join(" · ")
          const isClose = diff <= 2
          const isFar = diff >= Math.ceil(entries.length * 0.4)
          return (
            <li
              key={event.id}
              className="flex items-start justify-between gap-4 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 leading-snug">{event.name}</p>
                {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: isClose ? "#22c55e" : isFar ? "#ef4444" : "#d1d5db",
                  }}
                >
                  {diff === 0 ? "exact match" : `${diff} apart`}
                </p>
              </div>
              <div className="flex gap-6 shrink-0 pt-0.5">
                <span className="w-10 text-right text-sm font-bold text-gray-700">#{myRank}</span>
                <span className="w-14 text-right text-sm font-semibold text-gray-400">#{theirRank}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function ComparisonCard({
  comp,
  headline,
  mode,
  expanded,
  onToggle,
  avatarUser,
}: {
  comp: Comparison
  headline: string
  mode: "close" | "far"
  expanded: boolean
  onToggle: () => void
  avatarUser?: { character?: string; equipped?: string[] }
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{headline}</p>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <MonsterAvatar character={avatarUser?.character ?? "blob"} equipped={avatarUser?.equipped ?? []} size={40} />
          </div>
          <p className="text-lg font-bold text-gray-900">{comp.name}</p>
        </div>
        <SimilarityBar pct={comp.similarity} />
        <p className="text-xs text-gray-400 mt-1.5">{comp.sharedCount} experiences in common</p>
        <p className="text-xs text-gray-400 mt-2">
          {expanded ? "▲ Hide details" : `▼ See where you ${mode === "close" ? "agree" : "disagree"}`}
        </p>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-1">
            {mode === "close" ? "Closest rankings" : "Biggest differences"}
          </p>
          <DetailList entries={comp.rankings} mode={mode} theirName={comp.name} />
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  const [user, setUser] = useState<User | null>(null)
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [userMap, setUserMap] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [expandedMost, setExpandedMost] = useState(true)
  const [expandedLeast, setExpandedLeast] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailMode, setDetailMode] = useState<"close" | "far">("close")
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.replace("/"); return }
    const u: User = JSON.parse(stored)
    setUser(u)

    Promise.all([
      fetch(`/api/users/${u.id}/compare`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([compareData, usersData]: [Comparison[], User[]]) => {
        setComparisons(compareData)
        const map: Record<string, User> = {}
        for (const usr of usersData) map[usr.id] = usr
        setUserMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  if (!user) return null

  const most = comparisons[0]
  const least = comparisons[comparisons.length - 1]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Compare with Others</h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
        ) : comparisons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500 mb-2">Not enough rankings to compare yet.</p>
            <p className="text-gray-400 text-sm">
              Rank at least 2 experiences, and make sure others have too.
            </p>
            <Link href="/rank" className="inline-block mt-4 px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-medium hover:bg-[#a50d26] transition-colors">
              Start Ranking →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {most && (
              <ComparisonCard
                comp={most}
                headline="Most Compatible"
                mode="close"
                expanded={expandedMost}
                onToggle={() => setExpandedMost((v) => !v)}
                avatarUser={userMap[most.userId]}
              />
            )}

            {least && least.userId !== most?.userId && (
              <ComparisonCard
                comp={least}
                headline="Least Compatible"
                mode="far"
                expanded={expandedLeast}
                onToggle={() => setExpandedLeast((v) => !v)}
                avatarUser={userMap[least.userId]}
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 pt-5 pb-3">All Whiffs</p>
              <ul className="divide-y divide-gray-50">
                {comparisons.map((comp) => {
                  const isSelected = selectedId === comp.userId
                  return (
                    <li key={comp.userId}>
                      <button
                        onClick={() => {
                          setSelectedId(isSelected ? null : comp.userId)
                          setDetailMode("close")
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              <MonsterAvatar
                                character={userMap[comp.userId]?.character ?? "blob"}
                                equipped={userMap[comp.userId]?.equipped ?? []}
                                size={32}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-800">{comp.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {comp.sharedCount} shared · {isSelected ? "▲" : "▼"}
                          </span>
                        </div>
                        <SimilarityBar pct={comp.similarity} />
                      </button>

                      {isSelected && (
                        <div className="px-5 pb-4">
                          <div className="flex gap-2 mb-3 mt-1">
                            <button
                              onClick={() => setDetailMode("close")}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                detailMode === "close"
                                  ? "bg-[#C8102E] text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              Closest rankings
                            </button>
                            <button
                              onClick={() => setDetailMode("far")}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                detailMode === "far"
                                  ? "bg-[#C8102E] text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              Biggest gaps
                            </button>
                          </div>
                          <DetailList entries={comp.rankings} mode={detailMode} theirName={comp.name} />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
