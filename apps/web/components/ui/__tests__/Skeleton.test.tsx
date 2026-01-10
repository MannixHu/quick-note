import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton, SkeletonText } from '../Skeleton'

describe('Skeleton', () => {
  it('renders with default styles', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('applies custom width and height', () => {
    render(<Skeleton width={100} height={50} data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' })
  })
})

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('[class*="bg-"]')
    expect(lines.length).toBe(3)
  })

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('[class*="bg-"]')
    expect(lines.length).toBe(5)
  })
})
