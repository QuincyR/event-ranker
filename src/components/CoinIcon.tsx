interface Props {
  size?: number
  className?: string
}

export function CoinIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coin 3 — bottom */}
      <ellipse cx="12" cy="19.5" rx="8.5" ry="2.5" fill="#92400e" />
      <rect x="3.5" y="17" width="17" height="2.5" fill="#b45309" />
      <ellipse cx="12" cy="17" rx="8.5" ry="2.5" fill="#fbbf24" />

      {/* Coin 2 — middle */}
      <ellipse cx="12" cy="14" rx="8.5" ry="2.5" fill="#92400e" />
      <rect x="3.5" y="11.5" width="17" height="2.5" fill="#b45309" />
      <ellipse cx="12" cy="11.5" rx="8.5" ry="2.5" fill="#fcd34d" />

      {/* Coin 1 — top */}
      <ellipse cx="12" cy="8.5" rx="8.5" ry="2.5" fill="#92400e" />
      <rect x="3.5" y="6" width="17" height="2.5" fill="#b45309" />
      <ellipse cx="12" cy="6" rx="8.5" ry="2.5" fill="#fde68a" />
    </svg>
  )
}
