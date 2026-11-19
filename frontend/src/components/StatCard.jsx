const StatCard = ({ icon, label, value, color = "#4f46e5", bg = "#eef2ff" }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ color, background: bg }}>
      {icon}
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

export default StatCard;
