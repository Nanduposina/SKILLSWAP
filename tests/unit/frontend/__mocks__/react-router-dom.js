import React from 'react';

// Mock react-router-dom components
export const BrowserRouter = ({ children }) => <div data-testid="browser-router">{children}</div>;
export const MemoryRouter = ({ children }) => <div data-testid="memory-router">{children}</div>;
export const Routes = ({ children }) => <div data-testid="routes">{children}</div>;
export const Route = ({ children, element }) => <div data-testid="route">{element || children}</div>;
export const Navigate = ({ to, replace, state }) => <div data-testid="navigate" data-to={to} data-replace={replace} data-state={JSON.stringify(state)} />;
export const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
export const NavLink = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;

// Mock hooks
export const useNavigate = () => jest.fn();
export const useLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
});
export const useParams = () => ({});
export const useSearchParams = () => [new URLSearchParams(), jest.fn()];

// Mock history
export const createBrowserHistory = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  listen: jest.fn(),
  location: {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }
});
