// components/ConnectZoomButton.jsx

import API from "../services/api";
const ConnectZoomButton = () => {
  const backendURL = process.env.REACT_APP_API_URL ;
  const handleConnect = () => {
    window.location.href = `${backendURL}/zoom/authorize`;
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Connect Zoom
    </button>
  );
};

export default ConnectZoomButton;
