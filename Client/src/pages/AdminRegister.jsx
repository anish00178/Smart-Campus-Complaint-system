import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminRegister } from "../services/api";
import bvecLogo from "../assets/logoNew.png";

export default function AdminRegister() {
  const [form, setForm]       = useState({ name: "", email: "", password: "", adminSecret: "" });
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== confirm)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await adminRegister(form);
      setSuccess("Admin account created! Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-bg">
      <div className="auth-card admin-auth-card">

        <div className="admin-auth-badge">
          <span className="admin-auth-shield">🛡️</span>
          <span className="admin-auth-badge-text">Admin Registration</span>
        </div>

        <div className="auth-logo-wrap">
          <img src={bvecLogo} alt="BVEC Logo" className="auth-logo" />
        </div>

        <h2 className="auth-title">Create Admin Account</h2>
        <p className="auth-subtitle">Requires the admin secret key to proceed</p>

        {error   && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Admin Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@campus.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-pwd-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
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

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminSecret">Admin Secret Key</label>
            <div className="input-pwd-wrap">
              <input
                id="adminSecret"
                name="adminSecret"
                type={showSecret ? "text" : "password"}
                placeholder="Enter admin secret key"
                value={form.adminSecret}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowSecret((v) => !v)}
                aria-label={showSecret ? "Hide key" : "Show key"}
              >
                {showSecret ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="admin-secret-note">Contact your system administrator for the secret key.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full admin-login-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "🛡️ Create Admin Account"}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: "1rem" }}>
          Already have an admin account?{" "}
          <Link to="/admin/login">Sign in</Link>
        </p>
        <p className="auth-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
