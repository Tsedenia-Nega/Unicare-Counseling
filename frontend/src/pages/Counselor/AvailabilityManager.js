// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const AvailabilityManager = () => {
//   const [date, setDate] = useState("");
//   const [weekday, setWeekday] = useState("");
//   const [startHourMin, setStartHourMin] = useState(""); // "HH:MM"
//   const [startMeridiem, setStartMeridiem] = useState("AM");
//   const [endHourMin, setEndHourMin] = useState("");
//   const [endMeridiem, setEndMeridiem] = useState("AM");
//   const [type, setType] = useState("in-person");
//   const [slots, setSlots] = useState([]);
//   const [availabilities, setAvailabilities] = useState([]);
//   const [error, setError] = useState("");
  

//   const [counselorId, setCounselorId] = useState(null);
//   const token = localStorage.getItem("token");
//   const headers = { Authorization: `Bearer ${token}` };

//   // Update weekday when date changes
//   useEffect(() => {
//     if (date) {
//       const day = new Date(date).toLocaleDateString("en-US", {
//         weekday: "long",
//       });
//       setWeekday(day);
//     } else {
//       setWeekday("");
//     }
//   }, [date]);

//   // Fetch availabilities for the counselor
//   // const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchCounselorId = async () => {
//       try {
//         const token = localStorage.getItem("token"); // get token here
//         if (!token) throw new Error("No token found");

//         const res = await axios.get("http://localhost:4000/api/counselors/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const id = res.data.counselorId;
//         setCounselorId(id);
//       } catch (err) {
//         console.error("Error fetching counselor ID:", err);
//       }
//     };

//     fetchCounselorId();
//   }, []);

//   const fetchAvailabilities = async () => {
//     try {
//       const token = localStorage.getItem("token"); // get token here too
//       if (!token) throw new Error("No token found");

//       const res = await axios.get(
//         `http://localhost:4000/api/availability/${counselorId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setAvailabilities(res.data.availability || []);
//     } catch (err) {
//       console.error("Error fetching availabilities:", err);
//       setError("Failed to load availabilities.");
//     }
//   };

//   useEffect(() => {
//     if (counselorId) {
//       fetchAvailabilities();
//     }
//   }, [counselorId]);
  

//   // Regex to validate HH:MM format (24-hour or 12-hour without meridiem)
//   const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

//   const validateTime = (time) => timePattern.test(time.trim());

//   // Convert 12-hour format to 24-hour format
//   const convertTo24HourFormat = (time, meridiem) => {
//     let [hours, minutes] = time.split(":").map(Number);
//     if (meridiem === "PM" && hours < 12) hours += 12;
//     if (meridiem === "AM" && hours === 12) hours = 0;
//     return `${hours.toString().padStart(2, "0")}:${minutes
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const handleAddSlot = () => {
//     if (!startHourMin || !endHourMin) {
//       setError("Please enter both start time and end time.");
//       return;
//     }
//     if (!validateTime(startHourMin) || !validateTime(endHourMin)) {
//       setError("Time must be in HH:MM format (e.g. 09:30).");
//       return;
//     }

//     const startTime24 = convertTo24HourFormat(startHourMin, startMeridiem);
//     const endTime24 = convertTo24HourFormat(endHourMin, endMeridiem);

//     const [startHours, startMinutes] = startTime24.split(":").map(Number);
//     const [endHours, endMinutes] = endTime24.split(":").map(Number);

//     if (
//       startHours > endHours ||
//       (startHours === endHours && startMinutes >= endMinutes)
//     ) {
//       setError("Start time must be before end time.");
//       return;
//     }

//     setError("");
//     const slot = {
//       start_time: `${startHourMin} ${startMeridiem}`,
//       end_time: `${endHourMin} ${endMeridiem}`,
//       start_time_24: startTime24,
//       end_time_24: endTime24,
//       type,
//     };

//     setSlots((prevSlots) => [...prevSlots, slot]);

//     // Reset inputs
//     setStartHourMin("");
//     setStartMeridiem("AM");
//     setEndHourMin("");
//     setEndMeridiem("AM");
//   };

//   const handleRemoveSlot = (index) => {
//     setSlots((prevSlots) => prevSlots.filter((_, i) => i !== index));
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();

//     if (!date) {
//       setError("Please select a date.");
//       return;
//     }
//     if (slots.length === 0) {
//       setError("Please add at least one time slot.");
//       return;
//     }
//     const selectedDate = new Date(date);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (selectedDate < today) {
//       setError("Selected date is in the past.");
//       return;
//     }

//     setError("");

//     try {
//       // Create each slot as a separate availability
//       for (const slot of slots) {
//         await axios.post(
//           "http://localhost:4000/api/availability/create",
//           {
            
//             type: slot.type,
//             date,
//             start_time: slot.start_time,
//             end_time: slot.end_time,
//           },
//           { headers }
//         );
//       }

//       // Reset form after successful creation
//       setDate("");
//       setSlots([]);
//       setType("in-person");
//       fetchAvailabilities();
//       alert("Availability created successfully!");
//     } catch (err) {
//       console.error("Failed to create availability:", err);
//       setError(
//         err.response?.data?.message || "Creation failed. Please try again."
//       );
//     }
//   };
 

//   const handleDeleteAvailability = async (id) => {
//     if (window.confirm("Are you sure you want to delete this availability?")) {
//       try {
//         await axios.delete(`/api/availability/${id}`, { headers });
//         fetchAvailabilities();
//         alert("Availability deleted successfully!");
//       } catch (err) {
//         console.error("Failed to delete availability:", err);
//         setError(
//           err.response?.data?.message || "Deletion failed. Please try again."
//         );
//       }
//     }
//   };
  
      
  

//   return (
//     <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-8">
//       <h2 className="text-3xl font-bold text-center text-gray-800">
//         Availability Manager
//       </h2>

//       <form onSubmit={handleCreate} className="space-y-6" noValidate>
//         {/* Date & Weekday */}
//         <div className="flex items-center gap-4">
//           <label
//             htmlFor="date"
//             className="font-semibold text-gray-700 min-w-[70px]"
//           >
//             Date:
//           </label>
//           <input
//             id="date"
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="border border-gray-300 rounded px-3 py-2 flex-grow"
//             required
//             aria-describedby="weekdayDisplay"
//             min={new Date().toISOString().split("T")[0]}
//           />
//           <div
//             id="weekdayDisplay"
//             className="min-w-[100px] text-center text-gray-600 font-medium"
//             aria-live="polite"
//           >
//             {weekday || "--"}
//           </div>
//         </div>

//         {/* Start Time */}
//         <div className="flex flex-col sm:flex-row gap-4 items-center">
//           <div className="flex flex-col w-full sm:w-1/2">
//             <label
//               htmlFor="startTime"
//               className="font-semibold text-gray-700 mb-1"
//             >
//               Start Time (HH:MM)
//             </label>
//             <input
//               id="startTime"
//               type="text"
//               placeholder="09:00"
//               value={startHourMin}
//               onChange={(e) => setStartHourMin(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2"
//               pattern="[0-9]{1,2}:[0-9]{2}"
//               aria-describedby="startTimeHelp"
//               required
//             />
//             <small id="startTimeHelp" className="text-gray-500 text-xs">
//               Format: HH:MM (e.g. 09:00)
//             </small>
//           </div>
//           <div className="flex flex-col w-24">
//             <label
//               htmlFor="startMeridiem"
//               className="font-semibold text-gray-700 mb-1"
//             >
//               AM/PM
//             </label>
//             <select
//               id="startMeridiem"
//               value={startMeridiem}
//               onChange={(e) => setStartMeridiem(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2"
//             >
//               <option>AM</option>
//               <option>PM</option>
//             </select>
//           </div>
//         </div>

//         {/* End Time */}
//         <div className="flex flex-col sm:flex-row gap-4 items-center">
//           <div className="flex flex-col w-full sm:w-1/2">
//             <label
//               htmlFor="endTime"
//               className="font-semibold text-gray-700 mb-1"
//             >
//               End Time (HH:MM)
//             </label>
//             <input
//               id="endTime"
//               type="text"
//               placeholder="10:00"
//               value={endHourMin}
//               onChange={(e) => setEndHourMin(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2"
//               pattern="[0-9]{1,2}:[0-9]{2}"
//               aria-describedby="endTimeHelp"
//               required
//             />
//             <small id="endTimeHelp" className="text-gray-500 text-xs">
//               Format: HH:MM (e.g. 10:00)
//             </small>
//           </div>
//           <div className="flex flex-col w-24">
//             <label
//               htmlFor="endMeridiem"
//               className="font-semibold text-gray-700 mb-1"
//             >
//               AM/PM
//             </label>
//             <select
//               id="endMeridiem"
//               value={endMeridiem}
//               onChange={(e) => setEndMeridiem(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2"
//             >
//               <option>AM</option>
//               <option>PM</option>
//             </select>
//           </div>
//         </div>

//         {/* Availability Type */}
//         <div className="flex items-center gap-4">
//           <label
//             htmlFor="type"
//             className="font-semibold text-gray-700 min-w-[110px]"
//           >
//             Availability Type:
//           </label>
//           <select
//             id="type"
//             value={type}
//             onChange={(e) => setType(e.target.value)}
//             className="border border-gray-300 rounded px-3 py-2 flex-grow"
//           >
//             <option value="in-person">In-person</option>
//             <option value="virtual">Virtual</option>
//           </select>
//         </div>

//         {/* Add Slot Button */}
//         <div className="text-right">
//           <button
//             type="button"
//             onClick={handleAddSlot}
//             className="bg-green-900 hover:bg-green-800 text-white px-5 py-2 rounded transition-colors disabled:opacity-50"
//             aria-disabled={false}
//           >
//             Add Slot
//           </button>
//         </div>

//         {/* Slots Preview */}
//         {slots.length > 0 && (
//           <div className="space-y-2">
//             <h3 className="text-lg font-semibold text-gray-700">Added Slots</h3>
//             <ul className="flex flex-wrap gap-2">
//               {slots.map((slot, i) => (
//                 <li
//                   key={`slot-${i}`}
//                   className="flex items-center bg-gray-200 rounded-full px-4 py-1 text-sm"
//                 >
//                   <span>
//                     {slot.start_time} to {slot.end_time} ({slot.type})
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveSlot(i)}
//                     className="ml-3 text-red-600 font-bold hover:text-red-800"
//                     aria-label={`Remove slot ${slot.start_time} to ${slot.end_time}`}
//                   >
//                     &times;
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {error && <p className="text-red-600 font-semibold">{error}</p>}

//         {/* Submit */}
//         <div className="text-center">
//           <button
//             type="submit"
//             className="bg-green-800 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded transition-colors"
//           >
//             Create Availability
//           </button>
//         </div>
//       </form>

//       {/* Display existing availabilities */}
//       <section>
//         <h3 className="text-2xl font-bold mb-4 text-gray-700">
//           Current Availabilities
//         </h3>
//         {availabilities.length === 0 ? (
//           <p className="text-gray-500">No availabilities found.</p>
//         ) : (
//           <ul className="space-y-4">
//             {availabilities.map((availability) => (
//               <li
//                 key={availability._id}
//                 className="p-4 border border-gray-300 rounded shadow-sm bg-gray-50"
//               >
//                 <div className="flex justify-between items-center mb-2">
//                   <div>
//                     <span className="font-semibold">
//                       {availability.weekday}
//                     </span>{" "}
//                     - <span>{availability.date}</span>
//                   </div>

//                   <button
//                     onClick={() => handleDeleteAvailability(availability._id)}
//                     className="text-red-600 hover:text-red-800 font-semibold"
//                     disabled={availability.status === "booked"}
//                     title={
//                       availability.status === "booked"
//                         ? "Cannot delete booked slots"
//                         : "Delete availability"
//                     }
//                   >
//                     {availability.status !== "booked" && "Delete"}
//                   </button>
//                 </div>
//                 <div className="text-gray-700">
//                   {availability.start_time} - {availability.end_time} (
//                   {availability.type})
//                   {availability.isToday && (
//                     <span className="ml-2 text-green-600">• Today</span>
//                   )}
//                   {availability.expired && (
//                     <span className="ml-2 text-red-600">• Expired</span>
//                   )}
//                   {availability.status === "booked" && (
//                     <span className="ml-2 text-blue-600">• Booked</span>
//                   )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>
//     </div>
//   );
// };

// export default AvailabilityManager;



import { useEffect, useState } from "react";
import axios from "axios";

const AvailabilityManager = () => {
  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [startHourMin, setStartHourMin] = useState(""); // "HH:MM"
  const [startMeridiem, setStartMeridiem] = useState("AM");
  const [endHourMin, setEndHourMin] = useState("");
  const [endMeridiem, setEndMeridiem] = useState("AM");
  const [type, setType] = useState("in-person");
  const [slots, setSlots] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [counselorId, setCounselorId] = useState(null);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Update weekday when date changes
  useEffect(() => {
    if (date) {
      const day = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      setWeekday(day);
    } else {
      setWeekday("");
    }
  }, [date]);

  // Fetch availabilities for the counselor
  useEffect(() => {
    const fetchCounselorId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get("http://localhost:4000/api/counselors/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = res.data.counselorId;
        setCounselorId(id);
      } catch (err) {
        console.error("Error fetching counselor ID:", err);
      }
    };

    fetchCounselorId();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await axios.get(
        `http://localhost:4000/api/availability/${counselorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailabilities(res.data.availability || []);
    } catch (err) {
      console.error("Error fetching availabilities:", err);
      setError("Failed to load availabilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (counselorId) {
      fetchAvailabilities();
    }
  }, [counselorId]);

  // Regex to validate HH:MM format (24-hour or 12-hour without meridiem)
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  const validateTime = (time) => timePattern.test(time.trim());

  // Convert 12-hour format to 24-hour format
  const convertTo24HourFormat = (time, meridiem) => {
    let [hours, minutes] = time.split(":").map(Number);
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if a slot would be a duplicate - always check for overlaps
  const isDuplicateSlot = (
    newDate,
    newStartTime,
    newEndTime,
    newStartMeridiem,
    newEndMeridiem
  ) => {
    return availabilities.some((avail) => {
      // Skip the current availability being edited
      if (isEditing && avail._id === editingId) return false;

      // Check if date matches
      if (avail.date !== newDate) return false;

      // Parse times for comparison
      const availStartParts = avail.start_time.split(" ");
      const availEndParts = avail.end_time.split(" ");

      let availStart, availEnd;

      if (availStartParts.length === 2) {
        // Format is "HH:MM AM/PM"
        availStart = convertTo24HourFormat(
          availStartParts[0],
          availStartParts[1]
        );
      } else {
        // Already in 24-hour format
        availStart = avail.start_time;
      }

      if (availEndParts.length === 2) {
        // Format is "HH:MM AM/PM"
        availEnd = convertTo24HourFormat(availEndParts[0], availEndParts[1]);
      } else {
        // Already in 24-hour format
        availEnd = avail.end_time;
      }

      // Convert new times to 24-hour format for comparison
      const newStart = convertTo24HourFormat(newStartTime, newStartMeridiem);
      const newEnd = convertTo24HourFormat(newEndTime, newEndMeridiem);

      // Check for overlap
      return (
        (newStart >= availStart && newStart < availEnd) || // New start time is within existing slot
        (newEnd > availStart && newEnd <= availEnd) || // New end time is within existing slot
        (newStart <= availStart && newEnd >= availEnd) // New slot completely contains existing slot
      );
    });
  };

  const handleAddSlot = () => {
    if (!startHourMin || !endHourMin) {
      setError("Please enter both start time and end time.");
      return;
    }
    if (!validateTime(startHourMin) || !validateTime(endHourMin)) {
      setError("Time must be in HH:MM format (e.g. 09:30).");
      return;
    }

    const startTime24 = convertTo24HourFormat(startHourMin, startMeridiem);
    const endTime24 = convertTo24HourFormat(endHourMin, endMeridiem);

    const [startHours, startMinutes] = startTime24.split(":").map(Number);
    const [endHours, endMinutes] = endTime24.split(":").map(Number);

    if (
      startHours > endHours ||
      (startHours === endHours && startMinutes >= endMinutes)
    ) {
      setError("Start time must be before end time.");
      return;
    }

    // Always check for duplicate slots
    if (
      isDuplicateSlot(
        date,
        startHourMin,
        endHourMin,
        startMeridiem,
        endMeridiem
      )
    ) {
      setError("This time slot overlaps with an existing availability.");
      return;
    }

    setError("");
    const slot = {
      start_time: `${startHourMin} ${startMeridiem}`,
      end_time: `${endHourMin} ${endMeridiem}`,
      start_time_24: startTime24,
      end_time_24: endTime24,
      type,
    };

    setSlots((prevSlots) => [...prevSlots, slot]);

    // Reset inputs
    setStartHourMin("");
    setStartMeridiem("AM");
    setEndHourMin("");
    setEndMeridiem("AM");
  };

  const handleRemoveSlot = (index) => {
    setSlots((prevSlots) => prevSlots.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (slots.length === 0) {
      setError("Please add at least one time slot.");
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Selected date is in the past.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create each slot as a separate availability
      for (const slot of slots) {
        await axios.post(
          "http://localhost:4000/api/availability/create",
          {
            type: slot.type,
            date,
            start_time: slot.start_time,
            end_time: slot.end_time,
          },
          { headers }
        );
      }

      // Reset form after successful creation
      setDate("");
      setSlots([]);
      setType("in-person");
      fetchAvailabilities();
      alert("Availability created successfully!");
    } catch (err) {
      console.error("Failed to create availability:", err);
      setError(
        err.response?.data?.message || "Creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (window.confirm("Are you sure you want to delete this availability?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:4000/api/availability/${id}`, {
          headers,
        });
        fetchAvailabilities();
        alert("Availability deleted successfully!");
      } catch (err) {
        console.error("Failed to delete availability:", err);
        setError(
          err.response?.data?.message || "Deletion failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditAvailability = (availability) => {
    // Set form to editing mode
    setIsEditing(true);
    setEditingId(availability._id);

    // Parse the date from the availability
    setDate(availability.date);

    console.log("Editing availability:", availability);

    // Parse the start time - handle both "HH:MM AM/PM" and 24-hour formats
    const startTimeParts = availability.start_time.split(" ");
    if (startTimeParts.length === 2) {
      // Format is "HH:MM AM/PM"
      setStartHourMin(startTimeParts[0]);
      setStartMeridiem(startTimeParts[1]);
    } else {
      // Assume 24-hour format
      const hour = Number.parseInt(availability.start_time.split(":")[0]);
      const minute = availability.start_time.split(":")[1];
      const meridiem = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      setStartHourMin(`${hour12}:${minute}`);
      setStartMeridiem(meridiem);
    }

    // Parse the end time - handle both "HH:MM AM/PM" and 24-hour formats
    const endTimeParts = availability.end_time.split(" ");
    if (endTimeParts.length === 2) {
      // Format is "HH:MM AM/PM"
      setEndHourMin(endTimeParts[0]);
      setEndMeridiem(endTimeParts[1]);
    } else {
      // Assume 24-hour format
      const hour = Number.parseInt(availability.end_time.split(":")[0]);
      const minute = availability.end_time.split(":")[1];
      const meridiem = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      setEndHourMin(`${hour12}:${minute}`);
      setEndMeridiem(meridiem);
    }

    // Set the type
    setType(availability.type);

    // Clear existing slots
    setSlots([]);

    // Scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update function that doesn't allow date changes
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!startHourMin || !endHourMin) {
      setError("Please enter both start time and end time.");
      return;
    }
    if (!validateTime(startHourMin) || !validateTime(endHourMin)) {
      setError("Time must be in HH:MM format (e.g. 09:30).");
      return;
    }

    const startTime24 = convertTo24HourFormat(startHourMin, startMeridiem);
    const endTime24 = convertTo24HourFormat(endHourMin, endMeridiem);

    const [startHours, startMinutes] = startTime24.split(":").map(Number);
    const [endHours, endMinutes] = endTime24.split(":").map(Number);

    if (
      startHours > endHours ||
      (startHours === endHours && startMinutes >= endMinutes)
    ) {
      setError("Start time must be before end time.");
      return;
    }

    // Check for overlaps with other availabilities on the same date
    if (
      isDuplicateSlot(
        date,
        startHourMin,
        endHourMin,
        startMeridiem,
        endMeridiem
      )
    ) {
      setError("This time slot overlaps with an existing availability.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Update the existing availability
      const response = await axios({
        method: "put",
        url: `http://localhost:4000/api/availability/${editingId}`,
        headers,
        data: {
          type,
          start_time: `${startHourMin} ${startMeridiem}`,
          end_time: `${endHourMin} ${endMeridiem}`,
        },
      });

      console.log("Update response:", response.data);

      // Reset form after successful update
      setDate("");
      setStartHourMin("");
      setStartMeridiem("AM");
      setEndHourMin("");
      setEndMeridiem("AM");
      setType("in-person");
      setIsEditing(false);
      setEditingId(null);
      fetchAvailabilities();
      alert("Availability updated successfully!");
    } catch (err) {
      console.error("Failed to update availability:", err);
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        });
        setError(
          err.response.data?.message || `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("No response received from server");
      } else {
        console.error("Error setting up request:", err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Availability Manager
      </h2>

      <form
        onSubmit={isEditing ? handleUpdate : handleCreate}
        className="space-y-6"
        noValidate
      >
        {/* Date & Weekday */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="date"
            className="font-semibold text-gray-700 min-w-[70px]"
          >
            Date:
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`border border-gray-300 rounded px-3 py-2 flex-grow ${
              isEditing ? "bg-gray-100" : ""
            }`}
            required
            aria-describedby="weekdayDisplay"
            // Fix for red/disabled future dates - ensure min date is today or earlier
            min={
              new Date(new Date().setHours(0, 0, 0, 0))
                .toISOString()
                .split("T")[0]
            }
            // Disable date field when editing
            disabled={isEditing}
          />
          {/* <div
            id="weekdayDisplay"
            className="min-w-[100px] text-center text-gray-600 font-medium"
            aria-live="polite"
          >
            {weekday || "--"}
          </div> */}
        </div>

        {/* Start Time */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col w-full sm:w-1/2">
            <label
              htmlFor="startTime"
              className="font-semibold text-gray-700 mb-1"
            >
              Start Time (HH:MM)
            </label>
            <input
              id="startTime"
              type="text"
              placeholder="09:00"
              value={startHourMin}
              onChange={(e) => setStartHourMin(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
              pattern="[0-9]{1,2}:[0-9]{2}"
              aria-describedby="startTimeHelp"
              required
            />
            <small id="startTimeHelp" className="text-gray-500 text-xs">
              Format: HH:MM (e.g. 09:00)
            </small>
          </div>
          <div className="flex flex-col w-24">
            <label
              htmlFor="startMeridiem"
              className="font-semibold text-gray-700 mb-1"
            >
              AM/PM
            </label>
            <select
              id="startMeridiem"
              value={startMeridiem}
              onChange={(e) => setStartMeridiem(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* End Time */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col w-full sm:w-1/2">
            <label
              htmlFor="endTime"
              className="font-semibold text-gray-700 mb-1"
            >
              End Time (HH:MM)
            </label>
            <input
              id="endTime"
              type="text"
              placeholder="10:00"
              value={endHourMin}
              onChange={(e) => setEndHourMin(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
              pattern="[0-9]{1,2}:[0-9]{2}"
              aria-describedby="endTimeHelp"
              required
            />
            <small id="endTimeHelp" className="text-gray-500 text-xs">
              Format: HH:MM (e.g. 10:00)
            </small>
          </div>
          <div className="flex flex-col w-24">
            <label
              htmlFor="endMeridiem"
              className="font-semibold text-gray-700 mb-1"
            >
              AM/PM
            </label>
            <select
              id="endMeridiem"
              value={endMeridiem}
              onChange={(e) => setEndMeridiem(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        {/* Availability Type */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="type"
            className="font-semibold text-gray-700 min-w-[110px]"
          >
            Availability Type:
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-grow"
          >
            <option value="in-person">In-person</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>

        {/* Add Slot Button */}
        {!isEditing && (
          <div className="text-right">
            <button
              type="button"
              onClick={handleAddSlot}
              className="bg-green-900 hover:bg-green-800 text-white px-5 py-2 rounded transition-colors disabled:opacity-50"
              aria-disabled={loading}
              disabled={loading}
            >
              Add Slot
            </button>
          </div>
        )}

        {/* Slots Preview */}
        {!isEditing && slots.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Added Slots</h3>
            <ul className="flex flex-wrap gap-2">
              {slots.map((slot, i) => (
                <li
                  key={`slot-${i}`}
                  className="flex items-center bg-gray-200 rounded-full px-4 py-1 text-sm"
                >
                  <span>
                    {slot.start_time} to {slot.end_time} ({slot.type})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(i)}
                    className="ml-3 text-red-600 font-bold hover:text-red-800"
                    aria-label={`Remove slot ${slot.start_time} to ${slot.end_time}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {/* Submit */}
        <div className="text-center flex justify-center gap-4">
          <button
            type="submit"
            className="bg-green-800 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isEditing
              ? "Update Availability"
              : "Create Availability"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setDate("");
                setStartHourMin("");
                setStartMeridiem("AM");
                setEndHourMin("");
                setEndMeridiem("AM");
                setType("in-person");
                setSlots([]);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Display existing availabilities */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-700">
          Current Availabilities
        </h3>
        {loading && <p className="text-gray-600">Loading availabilities...</p>}
        {!loading && availabilities.length === 0 ? (
          <p className="text-gray-500">No availabilities found.</p>
        ) : (
          <ul className="space-y-4">
            {availabilities.map((availability) => (
              <li
                key={availability._id}
                className="p-4 border border-gray-300 rounded shadow-sm bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold">
                      {availability.weekday}
                    </span>{" "}
                    - <span>{availability.date}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAvailability(availability)}
                      className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={availability.status === "booked" || loading}
                      title={
                        availability.status === "booked"
                          ? "Cannot edit booked slots"
                          : "Edit availability"
                      }
                    >
                      {availability.status !== "booked" && "Edit"}
                    </button>

                    <button
                      onClick={() => handleDeleteAvailability(availability._id)}
                      className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={availability.status === "booked" || loading}
                      title={
                        availability.status === "booked"
                          ? "Cannot delete booked slots"
                          : "Delete availability"
                      }
                    >
                      {availability.status !== "booked" && "Delete"}
                    </button>
                  </div>
                </div>
                <div className="text-gray-700">
                  {availability.start_time} - {availability.end_time} (
                  {availability.type})
                  {availability.isToday && (
                    <span className="ml-2 text-green-600">• Today</span>
                  )}
                  {availability.expired && (
                    <span className="ml-2 text-red-600">• Expired</span>
                  )}
                  {availability.status === "booked" && (
                    <span className="ml-2 text-blue-600">• Booked</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AvailabilityManager;

