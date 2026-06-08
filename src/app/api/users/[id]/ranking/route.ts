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
  const { rankedEvents, skippedEvents } = await req.json()
  const updateData: Record<string, string> = {}
  if (rankedEvents !== undefined) updateData.rankedEvents = JSON.stringify(rankedEvents)
  if (skippedEvents !== undefined) updateData.skippedEvents = JSON.stringify(skippedEvents)
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })
  return NextResponse.json(user)
}
