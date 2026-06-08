"use client"

import { TIERS, getTier } from "./TierBadge"
import { CoinIcon } from "./CoinIcon"

interface Props {
  coins: number
  onClose: () => void
}

export function TierModal({ coins, onClose }: Props) {
  const currentTier = getTier(coins)
  const currentIndex = TIERS.findIndex((t) => t.name === currentTier.name)
  const nextTier = currentIndex > 0 ? TIERS[currentIndex - 1] : null
  const coinsToNext = nextTier ? nextTier.min - coins : 0

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">Tier Status</h2>
        <p className="text-center text-sm text-gray-400 mb-4">
          {coins} <CoinIcon size={13} className="inline-block align-middle" /> total
        </p>

        <div className="space-y-1.5 mb-5">
          {TIERS.map((tier) => {
            const isCurrent = tier.name === currentTier.name
            return (
              <div
                key={tier.name}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: isCurrent ? tier.bgColor : "transparent",
                  border: isCurrent
                    ? `1.5px solid ${tier.textColor}33`
                    : "1.5px solid transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tier.emoji}</span>
                  <span
                    className="font-semibold"
                    style={{ color: isCurrent ? tier.textColor : "#9ca3af" }}
                  >
                    {tier.name}
                  </span>
                  {isCurrent && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                      you
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>{tier.min.toLocaleString()}+</span>
                  <CoinIcon size={13} />
                </div>
              </div>
            )
          })}
        </div>

        {nextTier ? (
          <p className="text-center text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{coinsToNext}</span> more coins to reach{" "}
            {nextTier.emoji} <span style={{ color: nextTier.textColor }}>{nextTier.name}</span>
          </p>
        ) : (
          <p className="text-center text-sm font-semibold" style={{ color: TIERS[0].textColor }}>
            {TIERS[0].emoji} You&apos;ve reached the highest tier!
          </p>
        )}
      </div>
    </div>
  )
}
