import { render, screen } from '@testing-library/react'
import { PersonalInfoSection } from '../PersonalInfoSection'

describe('PersonalInfoSection', () => {
  const mockClient = {
    fullName: 'John Doe',
    gender: 'MALE',
    dateOfBirth: new Date('1990-01-01'),
    phone: '1234567890',
    email: 'john@example.com',
    totalSessionsNeeded: 6,
    totalSessionsCompleted: 3,
    createdAt: new Date('2024-01-01')
  }

  const mockEditData = {
    fullName: 'John Doe',
    gender: 'MALE',
    dateOfBirth: '1990-01-01',
    totalSessionsNeeded: 6,
    totalSessionsCompleted: 3
  }

  const mockSetEditData = jest.fn()

  it('should render personal information in view mode', () => {
    render(
      <PersonalInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('MALE')).toBeInTheDocument()
  })

  it('should display age correctly', () => {
    render(
      <PersonalInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText(/years/i)).toBeInTheDocument()
  })

  it('should display sessions progress', () => {
    render(
      <PersonalInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('3 / 6')).toBeInTheDocument()
  })

  it('should render editable fields in edit mode', () => {
    render(
      <PersonalInfoSection
        client={mockClient}
        isEditing={true}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should display member since date', () => {
    render(
      <PersonalInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Member Since')).toBeInTheDocument()
  })
})
