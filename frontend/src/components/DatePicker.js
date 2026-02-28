import { useState } from "react";
import { getAvailability } from "../services/appointmentService";

export default function DatePicker({ counselorId }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setDate(date);
    const res = await getAvailability(counselorId, date);
    setSlots(res.data);
  };

  return (
    <div>
      <input type="date" onChange={handleDateChange} />
      <div>
        {slots.map((slot) => (
          <button
            key={slot.start_time}
            onClick={() => setSelectedSlot(slot)}
            className={selectedSlot === slot ? "selected" : ""}
          >
            {slot.start_time} - {slot.end_time}
          </button>
        ))}
      </div>
    </div>
  );
}
