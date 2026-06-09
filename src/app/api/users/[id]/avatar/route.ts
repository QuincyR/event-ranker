import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getItem, CHARACTERS } from "@/lib/items"

function parseArr(s: string): string[] {
  try { return JSON.parse(s) as string[] } catch { return [] }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action, itemId } = await req.json() as { action: string; itemId: string }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const equipped = parseArr(user.equipped)
  const purchased = parseArr(user.purchased)
  const item = getItem(itemId)
  if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 400 })

  if (action === "set-character") {
    const isFree = item.cost === 0
    const isOwned = purchased.includes(itemId)
    if (!isFree && !isOwned) return NextResponse.json({ error: "Not owned" }, { status: 403 })
    const updated = await prisma.user.update({ where: { id }, data: { character: itemId } })
    return respond(updated, equipped, purchased)
  }

  if (action === "purchase") {
    if (purchased.includes(itemId)) return NextResponse.json({ error: "Already owned" }, { status: 400 })
    if (user.coins < item.cost) return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })

    let newEquipped = [...equipped]
    let newCharacter = user.character

    if (item.category === "character") {
      newCharacter = itemId
    } else {
      // Remove same-category accessory unless misc
      if (item.category !== "misc") {
        newEquipped = newEquipped.filter((eid) => {
          const e = getItem(eid)
          return !e || e.category !== item.category
        })
      }
      newEquipped.push(itemId)
    }

    const newPurchased = [...purchased, itemId]
    const updated = await prisma.user.update({
      where: { id },
      data: {
        coins: user.coins - item.cost,
        character: newCharacter,
        equipped: JSON.stringify(newEquipped),
        purchased: JSON.stringify(newPurchased),
      },
    })
    return respond(updated, newEquipped, newPurchased)
  }

  if (action === "toggle-equip") {
    const isFree = item.category === "character"
      ? CHARACTERS.find((c) => c.id === itemId)?.cost === 0
      : false
    const isOwned = isFree || purchased.includes(itemId)
    if (!isOwned) return NextResponse.json({ error: "Not owned" }, { status: 403 })

    let newEquipped = [...equipped]
    if (newEquipped.includes(itemId)) {
      newEquipped = newEquipped.filter((eid) => eid !== itemId)
    } else {
      if (item.category !== "misc") {
        newEquipped = newEquipped.filter((eid) => {
          const e = getItem(eid)
          return !e || e.category !== item.category
        })
      }
      newEquipped.push(itemId)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { equipped: JSON.stringify(newEquipped) },
    })
    return respond(updated, newEquipped, purchased)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

function respond(
  user: { id: string; name: string; coins: number; character: string; rankedEvents: string },
  equipped: string[],
  purchased: string[]
) {
  const rankedCount = (() => {
    try { return (JSON.parse(user.rankedEvents) as unknown[]).length } catch { return 0 }
  })()
  return NextResponse.json({
    character: user.character,
    equipped,
    purchased,
    coins: user.coins,
    rankedCount,
  })
}
