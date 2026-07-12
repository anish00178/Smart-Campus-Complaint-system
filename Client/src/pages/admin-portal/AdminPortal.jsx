import { useEffect, useState, useCallback } from "react";
import { getComplaints, updateStatus, getAdminStats } from "../../services/api";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const FILTERS = ["all", "pending", "resolved", "rejected"];
const STATUS_COLOR = { pending: "#f59e0b", resolved: "#10b981", rejected: "#ef4444" };

export default function AdminPortal() {
  const [complaints, setComplaints]       = useState([]);
  const [stats, setStats]                 = useState(null);
  const [filter, setFilter]               = useState("all");
  const [search, setSearch]               = useState("");
  const [selected, setSelected]           = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("complaints");
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const token = localStorage.getItem("token");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        getComplaints(token),
        getAdminStats(token),
      ]);
      setComplaints(cRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.error("Failed to load portal data", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateStatus(id, status, token);
      await fetchAll();
      setSelected((prev) => prev?._id === id ? { ...prev, status } : prev);
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all:      complaints.length,
    pending:  complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    rejected: complaints.filter((c) => c.status === "rejected").length,
  };

  const filtered = complaints
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.user?.name?.toLowerCase().includes(q) ||
        c.user?.rollNo?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q)
      );
    });

  const resolvedPct = counts.all
    ? Math.round((counts.resolved / counts.all) * 100)
    : 0;

  return (
    <div className="layout">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">

          {/* ── Page header ── */}
          <div className="ap-header">
            <div>
              <h1 className="ap-title">🛡️ Admin Portal</h1>
              <p className="ap-subtitle">Manage and review all campus complaints</p>
            </div>
            <div className="ap-tab-switcher">
              <button
                className={`ap-tab-btn ${activeTab === "complaints" ? "ap-tab-btn-active" : ""}`}
                onClick={() => setActiveTab("complaints")}
              >📋 Complaints</button>
              <button
                className={`ap-tab-btn ${activeTab === "stats" ? "ap-tab-btn-active" : ""}`}
                onClick={() => setActiveTab("stats")}
              >📊 Overview</button>
            </div>
          </div>

          {/* ── Overview tab ── */}
          {activeTab === "stats" && (
            <div className="ap-overview">
              <div className="ap-stat-grid">
                {[
                  { label: "Total Complaints", value: counts.all,      icon: "📁", color: "#6366f1" },
                  { label: "Pending",           value: counts.pending,  icon: "⏳", color: "#f59e0b" },
                  { label: "Resolved",          value: counts.resolved, icon: "✅", color: "#10b981" },
                  { label: "Rejected",          value: counts.rejected, icon: "❌", color: "#ef4444" },
                  { label: "Total Students",    value: stats?.totalStudents ?? "—", icon: "🎓", color: "#8b5cf6" },
                ].map((s) => (
                  <div key={s.label} className="ap-stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
                    <span className="ap-stat-icon">{s.icon}</span>
                    <span className="ap-stat-num" style={{ color: s.color }}>{s.value}</span>
                    <span className="ap-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="ap-progress-card">
                <div className="ap-progress-header">
                  <span>Resolution Rate</span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>{resolvedPct}%</span>
                </div>
                <div className="ap-progress-track">
                  <div className="ap-progress-fill" style={{ width: `${resolvedPct}%` }} />
                </div>
                <p className="ap-progress-note">{counts.resolved} of {counts.all} complaints resolved</p>
              </div>

              {/* Per-student breakdown */}
              {stats?.perStudent?.length > 0 && (
                <div className="ap-student-breakdown">
                  <h2 className="ap-section-title">Student Complaint Breakdown</h2>
                  <div className="admin-table-wrap">
                    <table className="complaints-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Name</th><th>Roll No</th>
                          <th>Total</th><th>Pending</th><th>Resolved</th><th>Rejected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.perStudent.map((s, i) => (
                          <tr key={s._id} className="admin-table-row">
                            <td className="admin-td-num">{i + 1}</td>
                            <td>
                              <div className="vc-student-cell">
                                <span className="vc-student-name">{s.name}</span>
                                <span className="vc-student-email">{s.email}</span>
                              </div>
                            </td>
                            <td><span className="admin-roll">{s.rollNo || "—"}</span></td>
                            <td><span className="students-count students-total">{s.total}</span></td>
                            <td><span className="students-count students-pending">{s.pending}</span></td>
                            <td><span className="students-count students-resolved">{s.resolved}</span></td>
                            <td><span className="students-count students-rejected">{s.rejected}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Complaints tab ── */}
          {activeTab === "complaints" && (
            <>
              {/* Filter tabs */}
              <div className="vc-filter-tabs">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    className={`vc-tab ${filter === f ? "vc-tab-active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                    <span className={`vc-tab-count vc-count-${f}`}>{counts[f]}</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="admin-toolbar" style={{ marginBottom: "1rem" }}>
                <input
                  className="admin-search"
                  type="text"
                  placeholder="🔍  Search by title, student, roll no or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline" onClick={() => setSearch("")}>Clear</button>
                )}
              </div>

              {!loading && (
                <p className="vc-results-info">
                  Showing <strong>{filtered.length}</strong> complaint{filtered.length !== 1 ? "s" : ""}
                  {search && ` for "${search}"`}
                </p>
              )}

              {loading ? (
                <div className="admin-loading">Loading complaints...</div>
              ) : filtered.length === 0 ? (
                <div className="vc-empty">
                  <span>📭</span>
                  <p>No complaints found{search ? ` matching "${search}"` : ""}.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="complaints-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Date</th>
                        <th>Image</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c, i) => (
                        <tr key={c._id} className="admin-table-row">
                          <td className="admin-td-num">{i + 1}</td>
                          <td>
                            <button className="admin-title-btn" onClick={() => setSelected(c)}>
                              {c.title}
                            </button>
                          </td>
                          <td className="admin-td-desc">{c.description}</td>
                          <td>
                            <div className="vc-student-cell">
                              <span className="vc-student-name">{c.user?.name || "N/A"}</span>
                              <span className="vc-student-email">{c.user?.email || ""}</span>
                            </div>
                          </td>
                          <td><span className="admin-roll">{c.user?.rollNo || "—"}</span></td>
                          <td className="admin-td-date">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td>
                            {c.image ? (
                              <a href={`http://localhost:5000/uploads/${c.image}`} target="_blank" rel="noreferrer">
                                <img
                                  src={`http://localhost:5000/uploads/${c.image}`}
                                  alt="complaint"
                                  className="admin-thumb"
                                />
                              </a>
                            ) : <span className="admin-done">—</span>}
                          </td>
                          <td>
                            <span
                              className={`badge badge-${c.status}`}
                              style={{ cursor: "default", borderLeft: `3px solid ${STATUS_COLOR[c.status]}` }}
                            >{c.status}</span>
                          </td>
                          <td>
                            {c.status === "pending" ? (
                              <div className="admin-action-btns">
                                <button
                                  className="btn-action btn-resolve"
                                  disabled={!!actionLoading}
                                  onClick={() => handleStatus(c._id, "resolved")}
                                >✔ Resolve</button>
                                <button
                                  className="btn-action btn-reject"
                                  disabled={!!actionLoading}
                                  onClick={() => handleStatus(c._id, "rejected")}
                                >✘ Reject</button>
                              </div>
                            ) : (
                              <button
                                className="btn-action btn-reopen"
                                disabled={!!actionLoading}
                                onClick={() => handleStatus(c._id, "pending")}
                              >↩ Reopen</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
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
                <span>📅 {new Date(selected.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "long", year: "numeric",
                })}</span>
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              </div>
              <p className="modal-desc">{selected.description}</p>
              {selected.image && (
                <a href={`http://localhost:5000/uploads/${selected.image}`} target="_blank" rel="noreferrer">
                  <img
                    src={`http://localhost:5000/uploads/${selected.image}`}
                    alt="complaint"
                    className="modal-img"
                  />
                </a>
              )}
            </div>
            <div className="modal-footer">
              {selected.status === "pending" && (
                <>
                  <button
                    className="btn-action btn-resolve"
                    style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                    disabled={!!actionLoading}
                    onClick={() => handleStatus(selected._id, "resolved")}
                  >✔ Mark Resolved</button>
                  <button
                    className="btn-action btn-reject"
                    style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                    disabled={!!actionLoading}
                    onClick={() => handleStatus(selected._id, "rejected")}
                  >✘ Reject</button>
                </>
              )}
              {selected.status !== "pending" && (
                <button
                  className="btn-action btn-reopen"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                  disabled={!!actionLoading}
                  onClick={() => handleStatus(selected._id, "pending")}
                >↩ Reopen</button>
              )}
              <button
                className="btn btn-outline"
                style={{ marginLeft: "auto" }}
                onClick={() => setSelected(null)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
