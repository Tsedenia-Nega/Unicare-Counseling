import { useState, useEffect } from "react";
import API from "../services/api";

const ManageAvailability = () => {
  const [availabilityList, setAvailabilityList] = useState([]);
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState({ time: "", period: "AM" });
  const [endTime, setEndTime] = useState({ time: "", period: "AM" });
  const [date, setDate] = useState("");
  const token = localStorage.getItem("token");
const Backend_URL = process.env.REACT_APP_API_URL ;
  // Fetch availability data
  const fetchAvailability = async () => {
    try {
      const res = await API.get(`${Backend_URL}/availability/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailabilityList(res.data.availability);
    } catch (error) {
      setMessage("Error fetching availability.");
    }
  };

  // Handle create availability
  const handleCreateAvailability = async () => {
    if (!date || !startTime.time || !endTime.time) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const fullStartTime = `${startTime.time} ${startTime.period}`;
      const fullEndTime = `${endTime.time} ${endTime.period}`;

      await API.post(`${Backend_URL}/availability/create`, {
        date,
        start_time: fullStartTime,
        end_time: fullEndTime,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Availability created successfully.");
      setStartTime({ time: "", period: "AM" });
      setEndTime({ time: "", period: "AM" });
      setDate("");
      fetchAvailability(); // Re-fetch the availability after creation
    } catch (error) {
      setMessage("Failed to create availability.");
    }
  };

  // Handle update availability
  const handleUpdate = async (id, updatedData) => {
    try {
      await API.put(
        `${Backend_URL}/availability/update/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Availability updated successfully.");
      fetchAvailability(); // Re-fetch the availability after update
    } catch (error) {
      setMessage("Failed to update availability.");
    }
  };

  // Handle delete availability
  const handleDelete = async (id) => {
    try {
      await API.delete(
        `${Backend_URL}/availability/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Availability deleted successfully.");
      fetchAvailability(); // Re-fetch the availability after delete
    } catch (error) {
      setMessage("Failed to delete availability.");
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Manage Availability
      </h2>

      {message && (
        <div className="mb-4 text-center text-sm text-blue-600 font-medium">
          {message}
        </div>
      )}

      {/* Add Availability Form */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">
          Add New Availability
        </h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600" htmlFor="start_time">
                Start Time
              </label>
              <div className="flex space-x-4">
                <select
                  value={startTime.time}
                  onChange={(e) =>
                    setStartTime({ ...startTime, time: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Time</option>
                  {[...Array(12)].map((_, index) => {
                    const hour = index + 1;
                    return (
                      <option key={hour} value={hour}>
                        {hour < 10 ? `0${hour}` : hour}:00
                      </option>
                    );
                  })}
                </select>
                <select
                  value={startTime.period}
                  onChange={(e) =>
                    setStartTime({ ...startTime, period: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-600" htmlFor="end_time">
                End Time
              </label>
              <div className="flex space-x-4">
                <select
                  value={endTime.time}
                  onChange={(e) =>
                    setEndTime({ ...endTime, time: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Time</option>
                  {[...Array(12)].map((_, index) => {
                    const hour = index + 1;
                    return (
                      <option key={hour} value={hour}>
                        {hour < 10 ? `0${hour}` : hour}:00
                      </option>
                    );
                  })}
                </select>
                <select
                  value={endTime.period}
                  onChange={(e) =>
                    setEndTime({ ...endTime, period: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleCreateAvailability}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg"
              >
                Add Availability
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Availability List */}
      <div className="space-y-3">
        {availabilityList.length > 0 ? (
          availabilityList.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {item.weekday}, {new Date(item.date).toLocaleDateString()} —{" "}
                  {item.start_time} to {item.end_time}
                </p>
              </div>
              <div>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() =>
                    handleUpdate(item._id, {
                      start_time: "09:00 AM",
                      end_time: "05:00 PM",
                    })
                  } // Example update data
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800 ml-4"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No availability added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageAvailability;
