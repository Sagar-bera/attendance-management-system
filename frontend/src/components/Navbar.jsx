import { FiMenu, FiLogOut } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Menu">
          <FiMenu />
        </button>
        <strong>{title}</strong>
      </div>
      <div className="navbar-user">
        <div style={{ textAlign: "right" }} className="text-sm">
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div className="text-muted" style={{ fontSize: 12, textTransform: "capitalize" }}>
            {user?.role}
          </div>
        </div>
        <div className="avatar">{initials}</div>
        <button className="btn btn-outline btn-sm" onClick={logout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
