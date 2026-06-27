import { useEffect, useState } from "react";
import { getComplaints } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await getComplaints(token);
        // derive unique students from complaints
        const map = {};
        res.data.forEach((c) => {
          if (!c.user) return;
          const id = c.user._id;
          if (!map[id]) {
            map[id] = {
              ...c.user,
              total: 0, pending: 0, resolved: 0, rejected: 0,
            };
          }
          map[id].total++;
          map[id][c.status] = (map[id][c.status] || 0) + 1;
        });
        setStudents(Object.values(map));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">

          <div className="page-header">
            <h1>Students</h1>
            <span className="vc-total-badge">{students.length} registered</span>
          </div>

          <div className="admin-toolbar">
            <input
              className="admin-search"
              type="text"
              placeholder="🔍  Search by name, email or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline" onClick={() => setSearch("")}>Clear</button>
            )}
          </div>

          {loading ? (
            <div className="admin-loading">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="vc-empty">
              <span>👥</span>
              <p>No students found{search ? ` matching "${search}"` : ""}.</p>
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
                    <th>Total</th>
                    <th>Pending</th>
                    <th>Resolved</th>
                    <th>Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s._id} className="admin-table-row">
                      <td className="admin-td-num">{i + 1}</td>
                      <td>
                        <div className="vc-student-cell">
                          <span className="vc-student-name">{s.name}</span>
                        </div>
                      </td>
                      <td className="vc-student-email">{s.email}</td>
                      <td><span className="admin-roll">{s.rollNo || "—"}</span></td>
                      <td><span className="students-count students-total">{s.total}</span></td>
                      <td><span className="students-count students-pending">{s.pending || 0}</span></td>
                      <td><span className="students-count students-resolved">{s.resolved || 0}</span></td>
                      <td><span className="students-count students-rejected">{s.rejected || 0}</span></td>
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
