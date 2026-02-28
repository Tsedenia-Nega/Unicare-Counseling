import { bookAppointment } from "../services/AppointmentService";

export default function Confirmation({ appointment }) {
  const handleConfirm = async () => {
    try {
      await bookAppointment(appointment);
      alert("Appointment booked!");
    } catch (error) {
      alert("Booking failed: " + error.message);
    }
  };

  return (
    <div>
      <h2>Confirm Appointment</h2>
      <p>Date: {appointment.date}</p>
      <p>
        Time: {appointment.start_time} - {appointment.end_time}
      </p>
      <p>Counselor: {appointment.counselor.name}</p>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}
