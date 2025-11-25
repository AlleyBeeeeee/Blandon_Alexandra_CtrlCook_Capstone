import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/CClogo.png";

function Register() {
  // state hook to manage the value of the username input field
  const [usernameInput, setUsernameInput] = useState(""); // state hook to manage the value of the email input field
  const [email, setEmail] = useState(""); // state hook to manage the value of the password input field
  const [password, setPassword] = useState(""); // hook to get the dispatch function for sending actions to the redux store
  const dispatch = useDispatch(); // hook to get the navigation function for programmatic routing
  const navigate = useNavigate(); // function called when the registration form is submitted

  const handleSubmit = (e) => {
    // prevents the default form submission behavior (which causes a page reload)
    e.preventDefault(); // basic validation: if any required field is empty, exit the function
    if (!usernameInput || !email || !password) return; // in a real app, this would be an axios call to a backend /register endpoint. // for now, it simulates success by dispatching the login action with the new username.

    dispatch(login(usernameInput)); // navigate the user to the '/search' route after "successful" registration/login
    navigate("/search");
  }; // the component's render output

  return (
    // main container for the authentication view
    <div className="auth-container">
      <div className="auth-logo-container">
        {/* displays the imported logo image */}
        <img src={logo} alt="Ctrl + Cook Logo" className="auth-logo" />
      </div>
      <h2>register</h2>
      {/* form element that triggers the handlesubmit function on submission */}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username" // binds the input value to the usernameinput state
          value={usernameInput} // updates the usernameinput state whenever the input changes
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="email" // binds the input value to the email state
          value={email} // updates the email state whenever the input changes
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="password" // binds the input value to the password state
          value={password} // updates the password state whenever the input changes
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* submit button for the form */}
        <button type="submit">register</button>
      </form>

      <p>
        already have an account?{" "}
        {/* link component for navigation without page reload */}
        <Link to="/login">login here</Link>
      </p>
    </div>
  );
}

export default Register;
