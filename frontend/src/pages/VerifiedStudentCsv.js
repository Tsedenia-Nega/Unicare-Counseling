import React, { useState, useRef } from "react";
import API from "../services/api";
const VerifiedStudentCSVUpload = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
const Backend_URL = process.env.REACT_APP_API_URL ;
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMessage(null);
    if (file) {
      console.log("File type:", file.type);
      console.log("File name:", file.name);
    }
    
    if (
      (file && file.type === "text/csv") ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".csv")
    ) {
      setCsvFile(file);
    } else {
      setCsvFile(null);
      setMessage("Please select a valid CSV file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage("No file selected.");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await API.post(`${Backend_URL}/head-counselor/upload-verified-students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(` Success! ${data.insertedCount} students added.`);
        setCsvFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        setMessage(` ${data.message || "Upload failed."}`);
      }
    } catch (error) {
      setMessage(" Upload error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-[#3B7962]">
        Upload Verified Students CSV
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full mb-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-[#3B7962] file:text-white hover:file:bg-[#2f6049]"
        />
        <button
          type="submit"
          disabled={!csvFile || uploading}
          className="bg-[#3B7962] text-white px-6 py-2 rounded hover:bg-[#2f6049] disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-3 text-center ${
            message.startsWith("") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default VerifiedStudentCSVUpload;
