"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MonsterAvatar } from "@/components/MonsterAvatar"
import { CoinIcon } from "@/components/CoinIcon"
import { CHARACTERS, ACCESSORIES, type Item } from "@/lib/items"

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

function ConfirmModal({
  item,
  coins,
  onConfirm,
  onCancel,
  loading,
}: {
  item: Item
  coins: number
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const canAfford = coins >= item.cost
  const remaining = coins - item.cost

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-gray-900 mb-1">Unlock {item.name}?</h2>
        <p className="text-sm text-gray-400 mb-5">{item.description}</p>

        {/* Preview */}
        <div className="flex items-center justify-center bg-gray-50 rounded-xl py-4 mb-5">
          <MonsterAvatar
            character={item.category === "character" ? item.id : "blob"}
            equipped={item.category === "character" ? [] : [item.id]}
            size={80}
          />
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <CoinIcon size={18} />
            <span>{item.cost} coins</span>
          </div>
          <span className={`text-xs font-medium ${canAfford ? "text-green-600" : "text-red-500"}`}>
            {canAfford
              ? `${remaining} remaining after`
              : `Need ${item.cost - coins} more coins`}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford || loading}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {loading ? <span className="animate-spin">↻</span> : (
              <>
                <CoinIcon size={14} />
                Buy {item.cost}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomizePage() {
  const [user, setUser] = useState<UserLocal | null>(null)
  const [character, setCharacter] = useState("blob")
  const [equipped, setEquipped] = useState<string[]>([])
  const [purchased, setPurchased] = useState<string[]>([])
  const [coins, setCoins] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>("character")
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<Item | null>(null)
  const [spendNotif, setSpendNotif] = useState<{ amount: number; key: number } | null>(null)
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
    localStorage.setItem("user", JSON.stringify({ ...JSON.parse(stored), ...updates }))
  }

  async function callAvatar(action: string, itemId: string, cost = 0) {
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

      if (cost > 0) {
        window.dispatchEvent(new CustomEvent("coinSpend", { detail: { newTotal: data.coins } }))
        setSpendNotif({ amount: cost, key: Date.now() })
        setTimeout(() => setSpendNotif(null), 1200)
      }
    } catch {
      // non-critical
    }
    setLoading(null)
    setConfirmItem(null)
  }

  if (!user) return null

  const tabItems: Item[] = activeTab === "character"
    ? CHARACTERS
    : ACCESSORIES.filter((a) => a.category === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          ‹ Profile
        </Link>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col items-center relative overflow-hidden">
          <div className="w-40 h-52 overflow-hidden flex items-center justify-center">
            <MonsterAvatar character={character} equipped={equipped} size={120} />
          </div>
          <p className="mt-3 font-semibold text-gray-800 text-lg">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-yellow-500 relative">
            <CoinIcon size={16} />
            <span>{coins} coins</span>
            {spendNotif && (
              <span
                key={spendNotif.key}
                className="absolute left-full ml-2 text-red-500 font-bold text-sm pointer-events-none"
                style={{ animation: "floatUp 1.2s ease forwards" }}
              >
                -{spendNotif.amount}
              </span>
            )}
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
            let btnStyle = ""
            let btnDisabled = false

            if (activeTab === "character") {
              if (isActive) { btnLabel = "Active"; btnStyle = "bg-gray-100 text-gray-400"; btnDisabled = true }
              else if (isOwned) { btnLabel = "Use"; btnStyle = "bg-black text-white hover:bg-neutral-800" }
              else if (canAfford) { btnLabel = `${item.cost}`; btnStyle = "bg-black text-white hover:bg-neutral-800" }
              else { btnLabel = `${item.cost}`; btnStyle = "bg-gray-100 text-gray-300"; btnDisabled = true }
            } else {
              if (isActive) { btnLabel = "✓ On"; btnStyle = "bg-red-50 text-red-500 hover:bg-red-100" }
              else if (isOwned) { btnLabel = "Equip"; btnStyle = "bg-black text-white hover:bg-neutral-800" }
              else if (canAfford) { btnLabel = `${item.cost}`; btnStyle = "bg-black text-white hover:bg-neutral-800" }
              else { btnLabel = `${item.cost}`; btnStyle = "bg-gray-100 text-gray-300"; btnDisabled = true }
            }

            function handleClick() {
              if (btnDisabled) return
              if (!isOwned) {
                setConfirmItem(item)
                return
              }
              if (activeTab === "character") { callAvatar("set-character", item.id) }
              else { callAvatar("toggle-equip", item.id) }
            }

            const isLoading = loading === item.id

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
                  isActive ? "border-black shadow-sm" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-center py-4 bg-gray-50" style={{ minHeight: 96 }}>
                  <MonsterAvatar
                    character={activeTab === "character" ? item.id : character}
                    equipped={activeTab === "character" ? equipped : [item.id]}
                    size={64}
                  />
                </div>
                <div className="px-2.5 pb-3 pt-2">
                  <p className="text-xs font-semibold text-gray-800 truncate mb-1.5">{item.name}</p>
                  <button
                    disabled={btnDisabled || isLoading}
                    onClick={handleClick}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${btnStyle} ${btnDisabled ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {isLoading ? (
                      <span className="animate-spin inline-block">↻</span>
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
            Tap an equipped item to remove it
          </p>
        )}
      </div>

      {confirmItem && (
        <ConfirmModal
          item={confirmItem}
          coins={coins}
          loading={loading === confirmItem.id}
          onConfirm={() => callAvatar("purchase", confirmItem.id, confirmItem.cost)}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    </div>
  )
}
