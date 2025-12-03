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

    // Get dashboard statistics
    const [
      totalClients,
      activeClients,
      totalSessions,
      thisMonthSessions,
      sessionPaymentsTotal,
      sessionPaymentsThisMonth,
      sessionPaymentsPending,
      upcomingAppointments
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.session.count(),
      prisma.session.count({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      // Total revenue from session payments
      prisma.session.aggregate({
        where: { paymentAmount: { not: null } },
        _sum: { paymentAmount: true }
      }),
      // This month's revenue from session payments
      prisma.session.aggregate({
        where: {
          paymentAmount: { not: null },
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { paymentAmount: true }
      }),
      // Pending session payments
      prisma.session.aggregate({
        where: { 
          paymentAmount: { not: null },
          paymentStatus: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
        },
        _sum: { paymentAmount: true }
      }),
      prisma.appointment.count({
        where: {
          date: { gte: new Date() },
          status: 'SCHEDULED'
        }
      })
    ])

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        client: true,
        doctor: true
      }
    })

    // Get treatment categories breakdown
    const sessions = await prisma.session.findMany({
      select: { category: true }
    })
    
    const categoryBreakdown = sessions.reduce((acc: Record<string, number>, session: { category: string }) => {
      acc[session.category] = (acc[session.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get monthly revenue trend (last 6 months) from session payments
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const sessionsWithPayments = await prisma.session.findMany({
      where: {
        date: { gte: sixMonthsAgo },
        paymentAmount: { not: null }
      },
      select: {
        date: true,
        paymentAmount: true
      }
    })

    // Group by month
    const monthlyRevenue = sessionsWithPayments.reduce((acc: Record<string, number>, session) => {
      const monthKey = new Date(session.date).toISOString().slice(0, 7)
      acc[monthKey] = (acc[monthKey] || 0) + (session.paymentAmount || 0)
      return acc
    }, {})

    return NextResponse.json({
      stats: {
        totalClients,
        activeClients,
        totalSessions,
        thisMonthSessions,
        totalRevenue: sessionPaymentsTotal._sum.paymentAmount || 0,
        thisMonthRevenue: sessionPaymentsThisMonth._sum.paymentAmount || 0,
        pendingPayments: sessionPaymentsPending._sum.paymentAmount || 0,
        upcomingAppointments
      },
      recentSessions,
      categoryBreakdown,
      monthlyRevenue
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
