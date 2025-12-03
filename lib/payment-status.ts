import { prisma } from './prisma'

export async function calculatePaymentStatus(sessionId: string, session?: any) {
  // If session not provided, fetch it
  if (!session) {
    session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sessionPayments: true
      }
    })
  }

  if (!session) return 'PENDING'

  const now = new Date()
  const sessionDate = new Date(session.date)
  const isPast = sessionDate < now

  // For future sessions
  if (!isPast) {
    return 'UPCOMING'
  }

  // No payment amount set
  if (!session.paymentAmount || session.paymentAmount === 0) {
    return 'PENDING'
  }

  // Calculate total paid from SessionPayment records
  const payments = await prisma.sessionPayment.findMany({
    where: { sessionId }
  })

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = session.paymentAmount - totalPaid

  // Determine status based on total paid
  if (remaining <= 0) {
    return 'PAID'
  }

  if (totalPaid > 0) {
    return 'PARTIAL'
  }

  // Check if overdue (more than 7 days past session date)
  const daysSinceSession = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceSession > 7) {
    return 'OVERDUE'
  }

  return 'PENDING'
}

export async function getSessionWithCalculatedStatus(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      sessionPayments: true,
      client: true,
      doctor: true
    }
  })

  if (!session) return null

  const calculatedStatus = await calculatePaymentStatus(sessionId, session)
  
  return {
    ...session,
    paymentStatus: calculatedStatus
  }
}
