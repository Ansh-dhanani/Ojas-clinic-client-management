import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditableField } from '../EditableField'

describe('EditableField Component', () => {
  const defaultProps = {
    label: 'Test Field',
    value: 'Test Value',
    isEditing: false,
    onChange: jest.fn(),
    type: 'text' as const,
  }

  it('should render label and value in view mode', () => {
    render(<EditableField {...defaultProps} />)
    
    expect(screen.getByText('Test Field')).toBeInTheDocument()
    expect(screen.getByText('Test Value')).toBeInTheDocument()
  })

  it('should render N/A when value is empty in view mode', () => {
    render(<EditableField {...defaultProps} value="" />)
    
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should use displayValue if provided', () => {
    render(
      <EditableField
        {...defaultProps}
        value="2025-12-01"
        displayValue="Dec 1, 2025"
      />
    )
    
    expect(screen.getByText('Dec 1, 2025')).toBeInTheDocument()
  })

  it('should render text input in edit mode', () => {
    render(<EditableField {...defaultProps} isEditing={true} />)
    
    const input = screen.getByDisplayValue('Test Value')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should render number input for number type', () => {
    render(
      <EditableField
        {...defaultProps}
        type="number"
        value="25"
        isEditing={true}
      />
    )
    
    const input = screen.getByDisplayValue('25')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should render date input for date type', () => {
    render(
      <EditableField
        {...defaultProps}
        type="date"
        value="2025-12-01"
        isEditing={true}
      />
    )
    
    const input = screen.getByDisplayValue('2025-12-01')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('should render select dropdown for select type', () => {
    const options = ['Option 1', 'Option 2', 'Option 3']
    render(
      <EditableField
        {...defaultProps}
        type="select"
        value="Option 1"
        options={options}
        isEditing={true}
      />
    )
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('Option 1')
  })

  it('should call onChange when input value changes', () => {
    const onChange = jest.fn()
    render(
      <EditableField
        {...defaultProps}
        onChange={onChange}
        isEditing={true}
      />
    )
    
    const input = screen.getByDisplayValue('Test Value')
    fireEvent.change(input, { target: { value: 'New Value' } })
    
    expect(onChange).toHaveBeenCalledWith('New Value')
  })

  it('should call onChange when select value changes', () => {
    const onChange = jest.fn()
    const options = ['Male', 'Female', 'Other']
    render(
      <EditableField
        {...defaultProps}
        type="select"
        value="Male"
        options={options}
        onChange={onChange}
        isEditing={true}
      />
    )
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'Female' } })
    
    expect(onChange).toHaveBeenCalledWith('Female')
  })

  it('should show placeholder when provided in edit mode', () => {
    render(
      <EditableField
        {...defaultProps}
        value=""
        placeholder="Enter value here"
        isEditing={true}
      />
    )
    
    const input = screen.getByPlaceholderText('Enter value here')
    expect(input).toBeInTheDocument()
  })

  it('should render without errors', () => {
    const { container } = render(
      <EditableField
        {...defaultProps}
      />
    )
    
    // Just verify component renders correctly
    expect(container.firstChild).toBeTruthy()
  })

  it('should render textarea for textarea type', () => {
    render(
      <EditableField
        {...defaultProps}
        type="textarea"
        value="Long text content"
        isEditing={true}
      />
    )
    
    const textarea = screen.getByDisplayValue('Long text content')
    expect(textarea.tagName).toBe('TEXTAREA')
  })
})
