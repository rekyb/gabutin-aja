import { describe, it, expect } from 'vitest'

describe('test environment', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('has jest-dom matchers available', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
  })
})
