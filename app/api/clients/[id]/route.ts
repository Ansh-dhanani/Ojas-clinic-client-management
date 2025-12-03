import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePaymentStatus } from '@/lib/payment-status'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const sessions = await prisma.session.findMany({
      where: { clientId: params.id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sessionPayments: true,
      },
      orderBy: { date: 'desc' },
    })

    // Calculate payment status for each session
    const sessionsWithStatus = await Promise.all(
      sessions.map(async (session) => ({
        ...session,
        paymentStatus: await calculatePaymentStatus(session.id, session)
      }))
    )

    return NextResponse.json({ client, sessions: sessionsWithStatus })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Prepare data object, excluding undefined/empty values
    const updateData: any = {
      fullName: body.fullName,
      gender: body.gender,
      phone: body.phone,
      status: body.status,
    }

    // Only include optional fields if they have values
    if (body.dateOfBirth && body.dateOfBirth !== '') {
      updateData.dateOfBirth = new Date(body.dateOfBirth)
    }
    if (body.whatsapp !== undefined && body.whatsapp !== null) {
      updateData.whatsapp = body.whatsapp || null
    }
    if (body.email !== undefined && body.email !== null) {
      updateData.email = body.email || null
    }
    if (body.address !== undefined && body.address !== null) {
      updateData.address = body.address || null
    }
    if (body.skinType !== undefined && body.skinType !== null) {
      updateData.skinType = body.skinType || null
    }
    if (body.skinConcerns !== undefined && body.skinConcerns !== null) {
      updateData.skinConcerns = body.skinConcerns || null
    }
    if (body.totalSessionsNeeded !== undefined) {
      updateData.totalSessionsNeeded = body.totalSessionsNeeded ? parseInt(body.totalSessionsNeeded) : null
    }
    
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ 
      error: 'Failed to update client', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
