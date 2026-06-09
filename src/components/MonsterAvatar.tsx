"use client"

import React from "react"

type Props = {
  character?: string
  equipped?: string[]
  size?: number
  className?: string
}

// ── Monsters ─────────────────────────────────────────────────────────────────

function Blob() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="33" ry="34" fill="#60a5fa" />
      <circle cx="50" cy="46" r="28" fill="#60a5fa" />
      <circle cx="23" cy="44" r="12" fill="#60a5fa" />
      <circle cx="77" cy="44" r="12" fill="#60a5fa" />
      <circle cx="38" cy="44" r="10" fill="white" />
      <circle cx="62" cy="44" r="10" fill="white" />
      <circle cx="40" cy="46" r="5.5" fill="#1d4ed8" />
      <circle cx="64" cy="46" r="5.5" fill="#1d4ed8" />
      <circle cx="42" cy="44" r="2" fill="white" />
      <circle cx="66" cy="44" r="2" fill="white" />
      <path d="M 38 59 Q 50 70 62 59" stroke="#1d4ed8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#3b82f6" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#3b82f6" />
    </>
  )
}

function Cyclops() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="30" ry="34" fill="#4ade80" />
      <circle cx="50" cy="46" r="28" fill="#4ade80" />
      <polygon points="40,20 44,8 48,20" fill="#16a34a" />
      <polygon points="50,18 54,6 58,18" fill="#16a34a" />
      <polygon points="58,22 64,12 65,24" fill="#16a34a" />
      <circle cx="50" cy="44" r="18" fill="white" />
      <circle cx="50" cy="44" r="11" fill="#15803d" />
      <circle cx="50" cy="44" r="6" fill="#052e16" />
      <circle cx="54" cy="40" r="3" fill="white" />
      <path d="M 31 65 Q 50 78 69 65" stroke="#15803d" strokeWidth="2" fill="none" />
      <line x1="38" y1="66" x2="38" y2="74" stroke="#15803d" strokeWidth="2" />
      <line x1="45" y1="68" x2="45" y2="76" stroke="#15803d" strokeWidth="2" />
      <line x1="55" y1="68" x2="55" y2="76" stroke="#15803d" strokeWidth="2" />
      <line x1="62" y1="66" x2="62" y2="74" stroke="#15803d" strokeWidth="2" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#22c55e" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#22c55e" />
    </>
  )
}

function Spiky() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="32" ry="34" fill="#c084fc" />
      <circle cx="50" cy="46" r="26" fill="#c084fc" />
      <polygon points="28,30 22,16 36,26" fill="#9333ea" />
      <polygon points="50,20 47,5 53,5" fill="#9333ea" />
      <polygon points="72,30 78,16 64,26" fill="#9333ea" />
      <polygon points="38,22 34,10 44,20" fill="#9333ea" />
      <polygon points="62,22 66,10 56,20" fill="#9333ea" />
      <circle cx="38" cy="46" r="8" fill="white" />
      <circle cx="62" cy="46" r="8" fill="white" />
      <circle cx="39" cy="47" r="4.5" fill="#581c87" />
      <circle cx="63" cy="47" r="4.5" fill="#581c87" />
      <circle cx="41" cy="45" r="1.5" fill="white" />
      <circle cx="65" cy="45" r="1.5" fill="white" />
      <path d="M 40 60 Q 50 68 60 60" stroke="#7e22ce" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#a855f7" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#a855f7" />
    </>
  )
}

function Sleepy() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="32" ry="34" fill="#fb923c" />
      <circle cx="50" cy="46" r="27" fill="#fb923c" />
      <circle cx="27" cy="56" r="9" fill="#fef3c7" opacity="0.7" />
      <circle cx="73" cy="56" r="9" fill="#fef3c7" opacity="0.7" />
      <ellipse cx="38" cy="50" rx="11" ry="7" fill="white" />
      <ellipse cx="62" cy="50" rx="11" ry="7" fill="white" />
      <ellipse cx="38" cy="52" rx="7" ry="4.5" fill="#c2410c" />
      <ellipse cx="62" cy="52" rx="7" ry="4.5" fill="#c2410c" />
      <rect x="27" y="43" width="22" height="8" rx="4" fill="#fb923c" />
      <rect x="51" y="43" width="22" height="8" rx="4" fill="#fb923c" />
      <path d="M 40 65 Q 50 60 60 65" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#f97316" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#f97316" />
    </>
  )
}

function Blossom() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="32" ry="34" fill="#f9a8d4" />
      <circle cx="50" cy="46" r="27" fill="#f9a8d4" />
      <circle cx="27" cy="56" r="10" fill="#fda4af" opacity="0.7" />
      <circle cx="73" cy="56" r="10" fill="#fda4af" opacity="0.7" />
      <circle cx="38" cy="46" r="10" fill="white" />
      <circle cx="62" cy="46" r="10" fill="white" />
      <circle cx="38" cy="46" r="5.5" fill="#be185d" />
      <circle cx="62" cy="46" r="5.5" fill="#be185d" />
      <line x1="38" y1="40" x2="38" y2="52" stroke="white" strokeWidth="2" />
      <line x1="32" y1="46" x2="44" y2="46" stroke="white" strokeWidth="2" />
      <line x1="62" y1="40" x2="62" y2="52" stroke="white" strokeWidth="2" />
      <line x1="56" y1="46" x2="68" y2="46" stroke="white" strokeWidth="2" />
      <path d="M 36 60 Q 50 74 64 60" stroke="#be185d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#ec4899" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#ec4899" />
    </>
  )
}

function Dragon() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="32" ry="34" fill="#f97316" />
      <circle cx="50" cy="46" r="27" fill="#f97316" />
      <path d="M 30 28 Q 22 12 32 18 Q 36 26 38 30" fill="#c2410c" />
      <path d="M 70 28 Q 78 12 68 18 Q 64 26 62 30" fill="#c2410c" />
      <ellipse cx="38" cy="46" rx="10" ry="9" fill="#fef3c7" />
      <ellipse cx="62" cy="46" rx="10" ry="9" fill="#fef3c7" />
      <polygon points="38,39 41,46 38,53 35,46" fill="#450a0a" />
      <polygon points="62,39 65,46 62,53 59,46" fill="#450a0a" />
      <circle cx="47" cy="59" r="2" fill="#c2410c" />
      <circle cx="53" cy="59" r="2" fill="#c2410c" />
      <path d="M 38 65 Q 50 75 62 65" stroke="#c2410c" strokeWidth="2.5" fill="none" />
      <polygon points="47,65 49,75 51,65" fill="white" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#ea580c" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#ea580c" />
    </>
  )
}

function Aqua() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="32" ry="34" fill="#2dd4bf" />
      <circle cx="50" cy="46" r="27" fill="#2dd4bf" />
      <path d="M 19 40 L 10 24 L 26 36 Z" fill="#0d9488" />
      <path d="M 81 40 L 90 24 L 74 36 Z" fill="#0d9488" />
      <path d="M 26 80 Q 38 70 50 80 Q 62 70 74 80" stroke="#0d9488" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M 22 94 Q 36 84 50 94 Q 64 84 78 94" stroke="#0d9488" strokeWidth="1.5" fill="none" opacity="0.6" />
      <ellipse cx="38" cy="46" rx="11" ry="8" fill="white" />
      <ellipse cx="62" cy="46" rx="11" ry="8" fill="white" />
      <ellipse cx="38" cy="46" rx="7" ry="4.5" fill="#0f766e" />
      <ellipse cx="62" cy="46" rx="7" ry="4.5" fill="#0f766e" />
      <circle cx="40" cy="44" r="2" fill="white" />
      <circle cx="64" cy="44" r="2" fill="white" />
      <path d="M 38 60 Q 44 66 50 60 Q 56 54 62 60" stroke="#0f766e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#14b8a6" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#14b8a6" />
    </>
  )
}

function Ghost() {
  return (
    <>
      <path d="M 16 78 A 34 36 0 0 1 84 78 L 84 108 Q 76 94 68 108 Q 60 94 50 108 Q 40 94 32 108 Q 24 94 16 108 Z" fill="#818cf8" />
      <circle cx="50" cy="44" r="28" fill="#818cf8" />
      <circle cx="38" cy="42" r="11" fill="white" />
      <circle cx="62" cy="42" r="11" fill="white" />
      <circle cx="38" cy="42" r="7" fill="#c7d2fe" />
      <circle cx="62" cy="42" r="7" fill="#c7d2fe" />
      <circle cx="38" cy="42" r="3" fill="white" />
      <circle cx="62" cy="42" r="3" fill="white" />
      <ellipse cx="50" cy="62" rx="7" ry="8" fill="#4338ca" />
      <ellipse cx="50" cy="62" rx="5" ry="6" fill="#818cf8" />
    </>
  )
}

function Robot() {
  return (
    <>
      <rect x="16" y="70" width="68" height="46" rx="6" fill="#94a3b8" />
      <rect x="22" y="22" width="56" height="50" rx="6" fill="#94a3b8" />
      <line x1="50" y1="22" x2="50" y2="10" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="8" r="5" fill="#ef4444" />
      <rect x="28" y="38" width="18" height="9" rx="3" fill="#22d3ee" />
      <rect x="54" y="38" width="18" height="9" rx="3" fill="#22d3ee" />
      <rect x="30" y="40" width="7" height="5" rx="2" fill="white" opacity="0.5" />
      <rect x="56" y="40" width="7" height="5" rx="2" fill="white" opacity="0.5" />
      {[38, 44, 50, 56, 62].map((x) => (
        <circle key={x} cx={x} cy="60" r="2" fill="#475569" />
      ))}
      {[42, 50, 58].map((x) => (
        <circle key={x} cx={x} cy="66" r="2" fill="#475569" />
      ))}
      <line x1="50" y1="70" x2="50" y2="116" stroke="#64748b" strokeWidth="1.5" opacity="0.4" />
      <rect x="24" y="80" width="18" height="14" rx="3" fill="#64748b" opacity="0.4" />
      <rect x="58" y="80" width="18" height="14" rx="3" fill="#64748b" opacity="0.4" />
      <rect x="20" y="110" width="22" height="16" rx="4" fill="#64748b" />
      <rect x="58" y="110" width="22" height="16" rx="4" fill="#64748b" />
    </>
  )
}

function Royal() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="33" ry="34" fill="#fbbf24" />
      <circle cx="50" cy="46" r="27" fill="#fbbf24" />
      <polygon points="28,38 32,22 40,36" fill="#d97706" />
      <polygon points="50,22 47,7 53,7" fill="#d97706" />
      <polygon points="72,38 68,22 60,36" fill="#d97706" />
      <circle cx="32" cy="24" r="3.5" fill="#ef4444" />
      <circle cx="50" cy="8" r="3.5" fill="#3b82f6" />
      <circle cx="68" cy="24" r="3.5" fill="#10b981" />
      <ellipse cx="38" cy="47" rx="9" ry="8" fill="#fffbeb" />
      <ellipse cx="62" cy="47" rx="9" ry="8" fill="#fffbeb" />
      <ellipse cx="38" cy="47" rx="5" ry="5" fill="#92400e" />
      <ellipse cx="62" cy="47" rx="5" ry="5" fill="#92400e" />
      <path d="M 30 42 Q 38 37 46 42" stroke="#92400e" strokeWidth="1.5" fill="none" />
      <path d="M 54 42 Q 62 37 70 42" stroke="#92400e" strokeWidth="1.5" fill="none" />
      <path d="M 42 62 Q 50 69 58 62" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="116" rx="14" ry="7" fill="#d97706" />
      <ellipse cx="65" cy="116" rx="14" ry="7" fill="#d97706" />
    </>
  )
}

function renderMonster(id: string): React.JSX.Element {
  switch (id) {
    case "cyclops": return <Cyclops />
    case "spiky":   return <Spiky />
    case "sleepy":  return <Sleepy />
    case "blossom": return <Blossom />
    case "dragon":  return <Dragon />
    case "aqua":    return <Aqua />
    case "ghost":   return <Ghost />
    case "robot":   return <Robot />
    case "royal":   return <Royal />
    default:        return <Blob />
  }
}

// ── Accessories ───────────────────────────────────────────────────────────────

function PartyHat() {
  return (
    <>
      <polygon points="50,2 32,26 68,26" fill="#ef4444" />
      <polygon points="50,2 36,22 42,20" fill="white" opacity="0.4" />
      <polygon points="50,2 58,20 64,22" fill="white" opacity="0.2" />
      <ellipse cx="50" cy="26" rx="18" ry="4" fill="#dc2626" />
      <circle cx="50" cy="2" r="3.5" fill="#fbbf24" />
      <circle cx="40" cy="10" r="2" fill="#fbbf24" />
      <circle cx="60" cy="12" r="2" fill="#fbbf24" />
    </>
  )
}

function CowboyHat() {
  return (
    <>
      <ellipse cx="50" cy="26" rx="28" ry="5" fill="#92400e" />
      <path d="M 28 26 Q 30 8 50 8 Q 70 8 72 26" fill="#a16207" />
      <ellipse cx="50" cy="8" rx="22" ry="6" fill="#a16207" />
      <rect x="30" y="20" width="40" height="4" rx="2" fill="#d97706" opacity="0.6" />
    </>
  )
}

function TopHat() {
  return (
    <>
      <rect x="36" y="4" width="28" height="24" rx="2" fill="#111827" />
      <ellipse cx="50" cy="27" rx="22" ry="4" fill="#1f2937" />
      <rect x="38" y="20" width="24" height="3" rx="1.5" fill="#d97706" />
    </>
  )
}

function WizardHat() {
  return (
    <>
      <path d="M50,0 L30,28 L70,28 Z" fill="#7c3aed" />
      <ellipse cx="50" cy="28" rx="20" ry="4.5" fill="#6d28d9" />
      <circle cx="42" cy="16" r="2.5" fill="#fbbf24" />
      <circle cx="56" cy="9" r="2" fill="#fbbf24" />
      <circle cx="36" cy="22" r="1.5" fill="#fbbf24" />
      <circle cx="62" cy="20" r="1.5" fill="#fbbf24" />
    </>
  )
}

function Crown() {
  return (
    <>
      <path d="M 28 26 L 28 14 L 38 22 L 50 10 L 62 22 L 72 14 L 72 26 Z" fill="#fbbf24" />
      <rect x="28" y="24" width="44" height="6" rx="2" fill="#d97706" />
      <circle cx="50" cy="12" r="4" fill="#ef4444" />
      <circle cx="36" cy="22" r="3" fill="#3b82f6" />
      <circle cx="64" cy="22" r="3" fill="#10b981" />
    </>
  )
}

function StripedShirt() {
  return (
    <>
      <rect x="17" y="70" width="66" height="44" rx="8" fill="#e2e8f0" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="17" y={76 + i * 11} width="66" height="6" fill="#3b82f6" opacity="0.6" />
      ))}
    </>
  )
}

function Tuxedo() {
  return (
    <>
      <rect x="17" y="70" width="66" height="44" rx="8" fill="#1f2937" />
      <rect x="40" y="70" width="20" height="44" rx="3" fill="white" />
      <polygon points="36,70 50,84 64,70" fill="#1f2937" />
      <circle cx="50" cy="92" r="2.5" fill="#9ca3af" />
      <circle cx="50" cy="100" r="2.5" fill="#9ca3af" />
      <circle cx="50" cy="108" r="2.5" fill="#9ca3af" />
    </>
  )
}

function Cape() {
  return (
    <path
      d="M 28 76 Q 8 94 6 122 L 94 122 Q 92 94 72 76"
      fill="#dc2626"
      opacity="0.92"
    />
  )
}

function Sneakers() {
  return (
    <>
      <ellipse cx="35" cy="116" rx="15" ry="8" fill="#3b82f6" />
      <ellipse cx="35" cy="112" rx="13" ry="6" fill="#60a5fa" />
      <rect x="24" y="113" width="5" height="2" rx="1" fill="white" opacity="0.8" />
      <ellipse cx="65" cy="116" rx="15" ry="8" fill="#3b82f6" />
      <ellipse cx="65" cy="112" rx="13" ry="6" fill="#60a5fa" />
      <rect x="71" y="113" width="5" height="2" rx="1" fill="white" opacity="0.8" />
    </>
  )
}

function Boots() {
  return (
    <>
      <ellipse cx="35" cy="116" rx="15" ry="8" fill="#92400e" />
      <rect x="21" y="104" width="20" height="14" rx="4" fill="#92400e" />
      <rect x="21" y="104" width="20" height="5" rx="3" fill="#a16207" />
      <ellipse cx="65" cy="116" rx="15" ry="8" fill="#92400e" />
      <rect x="59" y="104" width="20" height="14" rx="4" fill="#92400e" />
      <rect x="59" y="104" width="20" height="5" rx="3" fill="#a16207" />
    </>
  )
}

function Heels() {
  return (
    <>
      <ellipse cx="33" cy="118" rx="13" ry="5.5" fill="#ec4899" />
      <rect x="21" y="110" width="5" height="10" rx="2.5" fill="#ec4899" />
      <rect x="21" y="110" width="14" height="7" rx="3" fill="#f9a8d4" />
      <ellipse cx="67" cy="118" rx="13" ry="5.5" fill="#ec4899" />
      <rect x="74" y="110" width="5" height="10" rx="2.5" fill="#ec4899" />
      <rect x="65" y="110" width="14" height="7" rx="3" fill="#f9a8d4" />
    </>
  )
}

function Spectacles() {
  return (
    <>
      <circle cx="38" cy="47" r="11" fill="none" stroke="#1f2937" strokeWidth="2.5" />
      <circle cx="62" cy="47" r="11" fill="none" stroke="#1f2937" strokeWidth="2.5" />
      <line x1="49" y1="47" x2="51" y2="47" stroke="#1f2937" strokeWidth="2.5" />
      <line x1="14" y1="43" x2="27" y2="47" stroke="#1f2937" strokeWidth="2.5" />
      <line x1="73" y1="47" x2="86" y2="43" stroke="#1f2937" strokeWidth="2.5" />
    </>
  )
}

function Monocle() {
  return (
    <>
      <circle cx="62" cy="47" r="12" fill="none" stroke="#d97706" strokeWidth="2.5" />
      <line x1="74" y1="56" x2="82" y2="65" stroke="#d97706" strokeWidth="2" />
      <circle cx="82" cy="67" r="2" fill="#d97706" />
    </>
  )
}

function BowTie() {
  return (
    <>
      <polygon points="37,68 50,74 37,80" fill="#ef4444" />
      <polygon points="63,68 50,74 63,80" fill="#ef4444" />
      <circle cx="50" cy="74" r="3.5" fill="#dc2626" />
    </>
  )
}

function GoldChain() {
  return (
    <>
      <path d="M 30 82 Q 50 76 70 82" stroke="#d97706" strokeWidth="3" fill="none" />
      <circle cx="50" cy="90" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
      <text x="50" y="94" textAnchor="middle" fontSize="6" fill="#92400e" fontWeight="bold">$</text>
    </>
  )
}

function renderAccessory(id: string): React.JSX.Element | null {
  switch (id) {
    case "party-hat":  return <PartyHat />
    case "cowboy-hat": return <CowboyHat />
    case "top-hat":    return <TopHat />
    case "wizard-hat": return <WizardHat />
    case "crown":      return <Crown />
    case "stripes":    return <StripedShirt />
    case "tuxedo":     return <Tuxedo />
    case "cape":       return <Cape />
    case "sneakers":   return <Sneakers />
    case "boots":      return <Boots />
    case "heels":      return <Heels />
    case "spectacles": return <Spectacles />
    case "monocle":    return <Monocle />
    case "bow-tie":    return <BowTie />
    case "gold-chain": return <GoldChain />
    default:           return null
  }
}

// ── Public component ──────────────────────────────────────────────────────────

export function MonsterAvatar({ character = "blob", equipped = [], size = 100, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={Math.round(size * 1.3)}
      style={{ display: "block" }}
      className={className}
    >
      {renderMonster(character)}
      {equipped.map((id) => {
        const el = renderAccessory(id)
        return el ? <g key={id}>{el}</g> : null
      })}
    </svg>
  )
}
