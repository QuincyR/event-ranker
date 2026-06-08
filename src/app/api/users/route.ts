import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return NextResponse.json({ id: existing.id, name: existing.name, coins: existing.coins, isNew: false })
  }

  const user = await prisma.user.create({ data: { name: name.trim(), coins: 20 } })
  return NextResponse.json({ id: user.id, name: user.name, coins: user.coins, isNew: true })
}
