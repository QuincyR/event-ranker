"use client"

import { useEffect, useRef, useState } from "react"

// Total coins in the visual burst (independent of coin amount)
const NUM_COINS = 10

// Match this to the duration used when counting up in Header
export const COIN_ANIM_DURATION_MS = (NUM_COINS - 1) * 75 + 350 + 650

interface Props {
  amount: number
  onComplete: () => void
}

export function CoinAnimation({ amount, onComplete }: Props) {
  type Phase = "idle" | "show" | "fly"
  const [phases, setPhases] = useState<Phase[]>(() => Array(NUM_COINS).fill("idle"))
  const [pos, setPos] = useState({ cx: 0, cy: 0, tx: 0, ty: 0 })
  const [labelVisible, setLabelVisible] = useState(true)

  // Stable per-coin jitter, computed once on mount
  const jitter = useRef(
    Array.from({ length: NUM_COINS }, () => ({
      x: (Math.random() - 0.5) * 180,
      y: (Math.random() - 0.5) * 130,
    }))
  ).current

  useEffect(() => {
    const el = document.getElementById("coin-counter")
    const rect = el?.getBoundingClientRect()
    setPos({
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
      tx: rect ? rect.left + rect.width / 2 : window.innerWidth - 70,
      ty: rect ? rect.top + rect.height / 2 : 28,
    })

    // Stagger each coin: show → fly
    for (let i = 0; i < NUM_COINS; i++) {
      setTimeout(() => {
        setPhases(p => { const n = [...p]; n[i] = "show"; return n })
      }, i * 75)
      setTimeout(() => {
        setPhases(p => { const n = [...p]; n[i] = "fly"; return n })
      }, i * 75 + 350)
    }

    // Fade out label slightly before coins fly
    setTimeout(() => setLabelVisible(false), 250)

    setTimeout(onComplete, COIN_ANIM_DURATION_MS)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { cx, cy, tx, ty } = pos

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      {/* "+N 🪙" reward label */}
      <div
        className="fixed font-extrabold text-yellow-400 text-3xl select-none"
        style={{
          left: cx,
          top: cy - 90,
          transform: "translate(-50%, -50%)",
          opacity: labelVisible ? 1 : 0,
          transition: "opacity 0.3s",
          textShadow: "0 2px 12px rgba(0,0,0,0.25)",
          letterSpacing: "-0.5px",
        }}
      >
        +{amount} 🪙
      </div>

      {Array.from({ length: NUM_COINS }, (_, i) => {
        const phase = phases[i]
        const coinX = phase === "fly" ? tx : cx + jitter[i].x
        const coinY = phase === "fly" ? ty : cy + jitter[i].y
        const scale = phase === "fly" ? 0.2 : phase === "show" ? 1 : 0
        const opacity = phase === "fly" ? 0 : phase === "show" ? 1 : 0

        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              fontSize: "2rem",
              lineHeight: 1,
              userSelect: "none",
              transform: `translate(${coinX}px, ${coinY}px) translate(-50%, -50%) scale(${scale})`,
              opacity,
              transition:
                phase === "fly"
                  ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s 0.38s"
                  : phase === "show"
                  ? "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.12s"
                  : "none",
            }}
          >
            🪙
          </div>
        )
      })}
    </div>
  )
}
