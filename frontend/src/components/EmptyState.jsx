import { FiInbox } from "react-icons/fi";

const EmptyState = ({ title, message = "There is nothing to show here yet.", icon: Icon = FiInbox }) => {
  return (
    <div className="empty-state">
      <Icon />
      {title && <h3 style={{ margin: "0 0 4px" }}>{title}</h3>}
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
};

export default EmptyState;
