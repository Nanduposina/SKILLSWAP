import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../../../src/frontend/src/contexts/AuthContext';
import { SocketProvider } from '../../../../src/frontend/src/contexts/SocketContext';

describe('SocketContext - Unit Tests', () => {
  it('should render SocketProvider without crashing', () => {
    render(
      <AuthProvider>
        <SocketProvider>
          <div>Socket Test Content</div>
        </SocketProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Socket Test Content')).toBeInTheDocument();
  });

  it('should provide socket context to children', () => {
    render(
      <AuthProvider>
        <SocketProvider>
          <div data-testid="socket-child">Socket Context Test</div>
        </SocketProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('socket-child')).toBeInTheDocument();
  });

  it('should handle socket provider with multiple children', () => {
    render(
      <AuthProvider>
        <SocketProvider>
          <div>Socket Child 1</div>
          <div>Socket Child 2</div>
        </SocketProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Socket Child 1')).toBeInTheDocument();
    expect(screen.getByText('Socket Child 2')).toBeInTheDocument();
  });
});
