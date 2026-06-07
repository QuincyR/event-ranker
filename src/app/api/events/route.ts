import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }
  const event = await prisma.event.create({
    data: { name: name.trim() },
  })
  return NextResponse.json(event, { status: 201 })
}
