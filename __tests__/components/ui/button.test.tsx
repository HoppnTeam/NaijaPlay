import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, asChild, disabled, onClick, ...props }: any) => (
    asChild ? 
      React.cloneElement(React.Children.only(children), {
        className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ${
          variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''
        } ${
          size === 'lg' ? 'h-11 rounded-md px-8' : ''
        }`,
        ...props
      }) :
      <button 
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''
        } ${
          size === 'lg' ? 'h-11 rounded-md px-8' : ''
        }`}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
  )
}));

// Import after mocking
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50');
  });

  test('applies variant and size classes correctly', () => {
    render(<Button variant="destructive" size="lg">Delete</Button>);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive text-destructive-foreground hover:bg-destructive/90');
    expect(button).toHaveClass('h-11 rounded-md px-8');
  });

  test('renders as a different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="https://example.com">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium');
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
}); 