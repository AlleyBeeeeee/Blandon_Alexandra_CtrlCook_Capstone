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
}
