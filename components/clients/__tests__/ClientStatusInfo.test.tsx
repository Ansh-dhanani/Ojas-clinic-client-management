import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { ClientStatusInfo } from '../ClientStatusInfo'

// Mock data
const mockClient = {
  id: 'client-1',
  status: 'ACTIVE',
  missedAppointments: 0,
  createdAt: new Date('2025-01-01'),
}

const mockSessions = [
  {
    id: 'session-1',
    date: new Date('2025-11-20'),
    nextSessionDate: new Date('2025-12-15'),
    treatmentCompleted: false,
  },
]

describe('ClientStatusInfo Component', () => {
  it('should render status overview title', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Client Status Overview')).toBeInTheDocument()
  })

  it('should show last visit date', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Last Visit')).toBeInTheDocument()
  })

  it('should show next appointment if scheduled', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Next Appointment')).toBeInTheDocument()
  })

  it('should show total sessions count', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show "No upcoming" when no next appointment', () => {
    const sessionsWithoutNext = [{
      ...mockSessions[0],
      nextSessionDate: null,
    }]
    
    render(<ClientStatusInfo client={mockClient} sessions={sessionsWithoutNext} />)
    
    expect(screen.getByText('Not Scheduled')).toBeInTheDocument()
  })

  it('should display missed appointments count', () => {
    const clientWithMissed = {
      ...mockClient,
      missedAppointments: 2,
    }
    
    render(<ClientStatusInfo client={clientWithMissed} sessions={mockSessions} />)
    
    expect(screen.getByText('2 missed')).toBeInTheDocument()
  })

  it('should show next action recommendation', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Next Action')).toBeInTheDocument()
  })

  it('should show current status badge', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText('Current Status')).toBeInTheDocument()
  })

  it('should calculate and show auto-status', () => {
    render(<ClientStatusInfo client={mockClient} sessions={mockSessions} />)
    
    expect(screen.getByText(/Auto-calculated:/)).toBeInTheDocument()
  })

  it('should show manual override indicator when status differs', () => {
    const clientWithOverride = {
      ...mockClient,
      status: 'CANCELLED',
    }
    
    render(<ClientStatusInfo client={clientWithOverride} sessions={mockSessions} />)
    
    expect(screen.getByText('Manual Override')).toBeInTheDocument()
  })

  it('should render edit mode with dropdown when isEditing is true', () => {
    const editData = { status: 'ACTIVE' }
    const setEditData = jest.fn()
    
    render(
      <ClientStatusInfo
        client={mockClient}
        sessions={mockSessions}
        isEditing={true}
        editData={editData}
        setEditData={setEditData}
      />
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should show PENDING recommendation for new clients', () => {
    const newClient = {
      ...mockClient,
      status: 'PENDING',
    }
    
    render(<ClientStatusInfo client={newClient} sessions={[]} />)
    
    expect(screen.getByText(/first consultation/i)).toBeInTheDocument()
  })

  it('should show GHOSTED recommendation', () => {
    const ghostedClient = {
      ...mockClient,
      status: 'GHOSTED',
    }
    
    render(<ClientStatusInfo client={ghostedClient} sessions={mockSessions} />)
    
    expect(screen.getByText(/reconnect/i)).toBeInTheDocument()
  })

  it('should show COMPLETED recommendation', () => {
    const completedClient = {
      ...mockClient,
      status: 'COMPLETED',
    }
    
    render(<ClientStatusInfo client={completedClient} sessions={mockSessions} />)
    
    expect(screen.getByText(/Follow-up/i)).toBeInTheDocument()
  })

  it('should calculate days until next appointment', () => {
    const futureAppointment = new Date()
    futureAppointment.setDate(futureAppointment.getDate() + 5)
    
    const sessionsWithFuture = [{
      ...mockSessions[0],
      nextSessionDate: futureAppointment,
    }]
    
    render(<ClientStatusInfo client={mockClient} sessions={sessionsWithFuture} />)
    
    // Use getAllByText since text appears multiple times
    const daysMatches = screen.getAllByText(/In \d+ days?/i)
    expect(daysMatches.length).toBeGreaterThan(0)
  })

  it('should show overdue message for past appointments', () => {
    const pastAppointment = new Date()
    pastAppointment.setDate(pastAppointment.getDate() - 3)
    
    const sessionsWithPast = [{
      ...mockSessions[0],
      nextSessionDate: pastAppointment,
    }]
    
    render(<ClientStatusInfo client={mockClient} sessions={sessionsWithPast} />)
    
    // Check for action needed or schedule next session message - use getAllByText
    const actionMatches = screen.getAllByText(/(action needed|schedule next|not scheduled)/i)
    expect(actionMatches.length).toBeGreaterThan(0)
  })
})
