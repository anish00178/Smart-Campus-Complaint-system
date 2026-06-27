import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function CreateComplaint() {
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      if (form.image) data.append("image", form.image);

      await createComplaint(data, token);
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <h1>Submit a Complaint</h1>
          </div>

          <div className="form-card">
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={submit} className="auth-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Brief title of the issue"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="image">Attach Image (optional)</label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/student")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
