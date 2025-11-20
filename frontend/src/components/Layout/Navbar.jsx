import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

function Navbar() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }
  return (
    // 🎯 Use the new 'navbar' class
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/search">Ctrl+Cook</Link>
      </div>

      <div className="nav-right">
        {/* search link visible for public recipe searching */}
        <Link to="/search">search</Link>
        {/* conditionally renders links based on the authentication state */}
        {isAuthenticated ? (
          <>
            {/* link to the user's protected cookbook view */}
            <Link to="/cookbook">my cookbook</Link>
            {/* button to trigger the logout function */}
            <button onClick={handleLogout}>logout</button>
          </>
        ) : (
          // if not logged in, show a link to the login/register view
          <Link to="/login">login / register</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
