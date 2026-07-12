import { useEffect, useState } from "react";
import { getComplaints, updateStatus } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const FILTERS = ["all", "pending", "resolved", "rejected"];

const STATUS_COLORS = { pending: "#f59e0b", resolved: "#10b981", rejected: "#ef4444" };

export default function ViewComplaints() {
  const [complaints, setComplaints]   = useState([]);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
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

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      const token = localStorage.getItem("token");
      await updateStatus(id, status, token);
      // update the list in-place without a full refetch to avoid flicker
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      // keep modal in sync — update status but do NOT close it
      setSelected((prev) => (prev?._id === id ? { ...prev, status } : prev));
      // background refresh to stay in sync with server
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
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

  return (
    <div className="layout">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">

          {/* Header */}
          <div className="page-header">
            <h1>All Complaints</h1>
            <span className="vc-total-badge">{complaints.length} total</span>
          </div>

          {/* Filter tabs with counts */}
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
              placeholder="🔍  Search by title, description, student name, roll no or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline" onClick={() => setSearch("")}>Clear</button>
            )}
          </div>

          {/* Results count */}
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
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        {c.image ? (
                          <a href={`http://localhost:5000/uploads/${c.image}`} target="_blank" rel="noreferrer">
                            <img src={`http://localhost:5000/uploads/${c.image}`} alt="complaint" className="admin-thumb" />
                          </a>
                        ) : <span className="admin-done">—</span>}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${c.status}`}
                          style={{ cursor: "default" }}
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
                <span>📅 {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
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

              <button className="btn btn-outline" style={{ marginLeft: "auto" }} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
