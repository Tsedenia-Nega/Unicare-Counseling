export default function BookingConfirmation({ details }) {
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-2 text-green-600">
        Booking Confirmed!
      </h2>
      <p>
        You have an appointment with{" "}
        <strong>
          {details.counselor.user_id.first_name}{" "}
          {details.counselor.user_id.last_name}
        </strong>
        .
      </p>
      <p>
        On <strong>{details.slot.date}</strong> at{" "}
        <strong>{details.slot.start_time}</strong>
      </p>
      {details.slot.weekday && <p>({details.slot.weekday})</p>}
      <p className="mt-4 text-gray-500">
        A confirmation has been sent to your email.
      </p>
    </div>
  );
}
