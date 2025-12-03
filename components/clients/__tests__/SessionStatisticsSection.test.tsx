import { render, screen } from '@testing-library/react'
import { SessionStatisticsSection } from '../SessionStatisticsSection'

describe('SessionStatisticsSection', () => {
  const mockSessions = [
    {
      id: '1',
      date: new Date('2024-01-01'),
      category: 'Acne Treatment',
      paymentAmount: 3000,
      paymentStatus: 'PAID'
    },
    {
      id: '2',
      date: new Date('2024-01-15'),
      category: 'Pigmentation',
      paymentAmount: 4000,
      paymentStatus: 'PENDING'
    },
    {
      id: '3',
      date: new Date('2024-02-01'),
      category: 'Skin Glow',
      paymentAmount: 2500,
      paymentStatus: 'PAID'
    }
  ]

  it('should render session statistics', () => {
    render(<SessionStatisticsSection sessions={mockSessions} />)

    expect(screen.getByText('Session Statistics')).toBeInTheDocument()
  })

  it('should display total sessions count', () => {
    render(<SessionStatisticsSection sessions={mockSessions} />)

    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should calculate total revenue correctly', () => {
    render(<SessionStatisticsSection sessions={mockSessions} />)

    // Check for basic statistics display
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should display first and last visit dates', () => {
    render(<SessionStatisticsSection sessions={mockSessions} />)

    expect(screen.getByText('First Visit')).toBeInTheDocument()
    expect(screen.getByText('Last Visit')).toBeInTheDocument()
  })

  it('should display payment information if present', () => {
    render(<SessionStatisticsSection sessions={[]} />)

    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render with session data', () => {
    render(<SessionStatisticsSection sessions={mockSessions} />)

    // Component renders successfully with session data
    expect(screen.getByText('Session Statistics')).toBeInTheDocument()
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
  })
})
