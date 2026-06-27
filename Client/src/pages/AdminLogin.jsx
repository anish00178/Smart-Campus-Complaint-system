import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import bvecLogo from "../assets/logoNew.png";

export default function AdminLogin() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login }           = useContext(AuthContext);
  const navigate            = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(form);
      login(res.data);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-bg">
      <div className="auth-card admin-auth-card">

        {/* Shield badge */}
        <div className="admin-auth-badge">
          <span className="admin-auth-shield">🛡️</span>
          <span className="admin-auth-badge-text">Admin Access</span>
        </div>

        <div className="auth-logo-wrap">
          <img src={bvecLogo} alt="BVEC Logo" className="auth-logo" />
        </div>

        <h2 className="auth-title">Admin Sign In</h2>
        <p className="auth-subtitle">Restricted to authorised administrators only</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@campus.edu"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-pwd-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full admin-login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "🔐 Sign In as Admin"}
          </button>
        </form>

        <div className="admin-auth-divider">
          <span>New admin?</span>
        </div>

        <Link to="/admin/register" className="btn btn-outline btn-full" style={{ textAlign: "center" }}>
          ➕ Create Admin Account
        </Link>

        <p className="auth-footer" style={{ marginTop: "1rem" }}>
          <Link to="/login">👤 Student login</Link>
          &nbsp;·&nbsp;
          <Link to="/">← Home</Link>
        </p>
      </div>
    </div>
  );
}
