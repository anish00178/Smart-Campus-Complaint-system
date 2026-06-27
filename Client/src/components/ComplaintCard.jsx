export default function ComplaintCard({ complaint, onUpdate }) {
  const statusColor = {
    pending: "#f59e0b",
    resolved: "#10b981",
    rejected: "#ef4444",
  };

  return (
    <div className="complaint-card">
      <div className="complaint-card-header">
        <h3>{complaint.title}</h3>
        <span
          className="complaint-status"
          style={{ color: statusColor[complaint.status] || "#6b7280" }}
        >
          {complaint.status}
        </span>
      </div>
      <p className="complaint-description">{complaint.description}</p>
      {complaint.image && (
        <img
          src={`http://localhost:5000/uploads/${complaint.image}`}
          alt="complaint"
          className="complaint-image"
        />
      )}
      {onUpdate && complaint.status !== "resolved" && (
        <button className="btn btn-primary" onClick={() => onUpdate(complaint._id)}>
          Mark Resolved
        </button>
      )}
    </div>
  );
}
