import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const COSTS: Record<string, number> = {
  "sneak-peek": 15,
  "wildest-take": 25,
  "deep-dive": 40,
  "consensus": 60,
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function sneakPeek(userId: string, params: Record<string, string>) {
  const { targetId, eventId } = params
  if (!targetId || !eventId) throw new Error("Select a Whiff and an event")
  if (targetId === userId) throw new Error("Pick someone else!")

  const [target, event] = await Promise.all([
    prisma.user.findUnique({ where: { id: targetId } }),
    prisma.event.findUnique({ where: { id: eventId } }),
  ])
  if (!target) throw new Error("Whiff not found")
  if (!event) throw new Error("Event not found")

  const ranked: string[] = JSON.parse(target.rankedEvents)
  const pos = ranked.indexOf(eventId)
  if (pos === -1) throw new Error(`${target.name} hasn't ranked "${event.name}" yet`)

  return { type: "sneak-peek", targetName: target.name, eventName: event.name, rank: pos + 1, total: ranked.length }
}

async function wildestTake(userId: string) {
  const [me, allUsers, allEvents] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findMany(),
    prisma.event.findMany(),
  ])
  const myRanked: string[] = JSON.parse(me!.rankedEvents)
  if (myRanked.length < 5) throw new Error("Rank at least 5 events first")

  let maxDev = -1
  let best: { eventName: string; myRank: number; groupRank: number; deviation: number } | null = null

  for (let i = 0; i < myRanked.length; i++) {
    const eventId = myRanked[i]
    const myRank = i + 1
    const others: number[] = []
    for (const u of allUsers) {
      if (u.id === userId) continue
      const r: string[] = JSON.parse(u.rankedEvents)
      const p = r.indexOf(eventId)
      if (p !== -1) others.push(p + 1)
    }
    if (others.length < 1) continue
    const avg = others.reduce((a, b) => a + b, 0) / others.length
    const dev = Math.abs(myRank - avg)
    if (dev > maxDev) {
      maxDev = dev
      best = {
        eventName: allEvents.find((e) => e.id === eventId)?.name ?? eventId,
        myRank,
        groupRank: Math.round(avg),
        deviation: Math.round(dev),
      }
    }
  }

  if (!best) throw new Error("Not enough group data yet")
  return { type: "wildest-take", ...best }
}

async function deepDive(userId: string, params: Record<string, string>) {
  const { targetId } = params
  if (!targetId || targetId === userId) throw new Error("Pick a different Whiff")

  const [me, target, allEvents] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: targetId } }),
    prisma.event.findMany(),
  ])
  if (!target) throw new Error("Whiff not found")

  const myRanked: string[] = JSON.parse(me!.rankedEvents)
  const theirRanked: string[] = JSON.parse(target.rankedEvents)
  const mySet = new Set(myRanked)
  const shared = theirRanked.filter((id) => mySet.has(id))
  if (shared.length < 5) throw new Error(`You and ${target.name} haven't ranked enough events in common yet (need 5, have ${shared.length})`)

  const n = shared.length
  let sumD2 = 0
  const diffs = shared.map((eventId) => {
    const myRank = myRanked.indexOf(eventId) + 1
    const theirRank = theirRanked.indexOf(eventId) + 1
    const d = myRank - theirRank
    sumD2 += d * d
    return { eventId, myRank, theirRank, diff: Math.abs(d) }
  })

  const r = 1 - (6 * sumD2) / (n * (n * n - 1))
  const similarity = Math.max(0, Math.min(100, Math.round(((r + 1) / 2) * 100)))

  const sorted = [...diffs].sort((a, b) => a.diff - b.diff)
  const getName = (id: string) => allEvents.find((e) => e.id === id)?.name ?? id

  return {
    type: "deep-dive",
    targetName: target.name,
    similarity,
    sharedCount: n,
    agreements: sorted.slice(0, 3).map((d) => ({ name: getName(d.eventId), myRank: d.myRank, theirRank: d.theirRank })),
    disagreements: sorted.slice(-3).reverse().map((d) => ({ name: getName(d.eventId), myRank: d.myRank, theirRank: d.theirRank })),
  }
}

async function consensus() {
  const [allUsers, allEvents] = await Promise.all([
    prisma.user.findMany(),
    prisma.event.findMany(),
  ])

  const rankMap = new Map<string, number[]>()
  for (const u of allUsers) {
    const ranked: string[] = JSON.parse(u.rankedEvents)
    ranked.forEach((id, i) => {
      if (!rankMap.has(id)) rankMap.set(id, [])
      rankMap.get(id)!.push(i + 1)
    })
  }

  const stats = allEvents
    .map((event) => {
      const ranks = rankMap.get(event.id) ?? []
      if (ranks.length < 3) return null
      const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length
      const variance = ranks.reduce((s, r) => s + (r - mean) ** 2, 0) / ranks.length
      return { name: event.name, stdDev: Math.sqrt(variance), avgRank: Math.round(mean), rankedBy: ranks.length }
    })
    .filter(Boolean)
    .sort((a, b) => a!.stdDev - b!.stdDev)
    .slice(0, 5)

  if (stats.length < 3) throw new Error("Not enough data yet — have your Whiffs rank more events!")

  return {
    type: "consensus",
    events: stats.map((s) => ({ name: s!.name, avgRank: s!.avgRank, rankedBy: s!.rankedBy })),
  }
}

// ── route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { userId, item, params = {} } = await req.json() as {
    userId: string
    item: string
    params?: Record<string, string>
  }

  const cost = COSTS[item]
  if (!cost) return NextResponse.json({ error: "Unknown item" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (user.coins < cost) return NextResponse.json({ error: "Not enough coins" }, { status: 400 })

  let result
  try {
    if (item === "sneak-peek") result = await sneakPeek(userId, params)
    else if (item === "wildest-take") result = await wildestTake(userId)
    else if (item === "deep-dive") result = await deepDive(userId, params)
    else if (item === "consensus") result = await consensus()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { coins: { decrement: cost } },
  })

  return NextResponse.json({ newCoins: updated.coins, result })
}
