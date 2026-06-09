import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(users)
}

function serializeUser(user: {
  id: string
  name: string
  coins: number
  character: string
  equipped: string
  purchased: string
  rankedEvents: string
}) {
  const rankedCount = (() => {
    try { return (JSON.parse(user.rankedEvents) as unknown[]).length } catch { return 0 }
  })()
  const equippedArr = (() => {
    try { return JSON.parse(user.equipped) as string[] } catch { return [] }
  })()
  const purchasedArr = (() => {
    try { return JSON.parse(user.purchased) as string[] } catch { return [] }
  })()
  return {
    id: user.id,
    name: user.name,
    coins: user.coins,
    character: user.character || "blob",
    equipped: equippedArr,
    purchased: purchasedArr,
    rankedCount,
  }
}

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return NextResponse.json({ ...serializeUser(existing), isNew: false })
  }

  const user = await prisma.user.create({ data: { name: name.trim(), coins: 20 } })
  return NextResponse.json({ ...serializeUser(user), isNew: true })
}
