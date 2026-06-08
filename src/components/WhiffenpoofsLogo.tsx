export function WhiffenpoofsLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Whiffenpoofs"
    >
      {/* Body */}
      <path
        d="M4 20 C4 11 11 6 22 6 C33 6 42 11 47 17 C49 19 49 21 47 23 C42 29 33 32 22 32 C11 32 4 27 4 20 Z"
        fill="currentColor"
      />
      {/* Tail */}
      <path d="M44 11 L54 6 L51 20 L54 34 L44 29 Z" fill="currentColor" />
      {/* Belly highlight */}
      <ellipse cx="22" cy="24" rx="13" ry="5" fill="white" opacity="0.15" />
      {/* Dorsal fin */}
      <path d="M24 6 L28 0 L33 6" fill="currentColor" />
      {/* Eye */}
      <circle cx="14" cy="17" r="3" fill="white" />
      <circle cx="15" cy="16" r="1.2" fill="currentColor" />
      {/* Spout */}
      <path
        d="M25 6 C26 2 27.5 0 28.5 1.5 C29 -0.5 30.5 0.5 30 3.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  )
}
