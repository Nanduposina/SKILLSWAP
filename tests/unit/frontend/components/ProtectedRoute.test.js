import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../src/frontend/src/contexts/AuthContext';
import ProtectedRoute from '../../../../src/frontend/src/components/ProtectedRoute';

describe('ProtectedRoute - Unit Tests', () => {
  it('should render ProtectedRoute component without crashing', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    // Component should render without throwing errors
    expect(screen.getByTestId('memory-router')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="protected-child">Test Child</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login (navigate component should be present)
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('should handle protected route rendering', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Child 1</div>
            <div>Child 2</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show navigation component for redirect
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});
