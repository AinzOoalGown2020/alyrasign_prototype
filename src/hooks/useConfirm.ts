'use client'

export const useConfirm = () => {
  const confirm = (message: string): boolean => {
    if (typeof window === 'undefined') return false
    return window.confirm(message)
  }

  return { confirm }
} 