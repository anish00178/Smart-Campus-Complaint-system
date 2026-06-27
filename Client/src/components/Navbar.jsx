import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoNew from "../assets/logoNew.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/student";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logoNew} alt="BVEC Logo" className="navbar-logo" />
        <h2 className="navbar-title">Smart Campus Complaint System</h2>
      </div>
      {user && (
        <div className="navbar-user">
          <Link to={dashboardPath} className="navbar-dashboard-link">
            {user.role === "admin" ? "🛡️ Admin Panel" : "🏠 Dashboard"}
          </Link>
          <div className="navbar-user-info">
            <span className="navbar-welcome">👤 {user.name}</span>
            <span className={`navbar-role-badge ${user.role === "admin" ? "role-admin" : "role-student"}`}>
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}
