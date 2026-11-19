import Modal from "./Modal";

const ConfirmDialog = ({ open, title = "Are you sure?", message, confirmLabel = "Confirm", danger = true, onConfirm, onCancel, loading = false }) => {
  if (!open) return null;
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ margin: "0 0 20px", color: "var(--text)" }}>{message}</p>
      <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={loading}>
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
