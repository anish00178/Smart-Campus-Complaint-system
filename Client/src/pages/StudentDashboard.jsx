import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getComplaints } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ComplaintCard from "../components/ComplaintCard";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchComplaints();
  }, []);

  const pending = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1>Student Dashboard</h1>
            <Link to="/create" className="btn btn-primary">
              + New Complaint
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{complaints.length}</span>
              <span className="stat-label">Total Complaints</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>

          <h2 className="section-title">My Complaints</h2>
          {loading ? (
            <p>Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="empty-state">No complaints yet. <Link to="/create">Submit one</Link>.</p>
          ) : (
            <div className="complaints-grid">
              {complaints.map((c) => (
                <ComplaintCard key={c._id} complaint={c} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
