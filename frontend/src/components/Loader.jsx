const Loader = ({ fullScreen = false }) => (
  <div className={`loader-wrap ${fullScreen ? "fullscreen" : ""}`}>
    <div className="spinner" role="status" aria-label="Loading" />
  </div>
);

export default Loader;
