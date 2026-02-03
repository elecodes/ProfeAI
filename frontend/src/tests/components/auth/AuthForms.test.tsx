import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignInForm from '../../../components/auth/SignInForm';
import SignUpForm from '../../../components/auth/SignUpForm';

describe('Authentication Forms Integration', () => {
  describe('SignInForm', () => {
    it('shows validation error when invalid email is blurred', async () => {
      render(<SignInForm onSubmit={async () => {}} />);
      
      const emailInput = screen.getByLabelText(/email \*/i);
      
      // Focus and enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      // Blur to trigger validation
      fireEvent.blur(emailInput);
      
      // Expect error message
      expect(await screen.findByText(/email no es válido/i)).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
      render(<SignInForm onSubmit={async () => {}} />);
      // Specific selector for the password input
      const passwordInput = screen.getByLabelText(/contraseña \*/i, { selector: 'input' });
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-label', 'Ocultar contraseña');
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('disables submit button and shows loading state on submission', async () => {
      const mockSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<SignInForm onSubmit={mockSubmit} />);
      
      fireEvent.change(screen.getByLabelText(/email \*/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/contraseña \*/i, { selector: 'input' }), { target: { value: 'password123' } });
      
      const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
      fireEvent.click(submitBtn);
      
      expect(mockSubmit).toHaveBeenCalled();
      expect(submitBtn).toBeDisabled();
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
      });
    });
  });

  describe('SignUpForm', () => {
    it('validates required fields on blur', async () => {
      render(<SignUpForm onSubmit={async () => {}} />);
      
      const emailInput = screen.getByLabelText(/email \*/i);
      fireEvent.blur(emailInput);
      expect(await screen.findByText(/email es obligatorio/i)).toBeInTheDocument();
      
      const passwordInput = screen.getByLabelText(/^Contraseña \*$/i, { selector: 'input' });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.blur(passwordInput);
      expect(await screen.findByText("Mínimo 8 caracteres.")).toBeInTheDocument();
    });
  });
});
