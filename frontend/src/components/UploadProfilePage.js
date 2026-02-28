import React, { useState } from "react";
import API from "../services/api";

const UploadProfilePicture = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
const backendURL = process.env.REACT_APP_API_URL;
  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      setUploading(true);
      const res = await API.put(
        `${backendURL}/updateProfile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      window.location.reload(); // Reload to reflect updated picture
    } catch (error) {
      console.error(
        "Upload failed:",
        error.response?.data?.message || error.message
      );
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-800 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadProfilePicture;
