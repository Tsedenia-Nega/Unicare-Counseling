"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const CounselorZoomConnect = () => {
  const [zoomStatus, setZoomStatus] = useState({
    connected: false,
    loading: true,
    error: null,
  });

  // Check Zoom connection status on component mount
  useEffect(() => {
    checkZoomConnection();
  }, []);

  // Function to check if counselor has connected Zoom
  const checkZoomConnection = async () => {
    try {
      setZoomStatus((prev) => ({ ...prev, loading: true }));
      const response = await axios.get("/api/zoom/connection-status");
      setZoomStatus({
        connected: response.data.connected,
        loading: false,
        error: null,
      });
    } catch (error) {
      setZoomStatus({
        connected: false,
        loading: false,
        error: "Failed to check Zoom connection status",
      });
    }
  };

  // Function to initiate Zoom connection
  const connectZoom = async () => {
    try {
      const response = await axios.get("/api/zoom/auth-url");
      window.location.href = response.data.authUrl;
    } catch (error) {
      setZoomStatus((prev) => ({
        ...prev,
        error: "Failed to generate Zoom authorization URL",
      }));
    }
  };

  // Function to disconnect Zoom
  const disconnectZoom = async () => {
    try {
      setZoomStatus((prev) => ({ ...prev, loading: true }));
      await axios.post("/api/zoom/disconnect");
      setZoomStatus({
        connected: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      setZoomStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to disconnect Zoom account",
      }));
    }
  };

  if (zoomStatus.loading) {
    return (
      <div className="text-center py-4">Loading Zoom connection status...</div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Zoom Integration</h2>

      {zoomStatus.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {zoomStatus.error}
        </div>
      )}

      {zoomStatus.connected ? (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700">
              Your Zoom account is connected
            </span>
          </div>
          <p className="mb-4">
            Virtual appointments will automatically create Zoom meetings and
            send links to both you and your clients.
          </p>
          <button
            onClick={disconnectZoom}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
          >
            Disconnect Zoom Account
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-yellow-700">Zoom account not connected</span>
          </div>
          <p className="mb-4">
            Connect your Zoom account to automatically create meeting links for
            virtual appointments.
          </p>
          <button
            onClick={connectZoom}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Connect Zoom Account
          </button>
        </div>
      )}
    </div>
  );
};

export default CounselorZoomConnect;
