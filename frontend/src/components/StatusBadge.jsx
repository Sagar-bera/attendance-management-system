const STATUS_CLASSES = {
  Present: "badge-present",
  Absent: "badge-absent",
  Late: "badge-late",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_CLASSES[status] || "badge-neutral"}`}>{status}</span>
);

export default StatusBadge;
