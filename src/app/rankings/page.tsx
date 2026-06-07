"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CATEGORIES, NAMES } from "@/lib/constants"

type EventData = {
  id: string
  name: string
  location?: string | null
  date?: string | null
  category?: string | null
  createdAt: string
}

type RankedItem = {
  event: EventData
  totalScore: number | null
  averageScore: number | null
  rankedByCount: number
  rank: number | null
}

type User = { id: string; name: string }
type Tab = "overall" | "mine" | "person" | "chronological" | "category"

function EventRow({ rank, event, extra }: { rank?: number | null; event: EventData; extra?: string }) {
  const meta = [event.category, event.location].filter(Boolean).join(" · ")
  return (
    <li className="flex items-start gap-4">
      {rank != null && (
        <span className="text-xl font-bold text-gray-200 w-7 text-right shrink-0 pt-0.5">
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-gray-800 font-medium leading-snug">{event.name}</p>
        {(meta || extra) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {[meta, extra].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </li>
  )
}

export default function RankingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<Tab>("overall")
  const [allRankings, setAllRankings] = useState<RankedItem[]>([])
  const [myRanking, setMyRanking] = useState<EventData[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedPerson, setSelectedPerson] = useState("")
  const [personRanking, setPersonRanking] = useState<EventData[] | null>(null)
  const [personLoading, setPersonLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.replace("/"); return }
    const u: User = JSON.parse(stored)
    setUser(u)

    Promise.all([
      fetch("/api/rankings/overall").then((r) => r.json()),
      fetch(`/api/users/${u.id}/ranking`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([rankings, myR, users]) => {
        setAllRankings(rankings)
        setMyRanking(myR.ranked ?? [])
        setAllUsers(users)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function loadPersonRanking(personName: string) {
    setPersonRanking(null)
    if (!personName) return
    setPersonLoading(true)
    const person = allUsers.find((u) => u.name === personName)
    if (!person) { setPersonLoading(false); return }
    const data = await fetch(`/api/users/${person.id}/ranking`).then((r) => r.json())
    setPersonRanking(data.ranked ?? [])
    setPersonLoading(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overall", label: "Overall" },
    { key: "mine", label: "My Ranking" },
    { key: "person", label: "By Person" },
    { key: "chronological", label: "Chronological" },
    { key: "category", label: "By Category" },
  ]

  const rankedOverall = allRankings.filter((x) => x.rankedByCount > 0)

  const chronoWithDate = allRankings
    .filter((x) => x.event.date)
    .sort((a, b) => new Date(a.event.date!).getTime() - new Date(b.event.date!).getTime())
  const chronoNoDate = allRankings.filter((x) => !x.event.date)

  const categoryFiltered = selectedCategory
    ? (() => {
        const filtered = allRankings.filter((x) => x.event.category === selectedCategory)
        let catRank = 0
        return filtered.map((x) => ({
          ...x,
          categoryRank: x.rankedByCount > 0 ? ++catRank : null,
        }))
      })()
    : []

  if (!user || loading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Rankings</h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overall */}
        {tab === "overall" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Overall Rankings</h2>
            {rankedOverall.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No rankings yet.</p>
            ) : (
              <ol className="space-y-4">
                {rankedOverall.map((item) => (
                  <EventRow
                    key={item.event.id}
                    rank={item.rank}
                    event={item.event}
                    extra={`ranked by ${item.rankedByCount}`}
                  />
                ))}
              </ol>
            )}
          </div>
        )}

        {/* My Ranking */}
        {tab === "mine" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">{user.name}&apos;s Ranking</h2>
            {myRanking.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                You haven&apos;t ranked any experiences yet.{" "}
                <Link href="/rank" className="underline">Start ranking!</Link>
              </p>
            ) : (
              <ol className="space-y-4">
                {myRanking.map((event, i) => (
                  <EventRow key={event.id} rank={i + 1} event={event} />
                ))}
              </ol>
            )}
          </div>
        )}

        {/* By Person */}
        {tab === "person" && (
          <div>
            <select
              value={selectedPerson}
              onChange={(e) => {
                setSelectedPerson(e.target.value)
                loadPersonRanking(e.target.value)
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white mb-4"
            >
              <option value="">Select a Whiff...</option>
              {NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {personLoading && (
              <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
            )}

            {!personLoading && personRanking !== null && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">
                  {selectedPerson}&apos;s Ranking
                </h2>
                {personRanking.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    {allUsers.find((u) => u.name === selectedPerson)
                      ? `${selectedPerson} hasn't ranked any experiences yet.`
                      : `${selectedPerson} hasn't signed in yet.`}
                  </p>
                ) : (
                  <>
                    <ol className="space-y-4">
                      {personRanking.map((event, i) => (
                        <EventRow key={event.id} rank={i + 1} event={event} />
                      ))}
                    </ol>
                    {allRankings.length > personRanking.length && (
                      <p className="text-xs text-gray-400 text-center pt-4 mt-4 border-t border-gray-50">
                        Missing {allRankings.length - personRanking.length} experience{allRankings.length - personRanking.length !== 1 ? "s" : ""} from their ranking
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chronological */}
        {tab === "chronological" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Year in Review</h2>
            {chronoWithDate.length === 0 && chronoNoDate.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No experiences added yet.
              </p>
            ) : (
              <>
                {chronoWithDate.length > 0 && (
                  <ul className="space-y-4 mb-6">
                    {chronoWithDate.map((item) => {
                      const d = new Date(item.event.date!)
                      const dateStr = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                      return (
                        <li key={item.event.id} className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-800 font-medium leading-snug">{item.event.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {[dateStr, item.event.category, item.event.location]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {item.rank != null && (
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-1">
                              #{item.rank} overall
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {chronoNoDate.length > 0 && (
                  <>
                    {chronoWithDate.length > 0 && (
                      <p className="text-xs font-medium text-gray-400 mb-3">Date unknown</p>
                    )}
                    <ul className="space-y-4">
                      {chronoNoDate.map((item) => (
                        <li key={item.event.id} className="flex items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-800 font-medium leading-snug">{item.event.name}</p>
                            {(item.event.category || item.event.location) && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {[item.event.category, item.event.location].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                          {item.rank != null && (
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-1">
                              #{item.rank} overall
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* By Category */}
        {tab === "category" && (
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white mb-4"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {selectedCategory && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">{selectedCategory}</h2>
                {categoryFiltered.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No {selectedCategory} experiences added yet.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {categoryFiltered.map((item) => (
                      <EventRow
                        key={item.event.id}
                        rank={item.categoryRank}
                        event={item.event}
                      />
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
