import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('directory UI path', () => {
  it('searches the embedded dataset from the main directory', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'London Founder Programmes' })).toBeInTheDocument()
    const search = screen.getByLabelText('Search programmes')
    await user.type(search, 'techstars')
    expect(screen.getByRole('heading', { name: 'Techstars London' })).toBeInTheDocument()
    expect(screen.getByTestId('showing-count').textContent).toBe('1')
  })
})
