"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MonsterAvatar } from "@/components/MonsterAvatar"
import { CoinIcon } from "@/components/CoinIcon"
import { CHARACTERS, ACCESSORIES, type Category, type Item } from "@/lib/items"

type UserLocal = {
  id: string
  name: string
  coins: number
  character: string
  equipped: string[]
  purchased: string[]
}

type Tab = "character" | "hat" | "shirt" | "shoes" | "misc"

const TABS: { id: Tab; label: string }[] = [
  { id: "character", label: "Characters" },
  { id: "hat",       label: "Hats" },
  { id: "shirt",     label: "Shirts" },
  { id: "shoes",     label: "Shoes" },
  { id: "misc",      label: "Misc" },
]

export default function CustomizePage() {
  const [user, setUser] = useState<UserLocal | null>(null)
  const [character, setCharacter] = useState("blob")
  const [equipped, setEquipped] = useState<string[]>([])
  const [purchased, setPurchased] = useState<string[]>([])
  const [coins, setCoins] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>("character")
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) { router.push("/"); return }
    const u: UserLocal = JSON.parse(stored)
    setUser(u)
    setCharacter(u.character ?? "blob")
    setEquipped(u.equipped ?? [])
    setPurchased(u.purchased ?? [])
    setCoins(u.coins ?? 0)
  }, [router])

  function updateLocalStorage(updates: Partial<UserLocal>) {
    const stored = localStorage.getItem("user")
    if (!stored || !user) return
    const u = JSON.parse(stored)
    localStorage.setItem("user", JSON.stringify({ ...u, ...updates }))
  }

  async function callAvatar(action: string, itemId: string) {
    if (!user) return
    setLoading(itemId)
    try {
      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, itemId }),
      })
      if (!res.ok) { setLoading(null); return }
      const data: { character: string; equipped: string[]; purchased: string[]; coins: number } = await res.json()
      setCharacter(data.character)
      setEquipped(data.equipped)
      setPurchased(data.purchased)
      setCoins(data.coins)
      updateLocalStorage({ character: data.character, equipped: data.equipped, purchased: data.purchased, coins: data.coins })
    } catch {
      // non-critical
    }
    setLoading(null)
  }

  if (!user) return null

  const tabItems: Item[] = activeTab === "character"
    ? CHARACTERS
    : ACCESSORIES.filter((a) => a.category === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          ‹ Profile
        </Link>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col items-center">
          <div className="w-40 h-52 overflow-hidden flex items-center justify-center">
            <MonsterAvatar character={character} equipped={equipped} size={120} />
          </div>
          <p className="mt-3 font-semibold text-gray-800 text-lg">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-yellow-500">
            <CoinIcon size={16} />
            <span>{coins} coins</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {tabItems.map((item) => {
            const isFree = item.cost === 0
            const isOwned = isFree || purchased.includes(item.id)
            const isActive = activeTab === "character"
              ? character === item.id
              : equipped.includes(item.id)
            const canAfford = coins >= item.cost

            let btnLabel = ""
            let btnDisabled = false
            let btnVariant: "primary" | "secondary" | "ghost" | "danger" = "secondary"

            if (activeTab === "character") {
              if (isActive) { btnLabel = "Active"; btnDisabled = true; btnVariant = "ghost" }
              else if (isOwned) { btnLabel = "Use"; btnVariant = "primary" }
              else if (canAfford) { btnLabel = `${item.cost}`; btnVariant = "primary" }
              else { btnLabel = `${item.cost}`; btnDisabled = true; btnVariant = "ghost" }
            } else {
              if (isActive) { btnLabel = "✓ On"; btnVariant = "danger" }
              else if (isOwned) { btnLabel = "Equip"; btnVariant = "primary" }
              else if (canAfford) { btnLabel = `${item.cost}`; btnVariant = "primary" }
              else { btnLabel = `${item.cost}`; btnDisabled = true; btnVariant = "ghost" }
            }

            function handleClick() {
              if (btnDisabled) return
              if (activeTab === "character") {
                if (isOwned) { callAvatar("set-character", item.id) }
                else { callAvatar("purchase", item.id) }
              } else {
                if (isOwned) { callAvatar("toggle-equip", item.id) }
                else { callAvatar("purchase", item.id) }
              }
            }

            const isLoading = loading === item.id

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                  isActive ? "border-black" : "border-gray-100"
                }`}
              >
                {/* Preview */}
                <div className="flex items-center justify-center py-4 bg-gray-50" style={{ minHeight: 96 }}>
                  <MonsterAvatar
                    character={activeTab === "character" ? item.id : character}
                    equipped={activeTab === "character" ? equipped : [item.id]}
                    size={64}
                  />
                </div>

                {/* Info */}
                <div className="px-2.5 pb-3 pt-2">
                  <p className="text-xs font-semibold text-gray-800 truncate mb-1.5">{item.name}</p>
                  <button
                    disabled={btnDisabled || isLoading}
                    onClick={handleClick}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      btnVariant === "primary"
                        ? "bg-black text-white hover:bg-neutral-800"
                        : btnVariant === "danger"
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-gray-100 text-gray-400 cursor-default"
                    }`}
                  >
                    {isLoading ? (
                      <span className="animate-spin">↻</span>
                    ) : (
                      <>
                        {!isOwned && !isActive && <CoinIcon size={11} />}
                        {btnLabel}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {activeTab !== "character" && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Tap an equipped accessory to remove it
          </p>
        )}
      </div>
    </div>
  )
}
