// Example usage of the new AuthForm component
import AuthForm from "./components/auth/AuthForm";

function App() {
  const handleSignIn = async (formData) => {
    console.log("Sign in with:", formData);
    // Call your authentication API here
    // Example: await signInUser(formData.email, formData.password);
  };

  const handleSignUp = async (formData) => {
    console.log("Sign up with:", formData);
    // Call your registration API here
    // Example: await registerUser(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
    </div>
  );
}

export default App;
