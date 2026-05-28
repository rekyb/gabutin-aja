import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from './index'
import { Sparkles } from 'lucide-react'

describe('Button', () => {
  it('renders button with children correctly', () => {
    render(<Button>Click Me</Button>)
    const button = screen.getByRole('button', { name: /Click Me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary') // default variant is primary
  })

  it('renders all variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="secondary">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')

    rerender(<Button variant="outline">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
    expect(screen.getByRole('button')).toHaveClass('border-primary')

    rerender(<Button variant="ghost">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-muted-foreground')

    rerender(<Button variant="danger">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-500')
  })

  it('renders all sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-xs')

    rerender(<Button size="md">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-sm')

    rerender(<Button size="lg">Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-base')
  })

  it('applies fullWidth style correctly', () => {
    render(<Button fullWidth>Btn</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('renders left and right icons correctly', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">👈</span>}
        rightIcon={<span data-testid="right-icon">👉</span>}
      >
        Btn
      </Button>
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('renders loading state correctly', () => {
    render(
      <Button
        isLoading
        leftIcon={<span data-testid="left-icon">👈</span>}
        rightIcon={<span data-testid="right-icon">👉</span>}
      >
        Btn
      </Button>
    )

    // Should have loading spinner
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('opacity-40')
    
    // Left and right icons should be hidden during loading
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('prevents click events when disabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Click Me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
