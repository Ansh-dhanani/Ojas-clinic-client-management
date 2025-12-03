import { prisma } from './prisma'

type ClientStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'INACTIVE' | 'GHOSTED' | 'CANCELLED'

interface StatusUpdateResult {
  newStatus: ClientStatus
  reason: string
}

/**
 * Automatically determines and updates client status based on their activity
 */
export async function updateClientStatus(clientId: string): Promise<StatusUpdateResult> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
      },
      appointments: {
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: { date: 'asc' },
        take: 1,
      },
    },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  // If manually set to CANCELLED, don't auto-update
  if (client.status === 'CANCELLED') {
    return { newStatus: 'CANCELLED', reason: 'Manually cancelled' }
  }

  const now = new Date()
  const totalSessions = client.sessions.length
  const lastSession = client.sessions[0] // Most recent session
  const nextAppointment = client.appointments[0]

  let newStatus: ClientStatus
  let reason: string
  let updateData: any = {}

  // Rule 1: PENDING - New client with no sessions
  if (totalSessions === 0) {
    newStatus = 'PENDING'
    reason = 'New client, awaiting first session'
  }
  // Rule 2: GHOSTED - Has sessions but last visit was >60 days ago and no upcoming appointment
  else if (lastSession) {
    const daysSinceLastVisit = Math.floor(
      (now.getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceLastVisit > 60 && !nextAppointment && client.missedAppointments >= 2) {
      newStatus = 'GHOSTED'
      reason = `No contact for ${daysSinceLastVisit} days, ${client.missedAppointments} missed appointments`
    }
    // Rule 3: COMPLETED - Treatment marked as completed in last session
    else if (lastSession.treatmentCompleted) {
      newStatus = 'COMPLETED'
      reason = 'Treatment course completed successfully'
    }
    // Rule 4: ACTIVE - Has upcoming appointment or recent activity
    else if (nextAppointment || daysSinceLastVisit <= 45) {
      newStatus = 'ACTIVE'
      reason = nextAppointment 
        ? `Next appointment scheduled for ${new Date(nextAppointment.date).toLocaleDateString()}`
        : 'Recent session activity'
      
      if (nextAppointment) {
        updateData.nextAppointmentDate = nextAppointment.date
      }
    }
    // Rule 5: INACTIVE - No recent activity but not ghosted yet
    else if (daysSinceLastVisit > 45 && daysSinceLastVisit <= 60) {
      newStatus = 'INACTIVE'
      reason = `No activity for ${daysSinceLastVisit} days`
    }
    // Default to ACTIVE if has sessions
    else {
      newStatus = 'ACTIVE'
      reason = 'Has treatment history'
    }

    updateData.lastVisitDate = lastSession.date
    updateData.totalSessionsCompleted = totalSessions
  }
  // Fallback
  else {
    newStatus = 'PENDING'
    reason = 'Status unclear, defaulting to pending'
  }

  // Update client status if changed
  if (client.status !== newStatus) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        status: newStatus,
        ...updateData,
      },
    })
  } else if (Object.keys(updateData).length > 0) {
    // Update metadata even if status hasn't changed
    await prisma.client.update({
      where: { id: clientId },
      data: updateData,
    })
  }

  return { newStatus, reason }
}

/**
 * Mark client as ghosted after missed appointment
 */
export async function markMissedAppointment(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) return

  const missedCount = client.missedAppointments + 1

  await prisma.client.update({
    where: { id: clientId },
    data: {
      missedAppointments: missedCount,
      status: missedCount >= 3 ? 'GHOSTED' : client.status,
    },
  })

  return missedCount
}

/**
 * Get status badge color and label
 */
export function getStatusBadge(status: ClientStatus): { color: string; label: string; icon: string } {
  switch (status) {
    case 'PENDING':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: '⏳' }
    case 'ACTIVE':
      return { color: 'bg-green-100 text-green-800', label: 'Active', icon: '✓' }
    case 'COMPLETED':
      return { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: '🎉' }
    case 'INACTIVE':
      return { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: '⏸' }
    case 'GHOSTED':
      return { color: 'bg-red-100 text-red-800', label: 'Ghosted', icon: '👻' }
    case 'CANCELLED':
      return { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: '✕' }
    default:
      return { color: 'bg-gray-100 text-gray-800', label: status, icon: '?' }
  }
}

/**
 * Get next action recommendation for client
 */
export function getNextActionRecommendation(client: any): string {
  const now = new Date()
  
  if (client.status === 'PENDING') {
    return 'Schedule first consultation'
  }
  
  if (client.status === 'GHOSTED') {
    return 'Attempt to reconnect via phone/WhatsApp'
  }
  
  if (client.status === 'COMPLETED') {
    return 'Follow-up after 3 months for maintenance'
  }
  
  if (client.nextAppointmentDate) {
    const daysUntil = Math.floor(
      (new Date(client.nextAppointmentDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysUntil < 0) {
      return 'Appointment overdue - contact client'
    } else if (daysUntil <= 2) {
      return `Appointment in ${daysUntil} days - send reminder`
    } else {
      return `Next appointment in ${daysUntil} days`
    }
  }
  
  if (client.lastVisitDate) {
    const daysSince = Math.floor(
      (now.getTime() - new Date(client.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSince > 30) {
      return 'Schedule follow-up appointment'
    }
  }
  
  return 'Schedule next session'
}
