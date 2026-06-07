"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const NAMES = [
  "Emily", "Eunice", "Peighton", "Yixiao", "Tabatha",
  "Ben", "Noah", "Elijah", "Charlie", "Lucas",
  "Quincy", "Joseph", "Brandon", "Gui",
]

type Event = { id: string; name: string; createdAt: string }
type User = { id: string; name: string }

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedName, setSelectedName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
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
    setPasswordError("")
    if (!selectedName) return
    if (password !== "testing") {
      setPasswordError("Incorrect password")
      return
    }
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selectedName }),
    })
    const u = await res.json()
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))
    setPassword("")
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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Events</h1>

        {/* User section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to WhiffenBeli, the place to rank (and reminisce about) Whiffenpoof moments throughout the year. Rank moments, add any you think are missing, and compare your rankings with the other Whiffs!
          </p>
          {user ? (
            <Link
              href="/rank"
              className="inline-block px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Rank Events →
            </Link>
          ) : (
            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-700"
                >
                  <option value="">Select your name...</option>
                  {NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
                    placeholder="Password"
                    className="w-36 pl-4 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Join
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </form>
          )}
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
