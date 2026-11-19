import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="auth-page">
    <div className="auth-card" style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: 48, margin: 0, color: "var(--primary)" }}>404</h1>
      <p className="auth-subtitle">Page not found</p>
      <Link to="/login" className="btn btn-primary">
        Go to Login
      </Link>
    </div>
  </div>
);

export default NotFound;
