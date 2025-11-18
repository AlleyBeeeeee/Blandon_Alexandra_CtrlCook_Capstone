// User Authentication (Client UI)

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice.js";
import { register, login } from "../services/authService";

function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  // form submission handler for login / register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const userData = { email, password };
    if (isRegister) {
      userData.username = username; //include user for registration
    }
    try {
      let responseData;
      if (isRegister) {
        // call the register API service
        responseData = await register(userData);
        setMessage("registration successful! logging you in...");
      } else {
        // call the login API service
        responseData = await login(userData);
        setMessage("login successful!");
      }

      // if the request succeeds, dispatch the user data to redux and local storage
      dispatch(loginSuccess(responseData));
    } catch (error) {
      // handle api errors
      const errorMessage =
        error.response?.data?.message ||
        "an error occurred. please check your credentials.";
      setMessage(errorMessage);
      console.error("auth error:", error);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{isRegister ? "register" : "login"}</h2>
      {/* Display messages using CSS classes defined in App.css */}
      {message && (
        <p
          className={
            message.includes("error") || message.includes("failed")
              ? "error-msg"
              : "success-msg"
          }
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username input shown only during registration */}
        {isRegister && (
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? "sign up" : "log in"}</button>
      </form>

      {/* Toggle link to switch between login and register views */}
      <p
        onClick={() => {
          setIsRegister(!isRegister);
          setMessage(""); // clear message on mode switch
        }}
        className="toggle-auth"
      >
        {isRegister
          ? "already have an account? login"
          : "need an account? register"}
      </p>
    </div>
  );
}

export default LoginView;
