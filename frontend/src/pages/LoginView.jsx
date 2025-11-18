import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice.js";

function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div>
      <h2>{isRegister ? "register" : "login"}</h2>
      {message && (
        <p style={{ color: message.includes("error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LoginView;
