import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/CClogo.png";

function Register() {
  const [usernameInput, setUsernameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!usernameInput || !email || !password) return;

    dispatch(login(usernameInput));
    navigate("/search");
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <img src={logo} alt="Ctrl + Cook Logo" className="auth-logo" />
      </div>

      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login Here</Link>
      </p>
    </div>
  );
}

export default Register;
