// src/pages/ZoomCallback.jsx
import React, { useEffect } from "react";
import API from "../services/api";

const ZoomCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Send code to backend to exchange for access token
      API
        .post(`${Backend_URL}/zoom/callback`, { code })
        .then((res) => {
          alert("Zoom connected successfully!");
          // Optionally redirect or save response
        })
        .catch((err) => {
          console.error(err);
          alert("Zoom connection failed");
        });
    } else {
      alert("No authorization code found in URL.");
    }
  }, []);

const Backend_URL = process.env.REACT_APP_API_URL;
  return (
    <div className="p-4">
      <h2 className="text-xl">Connecting Zoom…</h2>
    </div>
  );
};

export default ZoomCallback;
