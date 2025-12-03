import { updateClientStatus, getStatusBadge, getNextActionRecommendation } from '../client-status'
import { prisma } from '../prisma'

// Mock prisma
jest.mock('../prisma', () => ({
  prisma: {
    client: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Client Status Management', () => {
  const mockClientId = 'test-client-id'
  const now = new Date()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateClientStatus', () => {
    it('should set status to PENDING for new client with no sessions', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'PENDING',
        sessions: [],
        appointments: [],
        missedAppointments: 0,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)
      ;(prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient })

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('PENDING')
      expect(result.reason).toContain('New client')
    })

    it('should set status to COMPLETED when treatment is completed', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'ACTIVE',
        sessions: [{
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          treatmentCompleted: true,
        }],
        appointments: [],
        missedAppointments: 0,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)
      ;(prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient, status: 'COMPLETED' })

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('COMPLETED')
      expect(result.reason).toContain('completed')
    })

    it('should set status to GHOSTED for clients inactive >60 days with missed appointments', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'ACTIVE',
        sessions: [{
          date: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
          treatmentCompleted: false,
        }],
        appointments: [],
        missedAppointments: 2,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)
      ;(prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient, status: 'GHOSTED' })

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('GHOSTED')
      expect(result.reason).toContain('No contact')
    })

    it('should set status to ACTIVE with upcoming appointment', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'PENDING',
        sessions: [{
          date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          treatmentCompleted: false,
        }],
        appointments: [{
          date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        }],
        missedAppointments: 0,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)
      ;(prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient, status: 'ACTIVE' })

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('ACTIVE')
      expect(result.reason).toContain('appointment')
    })

    it('should set status to INACTIVE for clients inactive 45-60 days', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'ACTIVE',
        sessions: [{
          date: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
          treatmentCompleted: false,
        }],
        appointments: [],
        missedAppointments: 1,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)
      ;(prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient, status: 'INACTIVE' })

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('INACTIVE')
      expect(result.reason).toContain('No activity')
    })

    it('should not update CANCELLED status', async () => {
      const mockClient = {
        id: mockClientId,
        status: 'CANCELLED',
        sessions: [],
        appointments: [],
        missedAppointments: 0,
      }
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient)

      const result = await updateClientStatus(mockClientId)
      
      expect(result.newStatus).toBe('CANCELLED')
      expect(result.reason).toContain('Manually cancelled')
      expect(prisma.client.update).not.toHaveBeenCalled()
    })

    it('should throw error if client not found', async () => {
      ;(prisma.client.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateClientStatus(mockClientId)).rejects.toThrow('Client not found')
    })
  })

  describe('getStatusBadge', () => {
    it('should return correct badge for PENDING status', () => {
      const badge = getStatusBadge('PENDING')
      expect(badge.label).toBe('Pending')
      expect(badge.icon).toBe('⏳')
      expect(badge.color).toContain('yellow')
    })

    it('should return correct badge for ACTIVE status', () => {
      const badge = getStatusBadge('ACTIVE')
      expect(badge.label).toBe('Active')
      expect(badge.icon).toBe('✓')
      expect(badge.color).toContain('green')
    })

    it('should return correct badge for COMPLETED status', () => {
      const badge = getStatusBadge('COMPLETED')
      expect(badge.label).toBe('Completed')
      expect(badge.icon).toBe('🎉')
      expect(badge.color).toContain('blue')
    })

    it('should return correct badge for GHOSTED status', () => {
      const badge = getStatusBadge('GHOSTED')
      expect(badge.label).toBe('Ghosted')
      expect(badge.icon).toBe('👻')
      expect(badge.color).toContain('red')
    })
  })

  describe('getNextActionRecommendation', () => {
    it('should recommend first consultation for PENDING clients', () => {
      const client = { status: 'PENDING' }
      const recommendation = getNextActionRecommendation(client)
      expect(recommendation).toContain('first consultation')
    })

    it('should recommend reconnecting for GHOSTED clients', () => {
      const client = { status: 'GHOSTED' }
      const recommendation = getNextActionRecommendation(client)
      expect(recommendation).toContain('reconnect')
    })

    it('should recommend follow-up for COMPLETED clients', () => {
      const client = { status: 'COMPLETED' }
      const recommendation = getNextActionRecommendation(client)
      expect(recommendation).toContain('Follow-up')
    })

    it('should show days until appointment if scheduled', () => {
      const client = {
        status: 'ACTIVE',
        nextAppointmentDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      }
      const recommendation = getNextActionRecommendation(client)
      // Use flexible matching since exact days may vary
      expect(recommendation).toMatch(/Next appointment in \d+ days?/)
    })

    it('should show overdue message for past appointments', () => {
      const client = {
        status: 'ACTIVE',
        nextAppointmentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      }
      const recommendation = getNextActionRecommendation(client)
      expect(recommendation).toContain('overdue')
    })
  })
})
