import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageModal } from '../ImageModal'

describe('ImageModal Component', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test Image',
    onClose: jest.fn(),
  }

  it('should render image with correct src and alt', () => {
    render(<ImageModal {...defaultProps} />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', defaultProps.src)
    expect(img).toHaveAttribute('alt', defaultProps.alt)
  })

  it('should render alt text', () => {
    render(<ImageModal {...defaultProps} />)
    
    expect(screen.getByText('Test Image')).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', () => {
    const onClose = jest.fn()
    render(<ImageModal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop clicked', () => {
    const onClose = jest.fn()
    const { container } = render(<ImageModal {...defaultProps} onClose={onClose} />)
    
    const backdrop = container.querySelector('.fixed')
    fireEvent.click(backdrop as HTMLElement)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should render with overlay styling', () => {
    const { container } = render(<ImageModal {...defaultProps} />)
    
    const backdrop = container.querySelector('.fixed')
    expect(backdrop).toHaveClass('bg-black', 'bg-opacity-90')
  })

  it('should render close button', () => {
    render(<ImageModal {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveClass('hover:text-gray-300')
  })

  it('should center image on screen', () => {
    const { container } = render(<ImageModal {...defaultProps} />)
    
    const modalContent = container.querySelector('.flex.items-center.justify-center')
    expect(modalContent).toBeInTheDocument()
  })

  it('should handle base64 image sources', () => {
    const base64Src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
    const base64Alt = 'Base64 Image'
    
    render(<ImageModal src={base64Src} alt={base64Alt} onClose={jest.fn()} />)
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', base64Src)
  })
})
