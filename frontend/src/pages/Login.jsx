import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/CClogo.png";

function Login() {
  const [usernameInput, setUsernameInput] = useState(""); // state hook to manage the value of the password input field
  const [password, setPassword] = useState(""); // hook to get the dispatch function for sending actions to the redux store
  const dispatch = useDispatch(); // hook to get the navigation function for programmatic routing
  const navigate = useNavigate(); // function called when the login form is submitted

  const handleSubmit = (e) => {
    // prevents the default form submission behavior
    e.preventDefault(); // basic validation: if the username field is empty, exit the function
    if (!usernameInput) return; // dispatch the 'login' action from userSlice, passing the username as the payload

    dispatch(login(usernameInput)); // navigate the user to the '/search' route upon successful "login"
    navigate("/search");
  };

  return (
    // main container for the authentication view
    <div className="auth-container">
      <div className="auth-logo-container">
        {/* displays the imported logo image */}
        <img src={logo} alt="Ctrl + Cook Logo" className="auth-logo" /> 
      </div>
      <h2>Login</h2>
      {/* form element that triggers the handlesubmit function on submission */}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or Email" // binds the input value to the usernameinput state
          value={usernameInput} // updates the usernameinput state whenever the input changes
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password" // binds the input value to the password state
          value={password} // updates the password state whenever the input changes
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* submit button for the form */}
        <button type="submit">Login</button>
      </form>

      <p>
        don't have an account?
        {/* link component for navigation without page reload */}
        <Link to="/register">register here</Link>
      </p>
    </div>
  );
}

export default Login;
