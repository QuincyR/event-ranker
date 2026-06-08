import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { amount } = await req.json()
  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  const user = await prisma.user.update({
    where: { id },
    data: { coins: { increment: amount } },
  })
  return NextResponse.json({ newCoins: user.coins })
}
