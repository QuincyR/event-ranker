import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await prisma.user.findUnique({ where: { id } })
  if (!currentUser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const myRanked: string[] = JSON.parse(currentUser.rankedEvents)
  if (myRanked.length < 2) return NextResponse.json([])

  const allUsers = await prisma.user.findMany()
  const allEvents = await prisma.event.findMany()
  const eventMap = Object.fromEntries(allEvents.map((e) => [e.id, e]))

  const results = []

  for (const user of allUsers) {
    if (user.id === id) continue

    const theirRanked: string[] = JSON.parse(user.rankedEvents)
    if (theirRanked.length < 2) continue

    // Shared events: my order filtered to what they've also ranked
    const theirSet = new Set(theirRanked)
    const myShared = myRanked.filter((eid) => theirSet.has(eid) && eventMap[eid])
    if (myShared.length < 2) continue

    const mySharedSet = new Set(myShared)
    const theirShared = theirRanked.filter((eid) => mySharedSet.has(eid))

    // 1-based relative ranks within the shared set
    const myRanks: Record<string, number> = {}
    const theirRanks: Record<string, number> = {}
    myShared.forEach((eid, i) => { myRanks[eid] = i + 1 })
    theirShared.forEach((eid, i) => { theirRanks[eid] = i + 1 })

    // Spearman rank correlation → similarity 0–100%
    const n = myShared.length
    let sumD2 = 0
    for (const eid of myShared) {
      const d = myRanks[eid] - theirRanks[eid]
      sumD2 += d * d
    }
    const r = 1 - (6 * sumD2) / (n * (n * n - 1))
    const similarity = Math.max(0, Math.min(100, Math.round(((r + 1) / 2) * 100)))

    const rankings = myShared.map((eid) => ({
      event: eventMap[eid],
      myRank: myRanks[eid],
      theirRank: theirRanks[eid],
      diff: Math.abs(myRanks[eid] - theirRanks[eid]),
    }))

    results.push({ userId: user.id, name: user.name, similarity, sharedCount: n, rankings })
  }

  results.sort((a, b) => b.similarity - a.similarity)
  return NextResponse.json(results)
}
