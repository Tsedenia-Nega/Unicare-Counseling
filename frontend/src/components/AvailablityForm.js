import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AvailabilityForm({ counselor, onBooked }) {
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      const res = await axios.get(
        `/api/availability/counselor/${counselor._id}`
      );
      setAvailabilities(res.data.availabilities);
    };
    fetchAvailability();
  }, [counselor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/appointments/book", {
      counselorId: counselor._id,
      slot: selectedSlot,
      note,
    });
    onBooked({ counselor, slot: selectedSlot });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-semibold">Select Slot</label>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">-- Select --</option>
          {availabilities.map((slot) => (
            <option key={slot._id} value={slot._id}>
              {slot.weekday} - {slot.date} at {slot.start_time}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold">Note (Optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
      >
        Book Appointment
      </button>
    </form>
  );
}
