import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

function Navbar() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch(); // hook to send actions to redux
  const navigate = useNavigate(); // hook to change routes

  function handleLogout() {
    dispatch(logout()); //triggers logout action
    navigate("/login"); // redirects user to login page
  }
  return (
    <nav
      style={{
        padding: "10px 20px",
        backgroundColor: "#282c34",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="nav-left">
        {/* main link for the brand / redirects to search page */}
        <Link
          to="/search"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.5em",
          }}
        >
          Ctrl+Cook
        </Link>
      </div>

      <div className="nav-right">
        {/* search link visible for public recipe searching */}
        <Link
          to="/search"
          style={{
            color: "white",
            marginRight: "15px",
            textDecoration: "none",
          }}
        >
          search
        </Link>
        {/* conditionally renders links based on the authentication state */}
        {isAuthenticated ? (
          <>
            {/* link to the user's protected cookbook view */}
            <Link
              to="/cookbook"
              style={{
                color: "white",
                marginRight: "15px",
                textDecoration: "none",
              }}
            >
              my cookbook
            </Link>
            {/* button to trigger the logout function */}
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #61dafb",
                color: "#61dafb",
              }}
            >
              logout
            </button>
          </>
        ) : (
          // if not logged in, show a link to the login/register view
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            login / register
          </Link>
        )}
      </div>
    </nav>
  );
}
export default Navbar;
