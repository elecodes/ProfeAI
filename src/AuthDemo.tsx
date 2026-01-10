import React from "react";
// @ts-ignore
import AuthForm from "./components/auth/AuthForm";

/**
 * Demo page to test the AuthForm component
 * To use: Change src/main.jsx to import AuthDemo instead of App
 */
function AuthDemo() {
  const handleSignIn = async (formData: any) => {
    console.log("✅ Sign in successful!");
    console.log("Email:", formData.email);
    console.log("Password:", formData.password);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`¡Bienvenido! Email: ${formData.email}`);
  };

  const handleSignUp = async (formData: any) => {
    console.log("✅ Sign up successful!");
    console.log("Email:", formData.email);
    console.log("Password:", formData.password);
    console.log("Confirm Password:", formData.confirmPassword);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`¡Cuenta creada! Email: ${formData.email}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔐 Auth Form Demo
          </h1>
          <p className="text-gray-600">
            Prueba el formulario de autenticación con toggle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div>
            <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
          </div>

          {/* Instructions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              📋 Instrucciones
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">🔄 Cambiar entre formularios:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Haz clic en las pestañas "Iniciar sesión" o "Registrarse"</li>
                  <li>O usa los enlaces en el footer del formulario</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">✅ Validaciones:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Email debe ser válido (ej: user@example.com)</li>
                  <li>Contraseña mínimo 6 caracteres</li>
                  <li>En registro: las contraseñas deben coincidir</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">🎯 Probar:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Intenta enviar el formulario vacío</li>
                  <li>Prueba con un email inválido</li>
                  <li>Usa una contraseña corta (&lt;6 caracteres)</li>
                  <li>En registro: pon contraseñas diferentes</li>
                  <li>Mira la consola para ver los datos enviados</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded mt-4">
                <h3 className="font-semibold text-lg mb-2">💡 Para usar en tu app:</h3>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`import AuthForm from "./components/auth/AuthForm";

<AuthForm 
  onSignIn={handleSignIn} 
  onSignUp={handleSignUp} 
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Para volver a tu app principal, cambia el import en{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">src/main.jsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthDemo;
