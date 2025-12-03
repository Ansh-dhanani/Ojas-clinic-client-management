import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all sessions where:
    // 1. Session date is in the past (treatment done)
    // 2. Payment status is PENDING, PARTIAL, or OVERDUE
    // 3. Payment amount exists
    const now = new Date()
    
    const sessionsWithPendingPayments = await prisma.session.findMany({
      where: {
        date: { lt: now }, // Past sessions only
        paymentAmount: { not: null },
        OR: [
          { paymentStatus: 'PENDING' },
          { paymentStatus: 'PARTIAL' },
          { paymentStatus: 'OVERDUE' }
        ]
      },
      include: {
        client: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Group by client
    const clientsMap = new Map()
    
    sessionsWithPendingPayments.forEach(session => {
      const clientId = session.client.id
      
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: session.client.id,
          clientId: session.client.clientId,
          fullName: session.client.fullName,
          phone: session.client.phone,
          totalPending: 0,
          sessionsCount: 0,
          sessions: []
        })
      }
      
      const clientData = clientsMap.get(clientId)
      clientData.totalPending += session.paymentAmount || 0
      clientData.sessionsCount += 1
      clientData.sessions.push({
        id: session.id,
        sessionNumber: session.sessionNumber,
        date: session.date,
        category: session.category,
        paymentAmount: session.paymentAmount,
        paymentStatus: session.paymentStatus
      })
    })

    // Convert map to array and sort by total pending amount (highest first)
    const pendingPayments = Array.from(clientsMap.values()).sort((a, b) => b.totalPending - a.totalPending)

    return NextResponse.json({ 
      pendingPayments,
      totalClients: pendingPayments.length,
      totalAmount: pendingPayments.reduce((sum, client) => sum + client.totalPending, 0)
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
