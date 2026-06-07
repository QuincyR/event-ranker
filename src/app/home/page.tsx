"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Event = { id: string; name: string; createdAt: string }
type User = { id: string; name: string }

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.replace("/"); return }
    setUser(JSON.parse(stored))
    fetchEvents()
  }, [router])

  async function fetchEvents() {
    const res = await fetch("/api/events")
    const data = await res.json()
    setEvents(data)
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!newEvent.trim() || loading) return
    setLoading(true)
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newEvent.trim() }),
    })
    setNewEvent("")
    await fetchEvents()
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Welcome card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to WhiffenBeli, the place to rank (and reminisce about) Whiffenpoof moments throughout the year. Rank moments, add any you think are missing, and compare your rankings with the other Whiffs!
          </p>
          <Link
            href="/rank"
            className="inline-block px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Rank Events →
          </Link>
        </div>

        {/* Events section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">
            Events{" "}
            <span className="text-gray-400 font-normal text-sm">({events.length})</span>
          </h2>

          <form onSubmit={handleAddEvent} className="flex gap-3 mb-5">
            <input
              type="text"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              placeholder="Add an event..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </form>

          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No events yet. Add the first one!</p>
          ) : (
            <ul className="space-y-2">
              {events.map((event, i) => (
                <li key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-300 w-5 text-right">{i + 1}</span>
                  <span className="text-gray-800">{event.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
