
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const packages = await prisma.package.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { clientPackages: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(packages)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  const packageData = await prisma.package.create({
    data: body
  })

  return NextResponse.json(packageData)
}
