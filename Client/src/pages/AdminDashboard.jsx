import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, updateStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null); // modal
  const [actionLoading, setActionLoading] = useState(null);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await getComplaints(token);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    const token = localStorage.getItem("token");
    await updateStatus(id, status, token);
    await fetchComplaints();
    setActionLoading(null);
    if (selected?._id === id) setSelected(null);
  };

  const total    = complaints.length;
  const pending  = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const rejected = complaints.filter((c) => c.status === "rejected").length;

  const resolvedPct = total ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { label: "Total",    value: total,    icon: "📁", cls: "admin-stat-total",    color: "#6366f1" },
    { label: "Pending",  value: pending,  icon: "⏳", cls: "admin-stat-pending",  color: "#f59e0b" },
    { label: "Resolved", value: resolved, icon: "✅", cls: "admin-stat-resolved", color: "#10b981" },
    { label: "Rejected", value: rejected, icon: "❌", cls: "admin-stat-rejected", color: "#ef4444" },
  ];

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">

          {/* ── Welcome banner ── */}
          <div className="admin-welcome-banner">
            <div>
              <h1 className="admin-welcome-title">Welcome back, {user?.name} 👋</h1>
              <p className="admin-welcome-sub">Here's what's happening on campus today.</p>
            </div>
            <Link to="/complaints" className="btn btn-primary">📋 Manage All Complaints</Link>
          </div>

          {/* ── Stat cards ── */}
          <div className="admin-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className={`admin-stat-card ${s.cls}`}>
                <span className="admin-stat-icon">{s.icon}</span>
                <div>
                  <span className="admin-stat-num">{s.value}</span>
                  <span className="admin-stat-label">{s.label}</span>
                </div>
                <div className="admin-stat-bar-wrap">
                  <div
                    className="admin-stat-bar"
                    style={{ width: total ? `${Math.round((s.value / total) * 100)}%` : "0%", background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Resolution progress ── */}
          <div className="admin-progress-card">
            <div className="admin-progress-header">
              <span>Overall Resolution Rate</span>
              <span className="admin-progress-pct">{resolvedPct}%</span>
            </div>
            <div className="admin-progress-track">
              <div className="admin-progress-fill" style={{ width: `${resolvedPct}%` }} />
            </div>
            <p className="admin-progress-note">{resolved} of {total} complaints resolved</p>
          </div>

          {/* ── Recent complaints table ── */}
          <div className="admin-section-header">
            <h2 className="section-title" style={{ margin: 0 }}>Recent Complaints</h2>
            <Link to="/complaints" className="admin-view-all">View all →</Link>
          </div>

          {loading ? (
            <div className="admin-loading">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <p className="empty-state">No complaints submitted yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 8).map((c, i) => (
                    <tr key={c._id} className="admin-table-row">
                      <td className="admin-td-num">{i + 1}</td>
                      <td>
                        <button className="admin-title-btn" onClick={() => setSelected(c)}>
                          {c.title}
                        </button>
                      </td>
                      <td>{c.user?.name || "N/A"}</td>
                      <td><span className="admin-roll">{c.user?.rollNo || "—"}</span></td>
                      <td className="admin-td-date">{new Date(c.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td>
                        {c.status === "pending" ? (
                          <div className="admin-action-btns">
                            <button
                              className="btn-action btn-resolve"
                              disabled={actionLoading === c._id + "resolved"}
                              onClick={() => handleStatus(c._id, "resolved")}
                            >✔ Resolve</button>
                            <button
                              className="btn-action btn-reject"
                              disabled={actionLoading === c._id + "rejected"}
                              onClick={() => handleStatus(c._id, "rejected")}
                            >✘ Reject</button>
                          </div>
                        ) : (
                          <span className="admin-done">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selected.title}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span>👤 {selected.user?.name || "N/A"}</span>
                <span>🎓 {selected.user?.rollNo || "—"}</span>
                <span>📧 {selected.user?.email || "—"}</span>
                <span>📅 {new Date(selected.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              </div>
              <p className="modal-desc">{selected.description}</p>
              {selected.image && (
                <img
                  src={`http://localhost:5000/uploads/${selected.image}`}
                  alt="complaint"
                  className="modal-img"
                />
              )}
            </div>
            {selected.status === "pending" && (
              <div className="modal-footer">
                <button
                  className="btn-action btn-resolve"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                  onClick={() => handleStatus(selected._id, "resolved")}
                >✔ Mark Resolved</button>
                <button
                  className="btn-action btn-reject"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                  onClick={() => handleStatus(selected._id, "rejected")}
                >✘ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
