import React, { useState, useEffect } from "react";
import API from "../services/api";

const ManageResources = () => {
  // State management
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "pdf",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
const backendURL = process.env.REACT_APP_API_URL;
  const baseUrl = `${backendURL}/resources`;
  // Initialize current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchResources();
  }, []);
  

  // Helper functions
  const getAuthHeaders = () => ({
    Authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  });

  const getMessageClass = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Permission check
  const canModifyResource = (resource) => {
  if (!currentUser) return false;

  // Get current user's name from localStorage
  const currentUserName = currentUser.first_name + ' ' + currentUser.last_name;
  
  // Get resource uploader's name
  const uploadedByName = resource.uploadedBy || resource.uploaded_by;

  console.log("Permission Check:", {
    currentUser: currentUserName,
    uploadedBy: uploadedByName,
    isMatch: currentUserName === uploadedByName
  });

  return (
    currentUser.role === "head_counselor" || 
    currentUserName === uploadedByName
  );
};

  // Data fetching
  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl, {
        headers: { ...getAuthHeaders() },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setResources(data.resources);
        setUniqueCategories([
          ...new Set(data.resources.map((r) => r.category)),
        ]);
        setMessage({ text: "", type: "" });
      } else {
        setMessage({
          text: data.message || "Failed to fetch resources",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Network error - please try again later",
        type: "error",
      });
      console.error("Failed to fetch resources", error);
    } finally {
      setLoading(false);
    }
  };

  // Resource filtering
  const filteredResources = resources.filter((res) => {
    const matchCategory =
      !selectedCategory || res.category === selectedCategory;
    const matchSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.category.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Form handling
  const showAddForm = () => {
    setFormData({
      title: "",
      description: "",
      media_type: "pdf",
      category: "",
    });
    setFile(null);
    setIsEditing(false);
    setEditResourceId(null);
    setMessage({ text: "", type: "" });
    setFormVisible(true);
  };

  const showEditForm = (resource) => {
    setFormData({
      title: resource.title,
      description: resource.description,
      media_type: resource.media_type,
      category: resource.category,
    });
    setFile(null);
    setIsEditing(true);
    setEditResourceId(resource._id);
    setMessage({ text: "", type: "" });
    setFormVisible(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isEditing && !file) {
      setMessage({ text: "Please select a file to upload", type: "error" });
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (file) data.append("media", file);

    try {
      const url = isEditing ? `${baseUrl}/${editResourceId}` : `${baseUrl}/add`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeaders() },
        body: data,
        credentials: "include",
      });

      const responseData = await res.json();

      if (responseData.success) {
        setMessage({
          text: isEditing
            ? "Resource updated successfully"
            : "Resource added successfully",
          type: "success",
        });
        setFormVisible(false);
        setFormData({
          title: "",
          description: "",
          media_type: "pdf",
          category: "",
        });
        setFile(null);
        setIsEditing(false);
        setEditResourceId(null);
        fetchResources();
      } else {
        let errorMessage = "Operation failed";
        if (res.status === 403)
          errorMessage = "You don't have permission to perform this action";
        else if (res.status === 400)
          errorMessage = responseData.message || "Invalid data provided";
        else if (res.status === 404) errorMessage = "Resource not found";
        setMessage({ text: errorMessage, type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Network error - please try again later",
        type: "error",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete handling with immediate permission check
  const handleDeleteClick = (resource) => {
    if (!canModifyResource(resource)) {
      setMessage({
        text: "You don't have permission to delete this resource",
        type: "error",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    handleDelete(resource._id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: "Resource deleted successfully", type: "success" });
        fetchResources();
      } else {
        let errorMessage = "Failed to delete resource";
        if (res.status === 403)
          errorMessage = "You don't have permission to delete this resource";
        else if (res.status === 404) errorMessage = "Resource not found";
        setMessage({ text: errorMessage, type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Network error - please try again later",
        type: "error",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Edit handling with immediate permission check
  const handleEditClick = (resource) => {
    console.log("--- EDIT CLICK DEBUG ---");
    console.log("Current User:", currentUser);
    console.log("Resource Being Edited:", resource);
    console.log("Permission Check Result:", canModifyResource(resource));
    if (!canModifyResource(resource)) {
      setMessage({
        text: "You don't have permission to edit this resource",
        type: "error",
      });
      return;
    }
    showEditForm(resource);
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-md ${getMessageClass(
            message.type
          )} flex justify-between items-center`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or category..."
          className="w-full p-3 border rounded shadow-sm focus:outline-[#3B7962]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-sm ${
            selectedCategory === ""
              ? "bg-[#3B7962] text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          All
        </button>
        {uniqueCategories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === cat
                ? "bg-[#3B7962] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Resources</h2>
        <button
          onClick={() => (formVisible ? setFormVisible(false) : showAddForm())}
          className="bg-[#3B7962] hover:bg-[#2e5b44] text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {formVisible ? "Cancel" : "Add Resource"}
        </button>
      </div>

      {/* Resource Form */}
      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          encType="multipart/form-data"
        >
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="p-2 border rounded"
            required
            disabled={loading}
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="p-2 border rounded"
            required
            disabled={loading}
          >
            <option value="">Select Category</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Academic Support">Academic Support</option>
            <option value="Personal Development">Personal Development</option>
            <option value="Career Guidance">Career Guidance</option>
            <option value="Social Skills">Social Skills</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="md:col-span-2 p-2 border rounded"
            required
            disabled={loading}
          />
          <select
            name="media_type"
            value={formData.media_type}
            onChange={handleChange}
            className="p-2 border rounded"
            disabled={loading}
          >
            <option value="pdf">PDF</option>
            {/* <option value="image">Image</option> */}
            <option value="video">Video</option>
            
          </select>
          <input
            type="file"
            accept=".pdf,.jpeg,.jpg,.png,.mp4"
            onChange={handleFileChange}
            className="p-2 border rounded"
            required={!isEditing}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#3B7962] hover:bg-[#2e5b44] text-white px-4 py-2 rounded md:col-span-2"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isEditing
              ? "Update Resource"
              : "Add Resource"}
          </button>
        </form>
      )}

      {/* Resources List */}
      {loading && !formVisible ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B7962]"></div>
          <p className="mt-2">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No resources found for the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res._id}
              className="border p-4 rounded shadow bg-white relative"
            >
              <h3 className="text-lg font-semibold mb-2">{res.title}</h3>
              <p className="text-sm mb-2">{res.description}</p>
              <p className="text-xs font-semibold mb-2 text-[#3B7962]">
                Category: {res.category}
              </p>
              <p className="text-xs mb-4">Media Type: {res.media_type}</p>
              <p className="text-xs mb-2 flex justify-between items-center">
                <span>Uploaded By: {res.uploadedBy || "Unknown"}</span>
                <a
                  href={res.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#4CAF50] hover:bg-[#3b8e41] text-white px-2 py-1 rounded text-xs"
                >
                  View
                </a>
              </p>

              {/* Conditionally render edit/delete buttons */}
              {canModifyResource(res) && (
                <div className="flex gap-2 absolute top-4 right-4">
                  <button
                    onClick={() =>{ console.log("🖱️ Button onClick triggered");
                      handleEditClick(res)}}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(res)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageResources;
