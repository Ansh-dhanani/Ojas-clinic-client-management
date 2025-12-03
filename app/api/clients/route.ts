import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePaymentStatus } from '@/lib/payment-status'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    include: {
      sessions: {
        orderBy: { date: 'desc' },
        include: {
          sessionPayments: true
        }
      },
      clientPackages: {
        include: {
          package: true
        }
      },
      _count: {
        select: {
          sessions: true,
          payments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate payment status for all sessions
  const clientsWithCalculatedStatus = await Promise.all(
    clients.map(async (client) => ({
      ...client,
      sessions: await Promise.all(
        client.sessions.map(async (session) => ({
          ...session,
          paymentStatus: await calculatePaymentStatus(session.id, session)
        }))
      )
    }))
  )

  return NextResponse.json(clientsWithCalculatedStatus)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Generate unique client ID - find the highest existing number
    const clients = await prisma.client.findMany({
      select: { clientId: true },
      orderBy: { clientId: 'desc' }
    })
    
    let clientNumber = 1
    if (clients.length > 0) {
      // Extract numbers from all client IDs and find the maximum
      const numbers = clients
        .map(c => parseInt(c.clientId.replace('CL', '')))
        .filter(n => !isNaN(n))
      
      if (numbers.length > 0) {
        clientNumber = Math.max(...numbers) + 1
      }
    }
    
    const clientId = `CL${clientNumber.toString().padStart(4, '0')}`

    // Set default values for required fields
    const client = await prisma.client.create({
      data: {
        clientId,
        fullName: body.fullName,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        gender: body.gender || 'MALE',
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : new Date('2000-01-01'),
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    await prisma.client.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
