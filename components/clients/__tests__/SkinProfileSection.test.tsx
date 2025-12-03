import { render, screen } from '@testing-library/react'
import { SkinProfileSection } from '../SkinProfileSection'

describe('SkinProfileSection', () => {
  const mockClient = {
    skinType: 'COMBINATION',
    skinConcerns: 'Acne, Dark spots, Uneven tone'
  }

  const mockEditData = {
    skinType: 'COMBINATION',
    skinConcerns: 'Acne, Dark spots, Uneven tone'
  }

  const mockSetEditData = jest.fn()

  it('should render skin profile information in view mode', () => {
    render(
      <SkinProfileSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Skin Profile')).toBeInTheDocument()
    expect(screen.getByText('COMBINATION')).toBeInTheDocument()
    expect(screen.getByText('Acne, Dark spots, Uneven tone')).toBeInTheDocument()
  })

  it('should display skin type', () => {
    render(
      <SkinProfileSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Skin Type')).toBeInTheDocument()
  })

  it('should display skin concerns', () => {
    render(
      <SkinProfileSection
        client={mockClient}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Skin Concerns')).toBeInTheDocument()
  })

  it('should render select dropdown in edit mode for skin type', () => {
    render(
      <SkinProfileSection
        client={mockClient}
        isEditing={true}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('should render textarea in edit mode for skin concerns', () => {
    render(
      <SkinProfileSection
        client={mockClient}
        isEditing={true}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('should show N/A for empty skin type', () => {
    const clientWithNoSkinType = {
      skinType: null,
      skinConcerns: 'Some concerns'
    }

    render(
      <SkinProfileSection
        client={clientWithNoSkinType}
        isEditing={false}
        editData={mockEditData}
        setEditData={mockSetEditData}
      />
    )

    expect(screen.getByText('Not specified')).toBeInTheDocument()
  })
})
