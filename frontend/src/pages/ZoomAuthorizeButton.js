import API from "../services/api";


const ZoomAuthorizeButton = () => {
  const handleClick = () => {
    window.location.href = `${Backend_URL}/zoom/authorize`;
  };
  const Backend_URL =
    process.env.REACT_APP_API_URL ;

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Connect Zoom
    </button>
  );
};

export default ZoomAuthorizeButton;
