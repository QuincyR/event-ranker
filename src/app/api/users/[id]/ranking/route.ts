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
  const allEvents = await prisma.event.findMany({ orderBy: { createdAt: "asc" } })

  const rankedEvents = ranked
    .map((eid) => allEvents.find((e) => e.id === eid))
    .filter(Boolean)

  const unranked = allEvents.filter((e) => !ranked.includes(e.id))

  return NextResponse.json({ ranked: rankedEvents, unranked })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { rankedEvents } = await req.json()
  const user = await prisma.user.update({
    where: { id },
    data: { rankedEvents: JSON.stringify(rankedEvents) },
  })
  return NextResponse.json(user)
}
