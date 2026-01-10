import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders title correctly', () => {
    render(<EmptyState title="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="No items" description="Start adding items to see them here" />)
    expect(screen.getByText('Start adding items to see them here')).toBeInTheDocument()
  })

  it('renders icon when provided as string', () => {
    render(<EmptyState title="Empty" icon="🎯" />)
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<EmptyState title="No items" action={<button type="button">Add Item</button>} />)
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })
})
