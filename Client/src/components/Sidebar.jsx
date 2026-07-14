import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPendingStudents, BASE_URL } from "../services/api";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const [adminOpen, setAdminOpen] = useState(
    ["/admin", "/complaints", "/profile", "/admin/portal", "/admin/approvals"].some(
      (p) => location.pathname.startsWith(p)
    )
  );

  useEffect(() => {
    if (user?.role !== "admin") return;
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getPendingStudents(token);
        setPendingCount(res.data.length);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Overlay backdrop on mobile */}
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <ul className="sidebar-menu">

          {/* ── Student menu ── */}
          {user?.role === "student" && (
            <>
              <li>
                <NavLink to="/student" className={({ isActive }) => isActive ? "active" : ""}>
                  🏠 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/create" className={({ isActive }) => isActive ? "active" : ""}>
                  📝 Create Complaint
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                  👤 My Profile
                </NavLink>
              </li>
            </>
          )}

          {/* ── Admin menu ── */}
          {user?.role === "admin" && (
            <>
              <li>
                <button
                  className={`sidebar-folder-btn ${adminOpen ? "sidebar-folder-open" : ""}`}
                  onClick={() => setAdminOpen((o) => !o)}
                >
                  <span className="sidebar-folder-icon">🛡️</span>
                  <span className="sidebar-folder-label">Admin Panel</span>
                  {pendingCount > 0 && (
                    <span className="sidebar-pending-dot">{pendingCount}</span>
                  )}
                  <span className="sidebar-folder-arrow">{adminOpen ? "▾" : "▸"}</span>
                </button>

                {adminOpen && (
                  <ul className="sidebar-submenu">
                    <li>
                      <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="sidebar-sub-icon">📊</span> Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/approvals" className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="sidebar-sub-icon">✅</span> Approvals
                        {pendingCount > 0 && (
                          <span className="sidebar-pending-dot" style={{ marginLeft: "auto" }}>{pendingCount}</span>
                        )}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/complaints" className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="sidebar-sub-icon">📋</span> All Complaints
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/students" className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="sidebar-sub-icon">🎓</span> Students
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/portal" className={({ isActive }) => isActive ? "active" : ""}>
                        <span className="sidebar-sub-icon">🛡️</span> Admin Portal
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                  👤 My Profile
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-sidebar-logout">
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
