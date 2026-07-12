import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", rollNo: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getProfile(token);
        const u = res.data;
        setForm(f => ({ ...f, name: u.name, email: u.email, rollNo: u.rollNo || "" }));
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setError("New password must be at least 6 characters."); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: form.name, email: form.email, rollNo: form.rollNo };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await updateProfile(payload, token);
      updateUser(res.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="layout">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <div className="page-header">
            <h1>My Profile</h1>
          </div>

          {loading ? <p>Loading...</p> : (
            <div className="profile-wrapper">

              {/* ── Profile Card ── */}
              <div className="profile-card">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-info">
                  <h2 className="profile-name">{user?.name}</h2>
                  <span className={`badge profile-role-badge ${user?.role === "admin" ? "badge-resolved" : "badge-pending"}`}>
                    {user?.role}
                  </span>
                  <div className="profile-meta">
                    <span>📧 {user?.email}</span>
                    {user?.rollNo && <span>🎓 Roll No: {user.rollNo}</span>}
                  </div>
                </div>
                {!editMode && (
                  <button className="btn btn-primary profile-edit-btn" onClick={() => setEditMode(true)}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {/* ── Edit Form ── */}
              {editMode && (
                <form onSubmit={handleSave} className="profile-form">
                  <h3 className="profile-section-heading">Edit Profile</h3>

                  {error && <p className="error-msg">{error}</p>}
                  {success && <p className="success-msg">{success}</p>}

                  <div className="profile-fields">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    {user?.role === "student" && (
                      <div className="form-group">
                        <label>College Roll No</label>
                        <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 22CS001" />
                      </div>
                    )}
                  </div>

                  <h3 className="profile-section-heading" style={{ marginTop: "1.5rem" }}>Change Password <span className="profile-optional">(optional)</span></h3>
                  <div className="profile-fields">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: "1.5rem" }}>
                    <button type="button" className="btn btn-outline" onClick={() => { setEditMode(false); setError(""); }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {success && !editMode && <p className="success-msg" style={{ marginTop: "1rem" }}>{success}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
