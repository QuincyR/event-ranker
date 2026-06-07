"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type EventData = {
  id: string
  name: string
  location?: string | null
  category?: string | null
}

type RankedItem = {
  event: EventData
  averageScore: number | null
  rankedByCount: number
  rank: number | null
}

type User = { id: string; name: string }

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [topRankings, setTopRankings] = useState<RankedItem[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.replace("/"); return }
    setUser(JSON.parse(stored))

    fetch("/api/rankings/overall")
      .then((r) => r.json())
      .then((data: RankedItem[]) => {
        setTopRankings(data.filter((x) => x.rankedByCount > 0).slice(0, 10))
        setLoadingRankings(false)
      })
      .catch(() => setLoadingRankings(false))
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-5">
            Welcome to WhiffenBeli, the place to rank (and reminisce about) Whiffenpoof experiences throughout the year. Rank experiences, add any you think are missing, and compare your rankings with the other Whiffs!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rank"
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Rank Experiences →
            </Link>
            <Link
              href="/add"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              + Add Experience
            </Link>
            <Link
              href="/rankings"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Rankings
            </Link>
          </div>
        </div>

        {/* Top 10 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Top 10 Whiffenpoof Experiences</h2>

          {loadingRankings ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
          ) : topRankings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              No rankings yet.{" "}
              <Link href="/rank" className="underline">Start ranking!</Link>
            </p>
          ) : (
            <ol className="space-y-4">
              {topRankings.map((item) => {
                const meta = [item.event.category, item.event.location].filter(Boolean).join(" · ")
                return (
                  <li key={item.event.id} className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-gray-200 w-8 text-right shrink-0 pt-0.5">
                      {item.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-gray-800 font-medium leading-snug">{item.event.name}</p>
                      {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
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
