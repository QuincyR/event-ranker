"use client"

export const TIERS = [
  { name: "Diamond", min: 500, emoji: "💎", textColor: "#38bdf8", bgColor: "#eff6ff" },
  { name: "Platinum", min: 250, emoji: "🔷", textColor: "#64748b", bgColor: "#f1f5f9" },
  { name: "Gold",     min: 100, emoji: "🥇", textColor: "#d97706", bgColor: "#fffbeb" },
  { name: "Silver",   min: 20,  emoji: "🥈", textColor: "#475569", bgColor: "#f8fafc" },
  { name: "Bronze",   min: 0,   emoji: "🥉", textColor: "#92400e", bgColor: "#fef3c7" },
]

export function getTier(ranked: number) {
  return TIERS.find((t) => ranked >= t.min) ?? TIERS[TIERS.length - 1]
}

export function TierBadge({ ranked }: { ranked: number }) {
  const tier = getTier(ranked)
  return (
    <span
      className="flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5 whitespace-nowrap"
      style={{ color: tier.textColor, backgroundColor: tier.bgColor }}
    >
      <span>{tier.emoji}</span>
      <span>{tier.name}</span>
    </span>
  )
}
