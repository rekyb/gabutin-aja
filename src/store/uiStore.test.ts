import { describe, it, expect, beforeEach } from 'vitest'
import { useUiStore } from './uiStore'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.getState().closeLoginModal()
  })

  it('starts with showLoginModal as false', () => {
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })

  it('sets showLoginModal to true when openLoginModal is called', () => {
    useUiStore.getState().openLoginModal()
    expect(useUiStore.getState().showLoginModal).toBe(true)
  })

  it('sets showLoginModal to false when closeLoginModal is called', () => {
    useUiStore.getState().openLoginModal()
    useUiStore.getState().closeLoginModal()
    expect(useUiStore.getState().showLoginModal).toBe(false)
  })
})
