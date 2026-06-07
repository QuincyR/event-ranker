"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Event = { id: string; name: string; createdAt: string }
type User = { id: string; name: string }

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(JSON.parse(stored))
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const res = await fetch("/api/events")
    const data = await res.json()
    setEvents(data)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!nameInput.trim()) return
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    })
    const u = await res.json()
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))
    setNameInput("")
  }

  function handleSignOut() {
    localStorage.removeItem("user")
    setUser(null)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Ranker</h1>
        <p className="text-gray-500 mb-10">Rank events head-to-head with friends.</p>

        {/* User section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/rank"
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Rank Events →
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="flex gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name to get started"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Join
              </button>
            </form>
          )}
        </div>

        {/* Events section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">
              Events{" "}
              <span className="text-gray-400 font-normal text-sm">({events.length})</span>
            </h2>
          </div>

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
            <p className="text-gray-400 text-sm text-center py-6">
              No events yet. Add the first one!
            </p>
          ) : (
            <ul className="space-y-2">
              {events.map((event, i) => (
                <li
                  key={event.id}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
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
