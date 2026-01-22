import React, { useState } from "react";
import { useFormValidation } from "./hooks/useFormValidation";

/**
 * Props for the SignInForm component.
 */
interface SignInFormProps {
  /**
   * Callback function triggered when the form is submitted with valid data.
   * returning a Promise that resolves when the submission is handled.
   */
  onSubmit: (data: any) => Promise<void>;
}

/**
 * A reusable Sign In form component.
 * 
 * Features:
 * - Email and Password fields with validation.
 * - Password visibility toggle.
 * - "Forgot Password" placeholder link.
 * - Loading state handling.
 * - Custom error mapping for common Firebase auth errors.
 * 
 * @param props - Component properties.
 * @returns The rendered form component.
 */
export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = () => ({
    email: (value: string) => {
      if (!value) return "El email es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "El email no es válido.";
      return "";
    },
    password: (value: string) => {
      if (!value) return "La contraseña es obligatoria.";
      if (value.length < 6)
        return "La contraseña debe tener al menos 6 caracteres.";
      return "";
    },
  });

  const {
    form,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    { email: "", password: "" },
    validationRules
  );

  const handleCustomSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (err: any) {
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' || 
        err.message?.includes('not found') ||
        err.message?.includes('no user record')
      ) {
         throw new Error("Account not found. Please register first.");
      }
      throw err;
    }
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e, handleCustomSubmit)}
      className="flex flex-col gap-4"
      autoComplete="on"
    >
      {errors.general && (
        <div
          role="alert"
          className="text-red-600 text-sm bg-red-100 p-2 rounded"
        >
          {errors.general}
        </div>
      )}

      {/* EMAIL */}
      <div className="flex flex-col">
        <label htmlFor="signin-email" className="font-medium">
          Email *
        </label>

        <input
          id="signin-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="email"
          className="border border-gray-300 p-3 rounded mt-1 text-base"
        />

        {errors.email && (
          <span className="text-red-600 text-sm mt-1">{errors.email}</span>
        )}
      </div>

      {/* PASSWORD */}
      <div className="flex flex-col">
        <label htmlFor="signin-password" className="font-medium">
          Contraseña *
        </label>

        <div className="relative">
          <input
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="current-password"
            className="border border-gray-300 p-3 rounded mt-1 w-full text-base"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-blue-600"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {errors.password && (
          <span className="text-red-600 text-sm mt-1">{errors.password}</span>
        )}
        <div className="text-right mt-1">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            onClick={() => window.alert("Forgot Password feature coming soon!")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-3 rounded text-lg font-semibold mt-2 disabled:bg-blue-300 hover:bg-blue-700 transition"
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
