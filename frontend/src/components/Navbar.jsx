import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          STEM<span>Access</span>
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/opportunities">Opportunities</Link>
              <Link to="/mentors">Mentors</Link>
              <Link to="/applications">My Applications</Link>
              <Link to="/notifications">Notifications</Link>
              <Link to="/profile">Profile</Link>
              {user.role === "administrator" && <Link to="/admin">Admin</Link>}
              <button className="btn-link" onClick={handleLogout}>
                Log out ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <>
              <Link to="/opportunities">Browse Opportunities</Link>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn-primary-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
