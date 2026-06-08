"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type User = { id: string; name: string }

function Row({
  href,
  onClick,
  label,
  description,
  danger,
}: {
  href?: string
  onClick?: () => void
  label: string
  description?: string
  danger?: boolean
}) {
  const classes = `flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 transition-colors w-full text-left ${
    danger ? "hover:bg-red-50" : "hover:bg-gray-50"
  }`

  const content = (
    <>
      <div>
        <p className={`font-medium ${danger ? "text-red-500" : "text-gray-900"}`}>{label}</p>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      <span className={danger ? "text-red-400" : "text-gray-300"}>›</span>
    </>
  )

  if (href) return <Link href={href} className={classes}>{content}</Link>
  return <button onClick={onClick} className={classes}>{content}</button>
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [rankCount, setRankCount] = useState<{ ranked: number; total: number } | null>(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.push("/"); return }
    const u: User = JSON.parse(stored)
    setUser(u)

    fetch(`/api/users/${u.id}/ranking`)
      .then((r) => r.json())
      .then(({ ranked, unranked }) => {
        setRankCount({ ranked: ranked.length, total: ranked.length + unranked.length })
      })
      .catch(() => {})
  }, [router])

  function handleSignOut() {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-full bg-[#00356B] text-white flex items-center justify-center text-2xl font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {rankCount && (
              <p className="text-sm text-gray-400 mt-0.5">
                {rankCount.ranked} of {rankCount.total} experiences ranked
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <Row
            href="/rank"
            label="My Ranking"
            description="View and continue ranking experiences"
          />
          <Row
            onClick={() => setShowPasswordChange((v) => !v)}
            label="Change Password"
            description="Update your account password"
          />
          {showPasswordChange && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                Passwords are managed by the admin. Contact Quincy to change yours.
              </p>
            </div>
          )}
          <Row
            href="/rankings"
            label="View Rankings"
            description="Overall, personal, chronological, and by category"
          />
          <Row
            href="/home"
            label="All Experiences"
            description="Browse rankings and add to the shared experience list"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <Row
            onClick={handleSignOut}
            label="Sign Out"
            danger
          />
        </div>
      </div>
    </div>
  )
}
