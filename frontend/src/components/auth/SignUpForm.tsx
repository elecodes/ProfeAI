import React, { useState } from "react";
import { useFormValidation } from "./hooks/useFormValidation";

interface SignUpFormProps {
  onSubmit: (data: any) => Promise<void>;
}

export default function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationRules = () => ({
    email: (value: string) => {
      if (!value) return "El email es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "El email no es válido.";
      return "";
    },
    password: (value: string) => {
      if (!value) return "La contraseña es obligatoria.";
      if (value.length < 8)
        return "Mínimo 8 caracteres.";
      if (!/[A-Z]/.test(value)) return "Falta una mayúscula.";
      if (!/[0-9]/.test(value)) return "Falta un número.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Falta un carácter especial.";
      return "";
    },
    confirmPassword: (value: string, formData: any) => {
      if (!value) return "Confirma tu contraseña.";
      if (value !== formData.password)
        return "Las contraseñas no coinciden.";
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
    { email: "", password: "", confirmPassword: "" },
    validationRules
  );

  return (
    <form
      onSubmit={(e) => handleSubmit(e, onSubmit)}
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
        <label htmlFor="signup-email" className="font-medium">
          Email *
        </label>

        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="font-medium">
          Contraseña *
        </label>

        <div className="relative">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="new-password"
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

        {/* Password Requirements Checklist */}
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
            <p className="font-medium mb-1">La contraseña debe tener:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-xs">
                <li className={form.password.length >= 8 ? "text-green-600 font-medium" : "text-gray-500"}>Mínimo 8 caracteres</li>
                <li className={/[A-Z]/.test(form.password) ? "text-green-600 font-medium" : "text-gray-500"}>Una mayúscula</li>
                <li className={/[0-9]/.test(form.password) ? "text-green-600 font-medium" : "text-gray-500"}>Un número</li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? "text-green-600 font-medium" : "text-gray-500"}>Un carácter especial</li>
            </ul>
        </div>

        {errors.password && (
          <span className="text-red-600 text-sm mt-1">{errors.password}</span>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="flex flex-col">
        <label htmlFor="signup-confirm-password" className="font-medium">
          Confirmar contraseña *
        </label>

        <div className="relative">
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="new-password"
            className="border border-gray-300 p-3 rounded mt-1 w-full text-base"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-sm text-blue-600"
            aria-label={
              showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showConfirmPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {errors.confirmPassword && (
          <span className="text-red-600 text-sm mt-1">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-3 rounded text-lg font-semibold mt-2 disabled:bg-green-300 hover:bg-green-700 transition"
      >
        {loading ? "Cargando..." : "Registrarse"}
      </button>
    </form>
  );
}
