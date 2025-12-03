import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddSessionModal } from '../AddSessionModal'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react')

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('AddSessionModal', () => {
  const mockOnClose = jest.fn()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'doctor-1', email: 'doctor@test.com' } },
      status: 'authenticated',
      update: jest.fn()
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AddSessionModal
          clientId="client-1"
          sessionNumber={1}
          onClose={mockOnClose}
        />
      </QueryClientProvider>
    )
  }

  it('should render add session modal with session number', () => {
    renderComponent()
    expect(screen.getByText(/Add Session #1/i)).toBeInTheDocument()
  })

  it('should have category dropdown with all options', () => {
    renderComponent()
    const categorySelect = screen.getByTestId('session-category-select')
    expect(categorySelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /acne treatment/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /pigmentation/i })).toBeInTheDocument()
  })

  it('should have session date input field', () => {
    renderComponent()
    const dateInput = screen.getByTestId('session-date-input')
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('type', 'datetime-local')
  })

  it('should have treatment completed checkbox in basic info section', () => {
    renderComponent()
    const treatmentCheckbox = screen.getByTestId('treatment-completed-checkbox-main')
    expect(treatmentCheckbox).toBeInTheDocument()
    expect(screen.getByText(/✓ Mark Treatment as Completed/i)).toBeInTheDocument()
  })

  it('should close modal when close button clicked', () => {
    renderComponent()
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should update category when selected', () => {
    renderComponent()
    const categorySelect = screen.getByTestId('session-category-select') as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: 'Acne Treatment' } })
    expect(categorySelect.value).toBe('Acne Treatment')
  })

  it('should toggle treatment completed checkbox', () => {
    renderComponent()
    const mainCheckbox = screen.getByTestId('treatment-completed-checkbox-main') as HTMLInputElement
    expect(mainCheckbox).not.toBeChecked()
    fireEvent.click(mainCheckbox)
    expect(mainCheckbox).toBeChecked()
  })

  it('should show before condition assessment section', () => {
    renderComponent()
    expect(screen.getByText(/🔍 Before Condition Assessment/i)).toBeInTheDocument()
    expect(screen.getByText(/Acne Severity/i)).toBeInTheDocument()
  })

  it('should show after treatment section when completed is checked', () => {
    renderComponent()
    const mainCheckbox = screen.getByTestId('treatment-completed-checkbox-main')
    
    // Before checking, after treatment section should not be visible
    expect(screen.queryByText(/📝 After Treatment/i)).not.toBeInTheDocument()
    
    // Check the checkbox
    fireEvent.click(mainCheckbox)
    
    // Now after treatment section should appear
    expect(screen.getByText(/📝 After Treatment/i)).toBeInTheDocument()
  })

  it('should show payment details section', () => {
    renderComponent()
    expect(screen.getByText(/💰/i)).toBeInTheDocument()
    expect(screen.getByText(/Payment Details/i)).toBeInTheDocument()
  })
})
