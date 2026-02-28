
import Appointment from "../models/appointmentModel.js";
import Availability from "../models/availabilityModel.js";
import User from "../models/userModel.js";
import Counselor from "../models/counselorModel.js";
import { sendAppointmentNotification } from "../services/emailService.js";
import {
  generateZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
} from "../services/zoomService.js";
import { convertTo24HourFormat } from "../utils/timeUtils.js";

// Helper function to check time constraints
import { parse, differenceInHours } from "date-fns";

const canModifyAppointment = (appointmentDate, startTime) => {
  let year, month, day;

  if (typeof appointmentDate === "string") {
    // Parse from string like '2025-06-06'
    [year, month, day] = appointmentDate.split("-").map(Number);
  } else if (appointmentDate instanceof Date) {
    // Extract parts from Date object
    year = appointmentDate.getFullYear();
    month = appointmentDate.getMonth() + 1; // zero-based month
    day = appointmentDate.getDate();
  } else {
    throw new Error("Invalid appointmentDate format");
  }

  const [hour, minute] = startTime.split(":").map(Number);

  // Create a local Date object for the appointment datetime
  const appointmentDateTime = new Date(year, month - 1, day, hour, minute);

  const now = new Date();

  const hoursLeft = (appointmentDateTime - now) / (1000 * 60 * 60);

  return hoursLeft >=24;
};



export const bookAppointment = async (req, res) => {
  try {
    const { counselorId, date, start_time, end_time, type, notes } = req.body;
    const studentId = req.user._id;

    // Convert times to 24-hour format and validate
    const startTime = start_time.trim();
    const endTime = end_time.trim();

    // ✅ Create Date object in LOCAL time
    const createValidDate = (dateStr, timeStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hour, minute] = timeStr.split(":").map(Number);
      return new Date(year, month - 1, day, hour, minute);
    };

    const startDateTime = createValidDate(date, startTime);
    const endDateTime = createValidDate(date, endTime);

    // Validate Date objects
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: `Invalid start time: ${startTime}`,
      });
    }

    if (isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: `Invalid end time: ${endTime}`,
      });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate availability
    const availability = await Availability.findOne({
      counselor_id: counselorId,
      date,
      start_time: startTime,
      end_time: endTime,
      status: "available",
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "The selected time slot is no longer available",
      });
    }

    // Create virtual meeting if needed
    let zoomMeeting = null;
    if (type === "virtual") {
      const counselor = await Counselor.findById(counselorId);
      const student = await User.findById(studentId);

      const duration = (endDateTime - startDateTime) / (1000 * 60);

      zoomMeeting = await generateZoomMeeting({
        topic: `Counseling Session with ${counselor.name}`,
        startTime: startDateTime.toISOString(),
        duration: duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        settings: {
          alternative_hosts: counselor.email,
          contact_name: student.name,
          contact_email: student.email,
        },
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      student: studentId,
      counselor: counselorId,
      date,
      start_time: startTime,
      end_time: endTime,
      type,
      virtual_meeting_link: zoomMeeting?.join_url || null,
      zoom_meeting_id: zoomMeeting?.id || null,
      zoom_password: zoomMeeting?.password || null,
      zoom_start_url: zoomMeeting?.start_url || null,
      notes,
      status: "confirmed",
    });

    // Update availability
    availability.status = "booked";
    await availability.save();

    // Send notifications
    await sendAppointmentNotification(appointment, "booked");

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// export const bookAppointment = async (req, res) => {
//   try {
//     const { counselorId, date, start_time, end_time, type, notes } = req.body;
//     const studentId = req.user._id;

//     // Convert times to 24-hour format and validate
//     const startTime = start_time.trim();
//     const endTime = end_time.trim();
//     // const startTime = convertTo24HourFormat(start_time.trim());
//     // const endTime = convertTo24HourFormat(end_time.trim());

//     // Create proper Date objects
//     const createValidDate = (dateStr, timeStr) => {
//       const [hours, minutes] = timeStr.split(":");
//       const dateObj = new Date(dateStr);

//       // Set hours and minutes (UTC)
//       dateObj.setUTCHours(parseInt(hours, 10));
//       dateObj.setUTCMinutes(parseInt(minutes, 10));
//       dateObj.setUTCSeconds(0);
//       dateObj.setUTCMilliseconds(0);

//       return dateObj;
//     };

//     const startDateTime = createValidDate(date, startTime);
//     const endDateTime = createValidDate(date, endTime);

//     // Validate Date objects
//     if (isNaN(startDateTime.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid start time: ${startTime}`,
//       });
//     }

//     if (isNaN(endDateTime.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid end time: ${endTime}`,
//       });
//     }

//     if (endDateTime <= startDateTime) {
//       return res.status(400).json({
//         success: false,
//         message: "End time must be after start time",
//       });
//     }

//     // Validate availability
//     const availability = await Availability.findOne({
//       counselor_id: counselorId,
//       date,
//       start_time: startTime,
//       end_time: endTime,
//       status: "available",
//     });

//     if (!availability) {
//       return res.status(400).json({
//         success: false,
//         message: "The selected time slot is no longer available",
//       });
//     }

//     // Create virtual meeting if needed
//     let zoomMeeting = null;
//     if (type === "virtual") {
//       const counselor = await Counselor.findById(counselorId);
//       const student = await User.findById(studentId);

//       const startTimee = new Date(`${date}T${startTime}`);
//       const endTimee = new Date(`${date}T${endTime}`);
//       const duration = (endTimee - startTimee) / (1000 * 60);

//       // const duration =
//       //   (new Date(`${date}T${end_time}`) - startTime) / (1000 * 60);

//       zoomMeeting = await generateZoomMeeting({
//         topic: `Counseling Session with ${counselor.name}`,
//         startTime: startTimee.toISOString(),
//         duration: duration,
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         settings: {
//           alternative_hosts: counselor.email,
//           contact_name: student.name,
//           contact_email: student.email,
//         },
//       });
//     }

//     // Create appointment
//     const appointment = await Appointment.create({
//       student: studentId,
//       counselor: counselorId,
//       date,
//       start_time: startTime,
//       end_time: endTime,
//       type,
//       virtual_meeting_link: zoomMeeting?.join_url || null,
//       zoom_meeting_id: zoomMeeting?.id || null,
//       zoom_password: zoomMeeting?.password || null,
//       zoom_start_url: zoomMeeting?.start_url || null,
//       notes,
//       status: "confirmed",
//     });

//     // Update availability
//     availability.status = "booked";
//     await availability.save();

//     // Send notifications
//     await sendAppointmentNotification(appointment, "booked");

//     res.status(201).json({
//       success: true,
//       data: appointment,
//       message: "Appointment booked successfully",
//     });
//   } catch (error) {
//     console.error("Booking error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to book appointment",
//       error: error.message,
//     });
//   }
// };
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    if (!canModifyAppointment(appointment.date, appointment.start_time)) {
      return res.status(400).json({
        success: false,
        message:
          "Appointments can only be cancelled at least 24 hours in advance",
      });
    }

    // Delete Zoom meeting if virtual
    if (appointment.type === "virtual" && appointment.zoom_meeting_id) {
      await deleteZoomMeeting(appointment.zoom_meeting_id);
    }

    // Remove appointment from DB
    await Appointment.findByIdAndDelete(appointment._id);

    // Free up availability slot
    await Availability.findOneAndUpdate(
      {
        counselor_id: appointment.counselor,
        date: appointment.date.toISOString().split("T")[0], // match Availability.date string format
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: "booked", // only update if it was booked
      },
      { status: "available" }
    );
    
    console.log("Updating availability with:", {
      counselor_id: appointment.counselor,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
    });
    
    // Send notification AFTER deletion
    await sendAppointmentNotification(appointment, "cancelled");

    res.status(200).json({
      success: true,
      message: "Appointment cancelled and deleted successfully",
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

// export const cancelAppointment = async (req, res) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id);

//     // Validate appointment exists
//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: "Appointment not found",
//       });
//     }

//     // Check authorization
//     if (appointment.student.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to cancel this appointment",
//       });
//     }

//     // Check 24-hour rule
//     if (!canModifyAppointment(appointment.date, appointment.start_time)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Appointments can only be cancelled at least 24 hours in advance",
//       });
//     }

//     // Delete Zoom meeting if virtual
//     if (appointment.type === "virtual" && appointment.zoom_meeting_id) {
//       await deleteZoomMeeting(appointment.zoom_meeting_id);
//     }

//     // Update appointment status
//     appointment.status = "cancelled";
//     await appointment.save();

//     // Free up availability slot
//     await Availability.findOneAndUpdate(
//       {
//         counselor: appointment.counselor,
//         date: appointment.date,
//         start_time: appointment.start_time,
//         end_time: appointment.end_time,
//       },
//       { status: "available" }
//     );

//     // Send notifications
//     await sendAppointmentNotification(appointment, "cancelled");

//     res.status(200).json({
//       success: true,
//       data: appointment,
//       message: "Appointment cancelled successfully",
//     });
//   } catch (error) {
//     console.error("Cancellation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to cancel appointment",
//       error: error.message,
//     });
//   }
// };

// controllers/appointmentController.js

// export const rescheduleAppointment = async (req, res) => {
//   try {
//     const {  newAvailabilityId, reason } = req.body;
//     const studentId = req.user._id;
//     const appointmentId = req.params.appointmentId;
//     // Fetch and populate appointment
//     const appointment = await Appointment.findById(appointmentId).populate({
//       path: "counselor",

//       populate: {
//         path: "user_id",
//         model: "User",
//         select: "email first_name",
//       },
//     });
  

//     if (!appointment) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Appointment not found" });
//     }

//     console.log("Populated counselor.user_id:", appointment.counselor?.user_id);
//     console.log("Counselor email:", appointment.counselor?.user_id?.email);


    
//     // Check population
//     console.log("Counselor exists:", !!appointment.counselor);
//     console.log("User populated:", !!appointment.counselor?.user_id);
//     console.log("User data:", appointment.counselor?.user_id);

//     // Check ownership
//     if (appointment.student.toString() !== studentId.toString()) {
//       return res
//         .status(403)
//         .json({
//           success: false,
//           message: "Not authorized to reschedule this appointment",
//         });
//     }

//     // Enforce 24-hour rule
//     const now = new Date();
//     const appointmentDate = new Date(
//       `${appointment.date}T${appointment.start_time}`
//     );
//     const hoursLeft = (appointmentDate - now) / (1000 * 60 * 60);
//     if (hoursLeft < 24) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "You can only reschedule at least 24 hours in advance",
//         });
//     }

//     // Validate new slot
//     const newSlot = await Availability.findById(newAvailabilityId);
//     if (!newSlot || newSlot.status !== "available") {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Selected new time slot is not available",
//         });
//     }

//     // Create new Zoom meeting if virtual
//     let zoomMeeting = null;
//     if (appointment.type === "virtual") {
//       const duration =
//         parseInt(newSlot.end_time.split(":")[0]) * 60 +
//         parseInt(newSlot.end_time.split(":")[1]) -
//         (parseInt(newSlot.start_time.split(":")[0]) * 60 +
//           parseInt(newSlot.start_time.split(":")[1]));
//       const student = await User.findById(studentId);

//       zoomMeeting = await generateZoomMeeting({
//         topic: `Rescheduled: Counseling Session`,
//         startTime: new Date(
//           `${newSlot.date}T${newSlot.start_time}`
//         ).toISOString(),
//         duration,
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         settings: {
//           alternative_hosts: appointment.counselor.user_id.email,
//           contact_name: student.name,
//           contact_email: student.email,
//         },
//       });
//     }

//     // Free old slot
//     await Availability.findOneAndUpdate(
//       {
//         counselor_id: appointment.counselor._id,
//         date: appointment.date,
//         start_time: appointment.start_time,
//         end_time: appointment.end_time,
//         status: "booked",
//       },
//       { status: "available" }
//     );

//     // Update appointment
//     appointment.date = newSlot.date;
//     appointment.start_time = newSlot.start_time;
//     appointment.end_time = newSlot.end_time;
//     appointment.virtual_meeting_link = zoomMeeting?.join_url || null;
//     appointment.zoom_meeting_id = zoomMeeting?.id || null;
//     appointment.zoom_password = zoomMeeting?.password || null;
//     appointment.zoom_start_url = zoomMeeting?.start_url || null;
//     appointment.notes = `${appointment.notes}\nRescheduled Reason: ${reason}`;
//     await appointment.save();

//     // Book new slot
//     newSlot.status = "booked";
//     await newSlot.save();

//     // Notify counselor
//     await sendAppointmentNotification(appointment, "rescheduled");

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Appointment rescheduled successfully",
//         data: appointment,
//       });
//   } catch (err) {
//     console.error("Reschedule error:", err);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Failed to reschedule appointment",
//         error: err.message,
//       });
//   }
// };
export const rescheduleAppointment = async (req, res) => {
  try {
    const { newAvailabilityId, reason } = req.body;
    const studentId = req.user._id;
    const appointmentId = req.params.appointmentId;

    // Fetch and populate appointment
    const appointment = await Appointment.findById(appointmentId).populate({
      path: "counselor",
      populate: {
        path: "user_id",
        model: "User",
        select: "email first_name",
      },
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Check ownership
    if (appointment.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reschedule this appointment",
      });
    }

    // Enforce 24-hour rule
    const now = new Date();
    const appointmentDate = new Date(
      `${appointment.date}T${appointment.start_time}`
    );
    const hoursLeft = (appointmentDate - now) / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      return res.status(400).json({
        success: false,
        message: "You can only reschedule at least 24 hours in advance",
      });
    }

    // Validate new slot
    const newSlot = await Availability.findById(newAvailabilityId);
    if (!newSlot || newSlot.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Selected new time slot is not available",
      });
    }

    // Save old slot info before overwriting
    // Ensure oldDate is a string in 'YYYY-MM-DD' format to match DB
    const toLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const oldDate =
      typeof appointment.date === "string"
        ? appointment.date
        : toLocalDateString(appointment.date);
    
    // Create new Zoom meeting if virtual
    let zoomMeeting = null;
    if (appointment.type === "virtual") {
      const duration =
        parseInt(newSlot.end_time.split(":")[0]) * 60 +
        parseInt(newSlot.end_time.split(":")[1]) -
        (parseInt(newSlot.start_time.split(":")[0]) * 60 +
          parseInt(newSlot.start_time.split(":")[1]));

      const student = await User.findById(studentId);

      zoomMeeting = await generateZoomMeeting({
        topic: `Rescheduled: Counseling Session`,
        startTime: new Date(
          `${newSlot.date}T${newSlot.start_time}`
        ).toISOString(),
        duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        settings: {
          alternative_hosts: appointment.counselor.user_id.email,
          contact_name: student.name,
          contact_email: student.email,
        },
      });
    }

    // Free old slot — now should find it correctly
    const freedOldSlot = await Availability.findOneAndUpdate(
      {
        counselor_id: appointment.counselor._id,
        date: oldDate,
        start_time: oldStartTime,
        end_time: oldEndTime,
        status: "booked",
      },
      { status: "available" }
    );

    if (!freedOldSlot) {
      console.warn(
        "Warning: Old availability slot not found or was not booked.",
        {
          counselorId: appointment.counselor._id,
          oldDate,
          oldStartTime,
          oldEndTime,
        }
      );
    }

    // Update appointment
    appointment.date = newSlot.date;
    appointment.start_time = newSlot.start_time;
    appointment.end_time = newSlot.end_time;
    appointment.virtual_meeting_link = zoomMeeting?.join_url || null;
    appointment.zoom_meeting_id = zoomMeeting?.id || null;
    appointment.zoom_password = zoomMeeting?.password || null;
    appointment.zoom_start_url = zoomMeeting?.start_url || null;
    appointment.notes = `${appointment.notes}\nRescheduled Reason: ${reason}`;
    await appointment.save();

    // Book new slot
    newSlot.status = "booked";
    await newSlot.save();

    // Notify counselor
    await sendAppointmentNotification(appointment, "rescheduled");

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (err) {
    console.error("Reschedule error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reschedule appointment",
      error: err.message,
    });
  }
};



export const addSessionNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { session_note, session_discussed } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.session_note = session_note;
    appointment.session_discussed = session_discussed;

    await appointment.save();

    res.status(200).json({ message: "Session note added", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error adding session note", error });
  }
};

export const rateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { session_rating_by_student } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.end_time}`
    );
    const now = new Date();

    if (now < appointmentDateTime) {
      return res
        .status(400)
        .json({
          message: "You can only rate after the appointment has ended.",
        });
    }

    if (session_rating_by_student < 1 || session_rating_by_student > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    appointment.session_rating_by_student = session_rating_by_student;
    await appointment.save();

    res.status(200).json({ message: "Session rated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error rating session", error });
  }
};

export const getSessionNote = async (req, res) => {
  try {
    const { id } = req.params; // appointment ID

    const appointment = await Appointment.findById(id).populate(
      "counselor student"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the logged-in user is the counselor for this appointment
    if (appointment.counselor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this session note" });
    }

    res.status(200).json({
      session_note: appointment.session_note || "",
      session_discussed: appointment.session_discussed || "",
      student: appointment.student?.name || "Student",
      appointmentDate: appointment.date,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving session note", error });
  }
};


export const getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user._id })
      .populate({
        path: "counselor",
        select: "specialization user_id",
        populate: {
          path: "user_id",
          select: "first_name last_name email",
        },
      })
      .sort({ date: -1, start_time: 1 })
      .lean();
    // Shift date by +12 hours for each appointment before sending
    appointments.forEach((appt) => {
      appt.date = new Date(new Date(appt.date).getTime() + 12 * 60 * 60 * 1000);
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};




// Helper function that can be called from API and cron job


// This should be your GET /api/appointment/:id endpoint
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate({
        path: "counselor",
        populate: {
          path: "user_id",
          model: "User",
          select: "first_name last_name email name"
        }
      })
      .populate({
        path: "student",
        model: "User", 
        select: "first_name last_name email name"
      });
      console.log("Counselor ID:", req.user?._id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Debug logs to verify population
    console.log("Appointment found:", appointment._id);
    console.log("Counselor populated:", !!appointment.counselor);
    console.log("Counselor user_id populated:", !!appointment.counselor?.user_id);
    console.log("Counselor user data:", appointment.counselor?.user_id);

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message
    });
  }
};



export const getCounselorAppointments = async (req, res) => {
  try {
    const counselor = await Counselor.findOne({ user_id: req.user._id });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: "Counselor profile not found",
      });
    }

    const appointments = await Appointment.find({ counselor: counselor._id })
      .populate("student", "first_name last_name email")
      .sort({ date: -1, start_time: -1 }); // descending order

    // Shift date by +12 hours for each appointment before sending
    appointments.forEach((appt) => {
      appt.date = new Date(new Date(appt.date).getTime() + 12 * 60 * 60 * 1000);
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// export const getAllAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find()
//       .populate("student", "first_name last_name email")
//       .populate({
//         path: "counselor",
//         populate: {
//           path: "user_id",
//           select: "first_name last_name email",
//         },
//       })
//       .sort({ date: 1, start_time: 1 });

//     // Format response
//     const formatted = appointments.map((appt) => ({
//       studentName: `${appt.student?.user_id?.first_name || "N/A"} ${
//         appt.student?.user_id?.last_name || ""
//       }`,
//       studentEmail: appt.student?.user_id?.email || "N/A",
//       counselorName: `${appt.counselor?.user_id?.first_name || "N/A"} ${
//         appt.counselor?.user_id?.last_name || ""
//       }`,
//       counselorEmail: appt.counselor?.user_id?.email || "N/A",
//       date: appt.date,
//       startTime: appt.start_time,
//       endTime: appt.end_time,
//       mode: appt.mode,
//     }));

//     res.status(200).json({
//       success: true,
//       count: formatted.length,
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("Head Counselor Appointment Fetch Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch appointments",
//       error: error.message,
//     });
//   }
// };
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("student", "first_name last_name email")
      .populate({
        path: "counselor",
        populate: { path: "user_id", select: "first_name last_name email" },
      })
      .sort({ date: -1, start_time: 1 });
    // Shift date by +12 hours for each appointment before sending
    appointments.forEach((appt) => {
      appt.date = new Date(new Date(appt.date).getTime() + 12 * 60 * 60 * 1000);
    });
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};
