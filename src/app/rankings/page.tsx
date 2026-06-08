"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CATEGORIES, NAMES, CATEGORY_SEASON_ORDER } from "@/lib/constants"

type EventData = {
  id: string
  name: string
  location?: string | null
  description?: string | null
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
        {event.description && (
          <p className="text-xs text-gray-400 mt-0.5 italic">{event.description}</p>
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

  async function handleSetDate(eventId: string, dateStr: string) {
    const date = dateStr || null
    setAllRankings((prev) =>
      prev.map((item) =>
        item.event.id === eventId
          ? { ...item, event: { ...item.event, date: date ? new Date(date + "T12:00:00Z").toISOString() : null } }
          : item
      )
    )
    await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    })
  }

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

  const chronoWithDate = [...allRankings]
    .filter((x) => x.event.date)
    .sort((a, b) => new Date(a.event.date!).getTime() - new Date(b.event.date!).getTime())
  const chronoNoDate = [...allRankings]
    .filter((x) => !x.event.date)
    .sort((a, b) => {
      const aOrder = CATEGORY_SEASON_ORDER[a.event.category ?? ""] ?? 99
      const bOrder = CATEGORY_SEASON_ORDER[b.event.category ?? ""] ?? 99
      return aOrder !== bOrder ? aOrder - bOrder : a.event.name.localeCompare(b.event.name)
    })

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
                  ? "bg-white shadow-sm text-[#C8102E] font-semibold"
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
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white mb-4"
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
            <h2 className="font-semibold text-gray-900 mb-1">Year in Review</h2>
            {chronoNoDate.length > 0 && (
              <div className="mt-3 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-medium text-amber-800">
                  {chronoNoDate.length} experience{chronoNoDate.length !== 1 ? "s" : ""} need{chronoNoDate.length === 1 ? "s" : ""} a date
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Use the date fields on the right to place them in the timeline — they&apos;ll move up automatically.
                </p>
              </div>
            )}
            {allRankings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No experiences added yet.</p>
            ) : (
              <>
                {chronoWithDate.length > 0 && (
                  <ul className="divide-y divide-gray-50">
                    {chronoWithDate.map((item) => {
                      const dateStr = new Date(item.event.date!).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                      const meta = [dateStr, item.event.category, item.event.location].filter(Boolean).join(" · ")
                      return (
                        <li key={item.event.id} className="flex items-start gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-800 font-medium leading-snug">{item.event.name}</p>
                            {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
                            {item.event.description && <p className="text-xs text-gray-400 mt-0.5 italic">{item.event.description}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                            {item.rank != null && <span className="text-xs text-gray-400">#{item.rank} overall</span>}
                            <input
                              type="date"
                              value={item.event.date ? item.event.date.substring(0, 10) : ""}
                              onChange={(e) => handleSetDate(item.event.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#C8102E] bg-white"
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {chronoNoDate.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-2">
                      {chronoWithDate.length > 0 ? "No date yet — click to add" : "No dates set yet — click to add"}
                    </p>
                    <ul className="divide-y divide-gray-50">
                      {chronoNoDate.map((item) => {
                        const meta = [item.event.category, item.event.location].filter(Boolean).join(" · ")
                        return (
                          <li key={item.event.id} className="flex items-start gap-3 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-800 font-medium leading-snug">{item.event.name}</p>
                              {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
                              {item.event.description && <p className="text-xs text-gray-400 mt-0.5 italic">{item.event.description}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                              {item.rank != null && <span className="text-xs text-gray-400">#{item.rank} overall</span>}
                              <input
                                type="date"
                                value=""
                                onChange={(e) => handleSetDate(item.event.id, e.target.value)}
                                className="text-xs border-2 border-dashed border-amber-300 rounded px-1.5 py-1 text-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 bg-amber-50 cursor-pointer"
                              />
                            </div>
                          </li>
                        )
                      })}
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
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-white mb-4"
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
