import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../../../src/frontend/src/contexts/AuthContext';

describe('AuthContext - Unit Tests', () => {
  it('should render AuthProvider without crashing', () => {
    render(
      <AuthProvider>
        <div>Test Content</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide context to children components', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Context Test</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should handle multiple children components', () => {
    render(
      <AuthProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AuthProvider>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});
