import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateRecommendations } from '@/lib/recommendation-engine'
import { updateClientStatus } from '@/lib/client-status'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Generate session number
    const clientSessions = await prisma.session.findMany({
      where: { clientId: body.clientId },
      orderBy: { date: 'desc' }
    })
    
    const sessionNumber = body.sessionNumber || `S${(clientSessions.length + 1).toString().padStart(3, '0')}`

    // Create session with only valid fields
    const sessionData = await prisma.session.create({
      data: {
        sessionNumber,
        clientId: body.clientId,
        doctorId: body.doctorId,
        category: body.category,
        date: body.date ? new Date(body.date) : new Date(),
        beforeCondition: body.beforeCondition || null,
        acneSeverity: body.acneSeverity || null,
        scarType: body.scarType || null,
        pigmentationLevel: body.pigmentationLevel || null,
        glowDullnessScale: body.glowDullnessScale || null,
        hairDensity: body.hairDensity || null,
        textureRoughness: body.textureRoughness || null,
        poreVisibility: body.poreVisibility || null,
        hasInflammation: body.hasInflammation || false,
        beforePhotos: body.beforePhotos || [],
        treatmentsPerformed: body.treatmentsPerformed || [],
        productsUsed: body.productsUsed || [],
        afterNotes: body.afterNotes || null,
        immediateOutcome: body.immediateOutcome || null,
        sideEffects: body.sideEffects || null,
        afterPhotos: body.afterPhotos || [],
        nextSessionDate: body.nextSessionDate ? new Date(body.nextSessionDate) : null,
        expectedResultTime: body.expectedResultTime || null,
        postCareInstructions: body.postCareInstructions || null,
        doctorSuggestions: body.doctorSuggestions || null,
        prescribedMedicines: body.prescribedMedicines || null,
        treatmentCompleted: body.treatmentCompleted || false,
        paymentAmount: body.paymentAmount ? parseFloat(body.paymentAmount) : null,
        paymentMethod: body.paymentMethod || null,
        paymentStatus: body.paymentStatus || 'PENDING',
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        paymentNotes: body.paymentNotes || null,
      }
    })

    // Update client status based on new session
    await updateClientStatus(body.clientId)

    // Generate smart recommendations
    const recommendations = generateRecommendations({
      acneSeverity: body.acneSeverity,
      pigmentationLevel: body.pigmentationLevel,
      glowDullnessScale: body.glowDullnessScale,
      hairDensity: body.hairDensity,
      scarType: body.scarType
    })

    // Save recommendations
    if (recommendations.length > 0) {
      await prisma.recommendation.createMany({
        data: recommendations.map(rec => ({
          sessionId: sessionData.id,
          ...rec
        }))
      })
    }

    // Return session with recommendations
    const sessionWithRecommendations = await prisma.session.findUnique({
      where: { id: sessionData.id },
      include: {
        recommendations: true,
        client: true,
        doctor: true
      }
    })

    return NextResponse.json(sessionWithRecommendations)
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  const sessions = await prisma.session.findMany({
    where: clientId ? { clientId } : undefined,
    include: {
      client: true,
      doctor: true,
      recommendations: true
    },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(sessions)
}
