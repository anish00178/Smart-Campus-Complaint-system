import { Link } from "react-router-dom";
import bvecLogo from "../assets/logoNew.png";

const features = [
  {
    icon: "📝",
    title: "Submit Complaints",
    desc: "Easily raise issues related to infrastructure, academics, hostel, or any campus facility.",
  },
  {
    icon: "📊",
    title: "Track Status",
    desc: "Monitor status of your complaints — pending, in-progress, or resolved.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your identity and data are protected. Only authorised admins can view complaint details.",
  },
  {
    icon: "⚡",
    title: "Fast Resolution",
    desc: "Complaints are routed directly to the concerned department for quick action.",
  },
];

export default function Home() {
  return (
    <div className="home">
      {/* ── Top bar ── */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <img src={bvecLogo} alt="BVEC Logo" className="home-logo-img" />
            <span className="home-logo-text">BVEC</span>
          </div>
          <nav className="home-nav">
            <Link to="/login" className="btn btn-outline home-nav-btn">Login</Link>
            <Link to="/register" className="btn btn-primary home-nav-btn">Register</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-hero-tag">Smart Campus Complaint System</p>
          <h1 className="home-hero-title">
            Barak Valley<br /><span>Engineering College</span>
          </h1>
          <p className="home-hero-sub">
            A unified platform for students to raise, track, and resolve campus
            complaints — making BVEC a better place for everyone.
          </p>
          <div className="home-hero-actions">
            <Link to="/register" className="btn btn-primary home-cta-btn">Get Started</Link>
            <Link to="/login" className="btn btn-outline home-cta-btn">Sign In</Link>
          </div>
        </div>
        <div className="home-hero-badge">
          <div className="home-badge-circle">
            <img src={bvecLogo} alt="BVEC Logo" className="home-badge-logo" />
          </div>
          <div className="home-badge-info">
            <span className="home-badge-label">Estd. 2017</span>
            <span className="home-badge-sub">Sribhumi</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-features">
        <h2 className="home-section-title">Why use this portal?</h2>
        <p className="home-section-sub">Everything you need to raise and resolve campus issues, in one place.</p>
        <div className="home-features-grid">
          {features.map((f) => (
            <div key={f.title} className="home-feature-card">
              <span className="home-feature-icon">{f.icon}</span>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="home-stats">
        <div className="home-stat">
          <span className="home-stat-num">800+</span>
          <span className="home-stat-label">Students</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">4+</span>
          <span className="home-stat-label">Departments</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">98%</span>
          <span className="home-stat-label">Resolution Rate</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">24/7</span>
          <span className="home-stat-label">Portal Access</span>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="home-cta-banner">
        <h2>Have a complaint? Let us know.</h2>
        <p>Register now and submit your first complaint in under a minute.</p>
        <Link to="/register" className="btn btn-primary home-cta-btn">Create an Account</Link>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Barak Valley Engineering College, Sribhumi — All rights reserved.</p>
      </footer>
    </div>
  );
}
