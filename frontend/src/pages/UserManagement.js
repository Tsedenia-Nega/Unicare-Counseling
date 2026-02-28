import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, ToggleLeft, ToggleRight, Search } from "lucide-react";
import API from "../services/api";
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToToggle, setUserToToggle] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState("");
const Backend_URL = process.env.REACT_APP_API_URL ;
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`${Backend_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentStatus, reason = "") => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`${Backend_URL}/users/${userId}/status`, {
        isActive: !currentStatus,
        reason,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredUsers(users);
  };

  if (loading) return <p className="text-center py-6">Loading users...</p>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-[#3B7962]">
        User Management
      </h2>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3B7962]"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by name, email, or role..."
          className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B7962] focus:border-[#3B7962]"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label="Clear search"
          >
            &#10005;
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3B7962] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">
                  {user.role.replace("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-[#3B7962] hover:text-[#2e5b44]"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (user.isActive) {
                        setUserToToggle(user); // show confirmation
                      } else {
                        toggleStatus(user._id, user.isActive);
                      }
                    }}
                    className="text-[#3B7962] hover:text-[#2e5b44]"
                    title="Toggle Active Status"
                  >
                    {user.isActive ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing user details */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-[#3B7962] mb-4">
              User Details
            </h3>
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              &#10005;
            </button>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedUser.isActive ? "Active" : "Inactive"}
              </p>
              {selectedUser.role === "student" && (
                <>
                  <p>
                    <strong>Department:</strong> {selectedUser.department}
                  </p>
                  <p>
                    <strong>Year:</strong> {selectedUser.year_of_study}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {selectedUser.student_id}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for deactivation confirmation */}
      {userToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-[#3B7962] mb-4">
              Confirm Deactivation
            </h3>
            <p className="text-sm mb-4">
              Are you sure you want to deactivate{" "}
              <strong>
                {userToToggle.first_name} {userToToggle.last_name}
              </strong>
              ?
            </p>

            <label className="block text-sm font-medium mb-1">Reason:</label>
            <textarea
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              rows={3}
              placeholder="Optional reason for deactivation..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3B7962] focus:outline-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setUserToToggle(null);
                  setDeactivationReason("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleStatus(userToToggle._id, true, deactivationReason);
                  setUserToToggle(null);
                  setDeactivationReason("");
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
