import { calculatePaymentStatus } from '../payment-status'
import { prisma } from '../prisma'

// Mock prisma
jest.mock('../prisma', () => ({
  prisma: {
    sessionPayment: {
      findMany: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Payment Status Calculation', () => {
  const mockSessionId = 'test-session-id'
  const mockSession = {
    id: mockSessionId,
    date: new Date('2025-11-01'),
    paymentAmount: 5000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculatePaymentStatus', () => {
    it('should return PENDING if no payment amount is set', async () => {
      const session = { ...mockSession, paymentAmount: null, date: new Date('2025-11-01') }
      const status = await calculatePaymentStatus(mockSessionId, session)
      expect(status).toBe('PENDING')
    })

    it('should return UPCOMING for future session dates', async () => {
      const futureSession = {
        ...mockSession,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([])

      const status = await calculatePaymentStatus(mockSessionId, futureSession)
      expect(status).toBe('UPCOMING')
    })

    it('should return PAID when total paid equals payment amount', async () => {
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([
        { amount: 3000 },
        { amount: 2000 },
      ])

      const status = await calculatePaymentStatus(mockSessionId, mockSession)
      expect(status).toBe('PAID')
    })

    it('should return PAID when total paid exceeds payment amount', async () => {
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([
        { amount: 6000 },
      ])

      const status = await calculatePaymentStatus(mockSessionId, mockSession)
      expect(status).toBe('PAID')
    })

    it('should return PARTIAL when partially paid', async () => {
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([
        { amount: 2000 },
      ])

      const status = await calculatePaymentStatus(mockSessionId, mockSession)
      expect(status).toBe('PARTIAL')
    })

    it('should return PENDING for unpaid session within 7 days', async () => {
      const recentSession = {
        ...mockSession,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([])

      const status = await calculatePaymentStatus(mockSessionId, recentSession)
      expect(status).toBe('PENDING')
    })

    it('should return OVERDUE for unpaid session older than 7 days', async () => {
      const oldSession = {
        ...mockSession,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      }
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([])

      const status = await calculatePaymentStatus(mockSessionId, oldSession)
      expect(status).toBe('OVERDUE')
    })

    it('should return PARTIAL for partially paid session', async () => {
      const oldSession = {
        ...mockSession,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      }
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([
        { amount: 1000 },
      ])

      const status = await calculatePaymentStatus(mockSessionId, oldSession)
      expect(status).toBe('PARTIAL')
    })

    it('should fetch session if not provided', async () => {
      ;(prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.sessionPayment.findMany as jest.Mock).mockResolvedValue([
        { amount: 5000 },
      ])

      const status = await calculatePaymentStatus(mockSessionId)
      
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: mockSessionId },
        include: {
          sessionPayments: true
        },
      })
      expect(status).toBe('PAID')
    })
  })
})
