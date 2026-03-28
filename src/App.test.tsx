import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/FurnitureViewport', () => ({
  FurnitureViewport: () => <div>Mock 3D viewport</div>,
}))

describe('App', () => {
  it('renders the default design state', () => {
    render(<App />)
    expect(screen.getByText(/Storage cabinet concept/i)).toBeInTheDocument()
    expect(screen.getByText(/Concept parts list/i)).toBeInTheDocument()
  })

  it('switches family and updates the visible concept', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /Work desk/i })[0])

    expect(screen.getByText(/Work desk concept/i)).toBeInTheDocument()
    expect(await screen.findAllByText(/Mock 3D viewport/i)).not.toHaveLength(0)
  })

  it('updates the parts list when the furniture family changes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: /Shelving bay/i })[0])

    expect(screen.getByText(/Back brace/i)).toBeInTheDocument()
  })
})
