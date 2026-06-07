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
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">
          WhiffenBeli
        </Link>
        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="hidden sm:block">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
              {user.name[0].toUpperCase()}
            </div>
          </Link>
        )}
      </div>
    </header>
  )
}
