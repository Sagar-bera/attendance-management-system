import { NavLink } from "react-router-dom";
import { FiCalendar, FiX } from "react-icons/fi";

const Sidebar = ({ links, open, onClose }) => (
  <>
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <FiCalendar />
        <span>AttendSys</span>
        <button
          className="modal-close"
          style={{ marginLeft: "auto", color: "#cbd5e1", display: open ? "block" : "none" }}
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) =>
          link.action ? (
            <a
              key={link.label}
              className="sidebar-link"
              onClick={link.action}
              style={{ cursor: "pointer" }}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </aside>
    <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />
  </>
);

export default Sidebar;
