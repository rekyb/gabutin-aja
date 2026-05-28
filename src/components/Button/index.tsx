import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { BUTTON_PRESS } from '@/lib/design-tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // 1. Variant class mapping
    let variantClass = ''
    switch (variant) {
      case 'primary':
        variantClass = 'bg-primary text-primary-foreground border-2 border-border hover:bg-primary/90 transition-colors'
        break
      case 'secondary':
        variantClass = 'bg-secondary text-secondary-foreground border-2 border-border hover:bg-secondary/90 transition-colors'
        break
      case 'outline':
        variantClass = 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150'
        break
      case 'ghost':
        variantClass = 'bg-transparent border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        break
      case 'danger':
        variantClass = 'bg-red-500 text-white border-2 border-border hover:bg-red-600 transition-colors'
        break
      default:
        variantClass = 'bg-primary text-primary-foreground border-2 border-border hover:bg-primary/90 transition-colors'
    }

    // 2. Size class mapping
    let sizeClass = ''
    switch (size) {
      case 'sm':
        sizeClass = 'py-1.5 px-3 text-xs'
        break
      case 'md':
        sizeClass = 'py-2.5 px-4 text-sm'
        break
      case 'lg':
        sizeClass = 'py-3 px-6 text-base'
        break
      default:
        sizeClass = 'py-2.5 px-4 text-sm'
    }

    const widthClass = fullWidth ? 'w-full' : ''
    const disabledClass = (disabled || isLoading) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`
          ${BUTTON_PRESS}
          ${variantClass}
          ${sizeClass}
          ${widthClass}
          ${disabledClass}
          font-mono font-bold flex items-center justify-center gap-2 select-none box-border
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
        
        <span>{children}</span>
        
        {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
