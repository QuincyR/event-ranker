"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TierBadge } from "@/components/TierBadge"
import { TierModal } from "@/components/TierModal"
import { MonsterAvatar } from "@/components/MonsterAvatar"

type UserLocal = {
  id: string
  name: string
  coins?: number
  rankedCount?: number
  character?: string
  equipped?: string[]
}

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
  const [user, setUser] = useState<UserLocal | null>(null)
  const [rankCount, setRankCount] = useState<{ ranked: number; total: number } | null>(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showTierModal, setShowTierModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.push("/"); return }
    const u: UserLocal = JSON.parse(stored)
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

  const rankedCount = user.rankedCount ?? rankCount?.ranked ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="flex items-center gap-5 mb-10">
          <Link href="/customize" className="shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              <MonsterAvatar
                character={user.character ?? "blob"}
                equipped={user.equipped ?? []}
                size={64}
              />
            </div>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {rankCount && (
              <p className="text-sm text-gray-400 mt-0.5">
                {rankCount.ranked} of {rankCount.total} experiences ranked
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setShowTierModal(true)}
                className="cursor-pointer"
                title="Click to see tier requirements"
              >
                <TierBadge ranked={rankedCount} />
              </button>
              <Link
                href="/customize"
                className="text-xs text-[#C8102E] font-medium hover:underline"
              >
                Customize avatar →
              </Link>
            </div>
          </div>
        </div>

        {showTierModal && (
          <TierModal ranked={rankedCount} onClose={() => setShowTierModal(false)} />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <Row href="/rank" label="My Ranking" description="View and continue ranking experiences" />
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
          <Row href="/rankings" label="View Rankings" description="Overall, personal, chronological, and by category" />
          <Row href="/home" label="All Experiences" description="Browse rankings and add to the shared experience list" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <Row onClick={handleSignOut} label="Sign Out" danger />
        </div>
      </div>
    </div>
  )
}
