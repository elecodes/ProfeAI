import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

interface AuthFormProps {
  onSignIn: (data: any) => Promise<void>;
  onSignUp: (data: any) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
}

export default function AuthForm({ onSignIn, onSignUp, onResetPassword, onGoogleSignIn }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("signin")}
          className={`flex-1 py-3 text-center font-semibold transition ${
            activeTab === "signin"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-3 text-center font-semibold transition ${
            activeTab === "signup"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* FORM CONTENT */}
      <div className="mt-4">
        {activeTab === "signin" ? (
          <SignInForm onSubmit={onSignIn} onResetPassword={onResetPassword} onGoogleSignIn={onGoogleSignIn} />
        ) : (
          <SignUpForm onSubmit={onSignUp} onGoogleSignIn={onGoogleSignIn} />
        )}
      </div>

      {/* FOOTER LINKS */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {activeTab === "signin" ? (
          <p>
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => setActiveTab("signup")}
              className="text-blue-600 hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        ) : (
          <p>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => setActiveTab("signin")}
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
