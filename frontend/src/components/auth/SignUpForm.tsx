import { useState } from "react";
import { useFormValidation } from "./hooks/useFormValidation";

interface SignUpFormProps {
  onSubmit: (data: any) => Promise<void>;
  /**
   * Optional callback for Google Sign In.
   */
  onGoogleSignIn?: () => Promise<void>;
}

export default function SignUpForm({ onSubmit, onGoogleSignIn }: SignUpFormProps) {
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

      {/* GOOGLE SIGN IN */}
      {onGoogleSignIn && (
        <>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium font-sans">O</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 bg-white border border-gray-300 p-3 rounded text-base font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Registrarse con Google
          </button>
        </>
      )}
    </form>
  );
}
