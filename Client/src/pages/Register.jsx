import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";
import bvecLogo from "../assets/logoNew.png";

const BRANCHES  = ["CSE", "CE", "ETE", "ME"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", rollNo: "", branch: "", semester: "",
  });
  const [idCard, setIdCard]       = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdCard(file);
    if (file.type.startsWith("image/")) {
      setIdPreview(URL.createObjectURL(file));
    } else {
      setIdPreview("pdf"); // PDF — show icon instead
    }
  };

  const removeFile = () => {
    setIdCard(null);
    setIdPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== confirm) return setError("Passwords do not match.");
    if (form.password.length < 6)  return setError("Password must be at least 6 characters.");
    if (!idCard) return setError("Please upload your college ID card.");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("idCard", idCard);

    setLoading(true);
    try {
      const res = await registerUser(fd);
      setSuccess(res.data.message || "Registration submitted! Awaiting admin approval.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <img src={bvecLogo} alt="BVEC Logo" className="auth-logo" />
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the Smart Campus system</p>

        {error && <p className="error-msg">{error}</p>}

        {success ? (
          <div className="reg-pending-box">
            <span className="reg-pending-icon">⏳</span>
            <div>
              <strong>Registration Submitted!</strong>
              <p style={{ marginTop: "0.35rem", fontSize: "0.88rem" }}>{success}</p>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ marginTop: "0.85rem", display: "inline-block" }}
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                placeholder="Enter your full name"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNo">College Roll No</label>
              <input
                id="rollNo" name="rollNo" type="text"
                placeholder="e.g. 22CS001"
                value={form.rollNo} onChange={handleChange} required
              />
            </div>

            <div className="reg-row">
              <div className="form-group">
                <label htmlFor="branch">Branch</label>
                <select
                  id="branch" name="branch"
                  value={form.branch} onChange={handleChange} required
                  className="reg-select"
                >
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester" name="semester"
                  value={form.semester} onChange={handleChange} required
                  className="reg-select"
                >
                  <option value="">Select sem</option>
                  {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email"
                placeholder="Enter your Email"
                value={form.email} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-pwd-wrap">
                <input
                  id="password" name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} required
                />
                <button type="button" className="pwd-toggle"
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
                id="confirm" type="password"
                placeholder="Re-enter password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              />
            </div>

            {/* ── ID Card Upload ── */}
            <div className="form-group">
              <label>College ID Card <span className="reg-required">*</span></label>
              <p className="reg-upload-hint">Upload a clear photo or PDF of your college ID card (max 5MB)</p>

              {!idCard ? (
                <label htmlFor="idCard" className="reg-upload-zone">
                  <span className="reg-upload-icon">🪪</span>
                  <span className="reg-upload-text">Click to upload ID card</span>
                  <span className="reg-upload-sub">JPG, PNG or PDF</span>
                  <input
                    id="idCard"
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,.pdf"
                    onChange={handleFile}
                    style={{ display: "none" }}
                  />
                </label>
              ) : (
                <div className="reg-upload-preview">
                  {idPreview === "pdf" ? (
                    <div className="reg-pdf-preview">
                      <span>📄</span>
                      <span>{idCard.name}</span>
                    </div>
                  ) : (
                    <img src={idPreview} alt="ID Card preview" className="reg-id-preview-img" />
                  )}
                  <button type="button" className="reg-remove-file" onClick={removeFile}>
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
