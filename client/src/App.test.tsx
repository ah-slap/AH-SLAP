import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

describe('App routing skeleton', () => {
  it('redirects root path to the Login page (Task C2)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders the Registration page on /register (Task C1)', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });
});
