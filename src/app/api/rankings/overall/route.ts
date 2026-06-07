import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const [users, events] = await Promise.all([
    prisma.user.findMany(),
    prisma.event.findMany({ orderBy: { createdAt: "asc" } }),
  ])

  const scores: Record<string, { total: number; count: number }> = {}
  for (const e of events) scores[e.id] = { total: 0, count: 0 }

  for (const user of users) {
    let ranked: string[] = []
    try { ranked = JSON.parse(user.rankedEvents) } catch {}
    ranked.forEach((id, i) => {
      if (scores[id]) {
        scores[id].total += i + 1
        scores[id].count += 1
      }
    })
  }

  const withScores = events.map((event) => {
    const { total, count } = scores[event.id]
    return {
      event,
      totalScore: count > 0 ? total : null,
      averageScore: count > 0 ? total / count : null,
      rankedByCount: count,
    }
  })

  // Ranked events first (sorted by average score ascending = best first), then unranked
  const ranked = withScores
    .filter((x) => x.rankedByCount > 0)
    .sort((a, b) => (a.averageScore ?? 0) - (b.averageScore ?? 0))
    .map((x, i) => ({ ...x, rank: i + 1 }))

  const unranked = withScores
    .filter((x) => x.rankedByCount === 0)
    .map((x) => ({ ...x, rank: null }))

  return NextResponse.json([...ranked, ...unranked])
}
