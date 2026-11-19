const getColor = (pct) => {
  if (pct >= 75) return "var(--success)";
  if (pct >= 50) return "var(--warning)";
  return "var(--danger)";
};

const ProgressBar = ({ percentage = 0, showLabel = true }) => {
  const pct = Math.min(100, Math.max(0, percentage));
  return (
    <div className="flex items-center gap-12">
      <div className="progress-bar-track" style={{ flex: 1 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: getColor(pct) }} />
      </div>
      {showLabel && <span className="text-sm" style={{ fontWeight: 700, minWidth: 42, textAlign: "right" }}>{pct}%</span>}
    </div>
  );
};

export default ProgressBar;
