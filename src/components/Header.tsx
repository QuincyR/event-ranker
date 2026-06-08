"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CoinAnimation, COIN_ANIM_DURATION_MS } from "./CoinAnimation"
import { CoinIcon } from "./CoinIcon"
import { TierBadge } from "./TierBadge"

type User = { id: string; name: string; coins?: number }

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [displayedCoins, setDisplayedCoins] = useState(0)
  const [coinGain, setCoinGain] = useState<{ amount: number } | null>(null)
  const [bump, setBump] = useState(false)
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const displayedRef = useRef(0)   // mirrors displayedCoins for use inside event closures
  const targetRef = useRef(0)       // current count-up target; mini events extend it

  // Keep user + coins in sync with localStorage on every navigation
  useEffect(() => {
    const stored = localStorage.getItem("user")
    const u: User | null = stored ? JSON.parse(stored) : null
    setUser(u)
    if (u) {
      const coins = u.coins ?? 0
      displayedRef.current = coins
      setDisplayedCoins(coins)
    }
  }, [pathname])

  // Listen for coinGain events dispatched by any page
  useEffect(() => {
    function handleCoinGain(e: Event) {
      const { from, amount, mini } = (e as CustomEvent<{ from: number; amount: number; mini?: boolean }>).detail

      if (mini) {
        if (countIntervalRef.current) {
          // A full animation is already counting up — just extend its target
          targetRef.current += amount
        } else {
          const newVal = from + amount
          displayedRef.current = newVal
          setDisplayedCoins(newVal)
          setBump(true)
          setTimeout(() => setBump(false), 400)
        }
        return
      }

      // Full flying-coin animation.
      // Start from the higher of `from` and the current displayed value so the
      // counter never ticks backward if a mini bump already moved it forward.
      const safeStart = Math.max(from, displayedRef.current)
      displayedRef.current = safeStart
      setDisplayedCoins(safeStart)
      setCoinGain({ amount })

      if (countIntervalRef.current) clearInterval(countIntervalRef.current)

      targetRef.current = safeStart + amount
      let current = safeStart
      const tick = Math.max(50, COIN_ANIM_DURATION_MS / amount)
      countIntervalRef.current = setInterval(() => {
        current += 1
        displayedRef.current = current
        setDisplayedCoins(current)
        if (current >= targetRef.current) {
          clearInterval(countIntervalRef.current!)
          countIntervalRef.current = null
          setBump(true)
          setTimeout(() => setBump(false), 400)
        }
      }, tick)
    }

    window.addEventListener("coinGain", handleCoinGain)
    return () => {
      window.removeEventListener("coinGain", handleCoinGain)
      if (countIntervalRef.current) clearInterval(countIntervalRef.current)
    }
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-10 bg-black border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={user ? "/home" : "/"} className="flex items-center gap-2.5">
            <Image
              src="/whiffenpoofs-logo.png"
              alt="Whiffenpoofs"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-bold text-white text-lg tracking-tight">WhiffenBeli</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              {/* Tier badge */}
              <TierBadge coins={displayedCoins} />

              {/* Coin counter */}
              <div
                id="coin-counter"
                className="flex items-center gap-1.5 text-sm font-semibold text-yellow-400"
                style={{ transform: bump ? "scale(1.35)" : "scale(1)", transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                <CoinIcon size={22} />
                <span>{displayedCoins}</span>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <span className="hidden sm:block">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-sm font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Coin animation overlay — rendered outside the header so it covers the full viewport */}
      {coinGain && (
        <CoinAnimation
          amount={coinGain.amount}
          onComplete={() => setCoinGain(null)}
        />
      )}
    </>
  )
}
