"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type User = { id: string; name: string }

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : null)
  }, [pathname])

  return (
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
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <span className="hidden sm:block">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-sm font-bold">
              {user.name[0].toUpperCase()}
            </div>
          </Link>
        )}
      </div>
    </header>
  )
}
