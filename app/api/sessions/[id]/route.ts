import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePaymentStatus } from '@/lib/payment-status'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            clientId: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sessionPayments: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate payment status dynamically
    const calculatedPaymentStatus = await calculatePaymentStatus(params.id, session)

    return NextResponse.json({
      ...session,
      paymentStatus: calculatedPaymentStatus
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Prepare update data
    const updateData: any = {}

    // Basic fields
    if (body.category !== undefined) updateData.category = body.category
    if (body.beforeCondition !== undefined) updateData.beforeCondition = body.beforeCondition || null
    if (body.acneSeverity !== undefined) updateData.acneSeverity = body.acneSeverity || null
    if (body.scarType !== undefined) updateData.scarType = body.scarType || null
    if (body.pigmentationLevel !== undefined) updateData.pigmentationLevel = body.pigmentationLevel || null
    if (body.glowDullnessScale !== undefined) updateData.glowDullnessScale = body.glowDullnessScale
    if (body.hairDensity !== undefined) updateData.hairDensity = body.hairDensity || null
    if (body.textureRoughness !== undefined) updateData.textureRoughness = body.textureRoughness
    if (body.poreVisibility !== undefined) updateData.poreVisibility = body.poreVisibility
    if (body.hasInflammation !== undefined) updateData.hasInflammation = body.hasInflammation

    // Arrays
    if (body.beforePhotos !== undefined) updateData.beforePhotos = body.beforePhotos
    if (body.treatmentsPerformed !== undefined) updateData.treatmentsPerformed = body.treatmentsPerformed
    if (body.productsUsed !== undefined) updateData.productsUsed = body.productsUsed
    if (body.afterPhotos !== undefined) updateData.afterPhotos = body.afterPhotos

    // After treatment fields
    if (body.afterNotes !== undefined) updateData.afterNotes = body.afterNotes || null
    if (body.immediateOutcome !== undefined) updateData.immediateOutcome = body.immediateOutcome || null
    if (body.sideEffects !== undefined) updateData.sideEffects = body.sideEffects || null

    // Follow-up fields
    if (body.nextSessionDate !== undefined) {
      updateData.nextSessionDate = body.nextSessionDate ? new Date(body.nextSessionDate) : null
    }
    if (body.expectedResultTime !== undefined) updateData.expectedResultTime = body.expectedResultTime || null
    if (body.postCareInstructions !== undefined) updateData.postCareInstructions = body.postCareInstructions || null
    if (body.doctorSuggestions !== undefined) updateData.doctorSuggestions = body.doctorSuggestions || null
    if (body.prescribedMedicines !== undefined) updateData.prescribedMedicines = body.prescribedMedicines || null
    if (body.treatmentCompleted !== undefined) updateData.treatmentCompleted = body.treatmentCompleted

    // Payment fields
    if (body.paymentAmount !== undefined) {
      updateData.paymentAmount = body.paymentAmount ? parseFloat(body.paymentAmount) : null
    }
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod || null
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus || 'PENDING'
    if (body.paymentDate !== undefined) {
      updateData.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null
    }
    if (body.paymentNotes !== undefined) updateData.paymentNotes = body.paymentNotes || null

    const session = await prisma.session.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            clientId: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
