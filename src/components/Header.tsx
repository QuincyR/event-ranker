"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CoinAnimation, COIN_ANIM_DURATION_MS } from "./CoinAnimation"
import { CoinIcon } from "./CoinIcon"

type User = { id: string; name: string; coins?: number }

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [displayedCoins, setDisplayedCoins] = useState(0)
  const [coinGain, setCoinGain] = useState<{ amount: number } | null>(null)
  const [bump, setBump] = useState(false)
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep user + coins in sync with localStorage on every navigation
  useEffect(() => {
    const stored = localStorage.getItem("user")
    const u: User | null = stored ? JSON.parse(stored) : null
    setUser(u)
    if (u) setDisplayedCoins(u.coins ?? 0)
  }, [pathname])

  // Listen for coinGain events dispatched by any page
  useEffect(() => {
    function handleCoinGain(e: Event) {
      const { from, amount } = (e as CustomEvent<{ from: number; amount: number }>).detail

      // Reset counter to pre-gain value, then count up
      setDisplayedCoins(from)
      setCoinGain({ amount })

      if (countIntervalRef.current) clearInterval(countIntervalRef.current)

      const target = from + amount
      let current = from
      const tick = Math.max(50, COIN_ANIM_DURATION_MS / amount)
      countIntervalRef.current = setInterval(() => {
        current += 1
        setDisplayedCoins(current)
        if (current >= target) {
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
