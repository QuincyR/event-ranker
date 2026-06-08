"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const NAMES = [
  "Emily", "Eunice", "Peighton", "Yixiao", "Tabatha",
  "Ben", "Noah", "Elijah", "Charlie", "Lucas",
  "Quincy", "Joseph", "Brandon", "Gui",
]

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

export default function SignInPage() {
  const [selectedName, setSelectedName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) router.replace("/home")
  }, [router])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!selectedName) { setError("Please select your name"); return }
    if (password !== "testing") { setError("Incorrect password"); return }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selectedName }),
    })
    const u = await res.json()
    localStorage.setItem("user", JSON.stringify(u))
    router.push("/home")
  }

  return (
    <div className="min-h-screen bg-[#00356B] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">WhiffenBeli</h1>
        <p className="text-blue-200 text-sm">Rank the year&apos;s Whiffenpoof memories</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <select
            value={selectedName}
            onChange={(e) => { setSelectedName(e.target.value); setError("") }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00356B] bg-white text-gray-700"
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
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              placeholder="Password"
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00356B]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#00356B] text-white rounded-lg text-sm font-medium hover:bg-[#002654] transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
