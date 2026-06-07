import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 })
  }
  const user = await prisma.user.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  })
  return NextResponse.json(user)
}
