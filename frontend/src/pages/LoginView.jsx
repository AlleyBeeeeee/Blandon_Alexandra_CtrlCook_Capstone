import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../store/slices/authSlice";
import { register, login } from "../services/authService";

const LoginView = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setMessage("Logged out successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    const userData = { email, password };
    if (isRegister) {
      userData.username = username;
    }

    try {
      let responseData;
      if (isRegister) {
        responseData = await register(userData);
        setMessage("Registration successful! Redirecting...");
      } else {
        responseData = await login(userData);
        setMessage("Login successful! Welcome back.");
      }

      dispatch(loginSuccess(responseData));
    } catch (error) {
      // Use a generic message if no specific message is available
      const errorMessage =
        error.response?.data?.message ||
        "Authentication failed. Please check your credentials.";
      setMessage(errorMessage);
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If the user is logged in, show a simple log out message/button instead of the form
  if (user) {
    return (
      <div className="flex justify-center items-start min-h-[calc(100vh-80px)] pt-12">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
          <h2 className="text-3xl font-bold text-teal-600 mb-4">
            Welcome, {user.username || user.email.split("@")[0]}!
          </h2>
          <p className="text-gray-600 mb-6">You are already signed in.</p>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    // Centered container for the form
    <div className="flex justify-center items-start min-h-[calc(100vh-80px)] pt-12">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? "Create Your Account" : "Welcome Back"}
        </h2>

        {/* Message Display (Error/Success) */}
        {message && (
          <p
            className={`p-3 rounded-lg text-sm text-center mb-4 ${
              message.includes("successful") || message.includes("Welcome")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <input
                type="text"
                placeholder="Username (e.g., CookMaster77)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              />
            </div>
          )}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition duration-300 shadow-lg ${
              isLoading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isLoading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Toggle link */}
        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setUsername("");
            setEmail("");
            setPassword("");
          }}
          className="text-center mt-6 text-sm text-gray-500 hover:text-teal-600 cursor-pointer transition duration-150"
        >
          {isRegister
            ? "Already have an account? Log In"
            : "Need an account? Register Here"}
        </p>
      </div>
    </div>
  );
};

export default LoginView;
