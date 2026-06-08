import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ranked: string[] = JSON.parse(user.rankedEvents)
  const skipped: string[] = JSON.parse(user.skippedEvents)
  const allEvents = await prisma.event.findMany({ orderBy: { createdAt: "asc" } })

  const rankedEvents = ranked
    .map((eid) => allEvents.find((e) => e.id === eid))
    .filter(Boolean)

  const skippedEvents = skipped
    .map((eid) => allEvents.find((e) => e.id === eid))
    .filter(Boolean)

  const excluded = new Set([...ranked, ...skipped])
  const unranked = allEvents.filter((e) => !excluded.has(e.id))

  return NextResponse.json({ ranked: rankedEvents, unranked, skipped: skippedEvents })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { rankedEvents, skippedEvents, earnedCoins = 0 } = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (rankedEvents !== undefined) updateData.rankedEvents = JSON.stringify(rankedEvents)
  if (skippedEvents !== undefined) updateData.skippedEvents = JSON.stringify(skippedEvents)
  if (earnedCoins > 0) updateData.coins = { increment: earnedCoins }
  const user = await prisma.user.update({ where: { id }, data: updateData })
  return NextResponse.json({ newCoins: user.coins })
}
