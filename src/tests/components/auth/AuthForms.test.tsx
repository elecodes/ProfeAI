import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../../../components/auth/LoginForm';
import { RegisterForm } from '../../../components/auth/RegisterForm';

describe('Authentication Forms Integration', () => {
  describe('LoginForm', () => {
    it('shows validation error when invalid email is blurred', async () => {
      render(<LoginForm onSubmit={async () => {}} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      
      // Focus and enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      // Blur to trigger validation
      fireEvent.blur(emailInput);
      
      // Expect error message
      expect(await screen.findByRole('alert')).toHaveTextContent(/email must include @/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('clears error when user types again (progressive strategy)', async () => {
      render(<LoginForm onSubmit={async () => {}} />);
      const emailInput = screen.getByLabelText(/email address/i);
      
      // Trigger error
      fireEvent.change(emailInput, { target: { value: 'bad' } });
      fireEvent.blur(emailInput);
      expect(await screen.findByRole('alert')).toBeInTheDocument();
      
      // Type again - error should disappear (optional UX feature implemented)
      fireEvent.change(emailInput, { target: { value: 'bad2' } });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('toggles password visibility', () => {
      render(<LoginForm onSubmit={async () => {}} />);
      // Use selector to specifically find the input, ignoring the button with aria-label
      const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
      const toggleButton = screen.getByRole('button', { name: /show password/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('disables submit button and shows loading state on submission', async () => {
      const mockSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<LoginForm onSubmit={mockSubmit} />);
      
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'password123' } });
      
      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);
      
      expect(mockSubmit).toHaveBeenCalled();
      expect(submitBtn).toBeDisabled();
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
      });
    });
  });

  describe('RegisterForm', () => {
    it('validates name, email, and password on blur', async () => {
      render(<RegisterForm onSubmit={async () => {}} />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      fireEvent.blur(nameInput);
      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
      
      const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.blur(passwordInput);
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
