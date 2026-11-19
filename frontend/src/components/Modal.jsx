import { FiX } from "react-icons/fi";

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
    <div className="modal-box">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

export default Modal;
