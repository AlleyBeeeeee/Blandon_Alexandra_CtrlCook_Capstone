import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/userSlice";
import logo from "../assets/CClogo.png";
import "../styles/Navbar.css";

function Navbar() {
  const username = useSelector((state) => state.user?.username);
  const location = useLocation();
  const dispatch = useDispatch();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Ctrl + Cook Logo" className="nav-logo" />
        </Link>
      </div>

      <div className="navbar-right">
        {username ? (
          <>
            <span className="welcome-text">Welcome, {username}!</span>
            <Link to="/mycookbook">My Cookbook</Link>
            <button className="logout-btn" onClick={() => dispatch(logout())}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
