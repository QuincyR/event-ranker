"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

type User = { id: string; name: string }

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : null)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-[#00356B] border-b border-[#002654]">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={user ? "/home" : "/"} className="font-bold text-white text-lg tracking-tight">
          WhiffenBeli
        </Link>
        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <span className="hidden sm:block">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-white text-[#00356B] flex items-center justify-center text-sm font-bold">
              {user.name[0].toUpperCase()}
            </div>
          </Link>
        )}
      </div>
    </header>
  )
}
