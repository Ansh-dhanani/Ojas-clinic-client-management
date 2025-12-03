import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all payments for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payments = await prisma.sessionPayment.findMany({
      where: { sessionId: params.id },
      orderBy: { paymentDate: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching session payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add a new payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const payment = await prisma.sessionPayment.create({
      data: {
        sessionId: params.id,
        amount: parseFloat(body.amount),
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        notes: body.notes || null
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating session payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
