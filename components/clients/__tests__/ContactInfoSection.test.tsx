import { render, screen } from '@testing-library/react'
import { ContactInfoSection } from '../ContactInfoSection'

describe('ContactInfoSection', () => {
  const mockClient = {
    phone: '1234567890',
    whatsapp: '1234567890',
    email: 'john@example.com',
    address: '123 Main St, City, State'
  }

  const mockEditData = {
    phone: '1234567890',
    whatsapp: '1234567890',
    email: 'john@example.com',
    address: '123 Main St, City, State'
  }

  const mockSetEditData = jest.fn()

  it('should render contact information in view mode', () => {
    render(
      <ContactInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getAllByText('1234567890').length).toBeGreaterThan(0)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should display phone number', () => {
    render(
      <ContactInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Phone')).toBeInTheDocument()
    // Use getAllByText since phone appears multiple times (Phone and WhatsApp have same number)
    expect(screen.getAllByText('1234567890').length).toBeGreaterThan(0)
  })

  it('should display email', () => {
    render(
      <ContactInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should display address', () => {
    render(
      <ContactInfoSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('123 Main St, City, State')).toBeInTheDocument()
  })

  it('should render editable fields in edit mode', () => {
    render(
      <ContactInfoSection
        client={mockClient}
        isEditing={true}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('should show N/A for missing optional fields', () => {
    const clientWithMissingData = {
      phone: '1234567890',
      whatsapp: null,
      email: null,
      address: null
    }

    render(
      <ContactInfoSection
        client={clientWithMissingData}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    const naElements = screen.getAllByText('N/A')
    expect(naElements.length).toBeGreaterThan(0)
  })
})
