import { useEffect, useState } from "react";
import { getPendingStudents, approveStudent, rejectStudent, getAllStudents } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const TABS = ["pending", "all"];

export default function AdminApprovals() {
  const [pending, setPending]         = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [tab, setTab]                 = useState("pending");
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState(null);
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        getPendingStudents(token),
        getAllStudents(token),
      ]);
      setPending(pRes.data);
      setAllStudents(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionId(id + "approve");
    try {
      await approveStudent(id, token);
      await fetchData();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and delete this student registration?")) return;
    setActionId(id + "reject");
    try {
      await rejectStudent(id, token);
      await fetchData();
    } finally {
      setActionId(null);
    }
  };

  const list = (tab === "pending" ? pending : allStudents).filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="layout">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">

          <div className="page-header">
            <h1>Student Approvals</h1>
            {pending.length > 0 && (
              <span className="approval-pending-badge">
                {pending.length} pending
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="vc-filter-tabs" style={{ marginBottom: "1rem" }}>
            <button
              className={`vc-tab ${tab === "pending" ? "vc-tab-active" : ""}`}
              onClick={() => setTab("pending")}
            >
              <span>⏳ Pending</span>
              <span className="vc-tab-count vc-count-pending">{pending.length}</span>
            </button>
            <button
              className={`vc-tab ${tab === "all" ? "vc-tab-active" : ""}`}
              onClick={() => setTab("all")}
            >
              <span>🎓 All Students</span>
              <span className="vc-tab-count vc-count-all">{allStudents.length}</span>
            </button>
          </div>

          {/* Search */}
          <div className="admin-toolbar" style={{ marginBottom: "1rem" }}>
            <input
              className="admin-search"
              type="text"
              placeholder="🔍  Search by name, email, roll no or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline" onClick={() => setSearch("")}>Clear</button>
            )}
          </div>

          {loading ? (
            <div className="admin-loading">Loading students...</div>
          ) : list.length === 0 ? (
            <div className="vc-empty">
              <span>{tab === "pending" ? "✅" : "👥"}</span>
              <p>{tab === "pending" ? "No pending approvals." : "No students found."}</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll No</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>ID Card</th>
                    <th>Registered</th>
                    <th>Status</th>
                    {tab === "pending" && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((s, i) => (
                    <tr key={s._id} className="admin-table-row">
                      <td className="admin-td-num">{i + 1}</td>
                      <td>
                        <div className="vc-student-cell">
                          <span className="vc-student-name">{s.name}</span>
                        </div>
                      </td>
                      <td className="vc-student-email">{s.email}</td>
                      <td><span className="admin-roll">{s.rollNo || "—"}</span></td>
                      <td>
                        <span className="approval-branch-badge">{s.branch || "—"}</span>
                      </td>
                      <td>{s.semester ? `Sem ${s.semester}` : "—"}</td>
                      <td>
                        {s.idCard ? (
                          s.idCard.endsWith(".pdf") ? (
                            <a href={`http://localhost:5000/uploads/${s.idCard}`} target="_blank" rel="noreferrer" className="reg-idcard-link">
                              📄 View PDF
                            </a>
                          ) : (
                            <a href={`http://localhost:5000/uploads/${s.idCard}`} target="_blank" rel="noreferrer">
                              <img src={`http://localhost:5000/uploads/${s.idCard}`} alt="ID Card" className="admin-thumb" style={{ borderRadius: "6px" }} />
                            </a>
                          )
                        ) : <span className="admin-done">—</span>}
                      </td>
                      <td className="admin-td-date">
                        {new Date(s.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`badge ${s.isApproved ? "badge-resolved" : "badge-pending"}`}>
                          {s.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      {tab === "pending" && (
                        <td>
                          <div className="admin-action-btns">
                            <button
                              className="btn-action btn-resolve"
                              disabled={!!actionId}
                              onClick={() => handleApprove(s._id)}
                            >
                              {actionId === s._id + "approve" ? "..." : "✔ Approve"}
                            </button>
                            <button
                              className="btn-action btn-reject"
                              disabled={!!actionId}
                              onClick={() => handleReject(s._id)}
                            >
                              {actionId === s._id + "reject" ? "..." : "✘ Reject"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
