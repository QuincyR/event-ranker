import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { date } = await req.json()
  const event = await prisma.event.update({
    where: { id },
    data: { date: date ? new Date(date + "T12:00:00Z") : null },
  })
  return NextResponse.json(event)
}
