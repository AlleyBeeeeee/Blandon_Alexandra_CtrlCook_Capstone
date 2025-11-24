import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/CClogo.png"; // import logo

function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!usernameInput) return;

    dispatch(login(usernameInput));
    navigate("/search");
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <img src={logo} alt="Ctrl + Cook Logo" className="auth-logo" />
      </div>

      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or Email"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register Here</Link>
      </p>
    </div>
  );
}

export default Login;
