import Availability from "../models/availabilityModel.js";
import { convertTo24HourFormat, isFutureDate } from "../utils/timeUtils.js";
import Counselor from "../models/counselorModel.js";
import userAuth from "../middlewares/userAuth.js";
export const createAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User ID:", userId);

    const counselor = await Counselor.findOne({ user_id: userId });
    console.log("Counselor found:", counselor);
    if (!counselor) {
      return res.status(403).json({
        success: false,
        message: "Only counselors can create availability.",
      });
    }

    const { type, date, start_time, end_time } = req.body;

    if (!type || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Parse the date as a local date (not UTC)
    const dateObj = new Date(`${date}T00:00:00`);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (!isFutureDate(date)) {
      return res
        .status(400)
        .json({ message: "Cannot create availability for past dates." });
    }

    // Convert time without forcing UTC
    const startTime24 = convertTo24HourFormat(start_time);
    const endTime24 = convertTo24HourFormat(end_time);

    const startDate = new Date(`1970-01-01T${startTime24}:00`);
    const endDate = new Date(`1970-01-01T${endTime24}:00`);

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const availability = new Availability({
      counselor_id: counselor._id,
      type,
      date,
      start_time: startTime24,
      end_time: endTime24,
    });

    await availability.save();
    return res.status(201).json({
      message: "Availability created successfully.",
      data: availability,
    });
  } catch (error) {
    console.error("Create Availability Error:", error);
    return res.status(500).json({ message: "Failed to create availability." });
  }
};

/**
 * Create new availability entry.
 
 */
// export const createAvailability = async (req, res) => {
//   try {

//     const userId = req.user._id;
//     console.log("User ID:", userId);
//     // Check if user is a counselor
//     const counselor = await Counselor.findOne({ user_id: userId });
//     console.log("Counselor found:", counselor);
//     if (!counselor) {
//       return res.status(403).json({
//         success: false,
//         message: "Only counselors can create availability.",
//       });
//     }






//     const { type, date, start_time, end_time } = req.body;

//     // Validate required fields
//     if ( !type || !date || !start_time || !end_time) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Validate date format and ensure it's in the future
//     const dateObj = new Date(date);
//     if (isNaN(dateObj.getTime())) {
//       return res.status(400).json({ message: "Invalid date format." });
//     }

//     if (!isFutureDate(date)) {
//       return res
//         .status(400)
//         .json({ message: "Cannot create availability for past dates." });
//     }

//     // Validate time slots
//     const startTime24 = convertTo24HourFormat(start_time);
//     const endTime24 = convertTo24HourFormat(end_time);
//      const startDate = new Date(`1970-01-01T${startTime24}:00Z`);
//      const endDate = new Date(`1970-01-01T${endTime24}:00Z`);
//     if (startDate >= endDate) {
//       return res
//         .status(400)
//         .json({ message: "End time must be after start time." });
//     }

//     const availability = new Availability({
//       counselor_id: counselor._id,
//       type,
//       date,
//       start_time: startTime24,
//       end_time: endTime24,
//     });

//     await availability.save();
//     return res.status(201).json({
//       message: "Availability created successfully.",
//       data: availability,
//     });
//   } catch (error) {
//     console.error("Create Availability Error:", error);
//     return res.status(500).json({ message: "Failed to create availability." });
//   }
// };

/**
 * Update existing availability entry.
 */
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time,type } = req.body;

    if (!start_time || !end_time|| !type) {
      return res
        .status(400)
        .json({ message: "Start time and end time are required." });
    }

    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found." });
    }

    // Check if the slot is in the past
    if (!isFutureDate(availability.date)) {
      return res
        .status(400)
        .json({ message: "Cannot modify past availability slots." });
    }

    if (availability.status === "booked") {
      return res.status(400).json({ message: "Cannot update a booked slot." });
    }

    // Authorization check
    // if (availability.counselor_id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     message: "You are not authorized to update this availability.",
    //   });
    // }

    // Validate time slots
    const startTime24 = convertTo24HourFormat(start_time);
    const endTime24 = convertTo24HourFormat(end_time);
    if (startTime24 >= endTime24) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const updatedAvailability = await Availability.findByIdAndUpdate(
      id,
      {
        start_time: startTime24,
        end_time: endTime24,
        type,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Availability updated successfully.",
      data: updatedAvailability,
    });
  } catch (error) {
    console.error("Update Availability Error:", error);
    return res.status(500).json({ message: "Failed to update availability." });
  }
};

/**
 * Delete an existing availability entry.
 */
export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({ message: "Availability not found." });
    }

    // Check if the slot is in the past
    if (!isFutureDate(availability.date)) {
      return res
        .status(400)
        .json({ message: "Cannot delete past availability slots." });
    }

    if (availability.status === "booked") {
      return res.status(400).json({ message: "Cannot delete a booked slot." });
    }

    // Authorization check
    // if (availability.counselor_id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     message: "You are not authorized to delete this availability.",
    //   });
    // }

    await Availability.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Availability deleted successfully." });
  } catch (error) {
    console.error("Delete Availability Error:", error);
    return res.status(500).json({ message: "Failed to delete availability." });
  }
};

/**
 * Get availability for a specific counselor.
 */
// export const getAvailability = async (req, res) => {
//   try {
//     const { counselorId } = req.params;
//     const now = new Date();
//     const today = new Date(now.setHours(0, 0, 0, 0))
//       .toISOString()
//       .split("T")[0];

//     // Only get future or today's available slots
//     const availabilityList = await Availability.find({
//       counselor_id: counselorId,
//       status: "available",
//       date: { $gte: today },
//     }).sort({ date: 1, start_time: 1 });

//     const formattedList = availabilityList.map((item) => {
//       const slotDate = new Date(item.date);
//       const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });
//       const isToday = item.date === today;
//       const slotEnd = new Date(`${item.date}T${item.end_time}`);
//       const isPast = slotEnd < now;

//       return {
//         _id: item._id,
//         counselor_id: item.counselor_id,
//         type: item.type,
//         date: item.date,
//         weekday,
//         start_time: item.start_time,
//         end_time: item.end_time,
//         expired: isPast && !isToday,
//         isToday: isToday,
//       };
//     });

//     // Filter out expired slots except for today
//     const filteredList = formattedList.filter((slot) => !slot.expired);

//     return res.status(200).json({ availability: filteredList });
//   } catch (error) {
//     console.error("Get Availability Error:", error);
//     return res.status(500).json({ message: "Failed to fetch availability." });
//   }
// };

// import Availability from "../models/availabilityModel.js";
// import { convertTo24HourFormat } from "../utils/timeUtils.js";

// /**
//  * Create new availability entry.
//  */
// export const createAvailability = async (req, res) => {
//   try {
//     const { counselorId, type, date, start_time, end_time } = req.body;

//     if (!counselorId || !type || !date || !start_time || !end_time) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Validate date
//     if (isNaN(Date.parse(date))) {
//       return res.status(400).json({ message: "Invalid date format." });
//     }

//     const availability = new Availability({
//       counselor: counselorId,
//       type,
//       date,
//       start_time: start_time,
//       end_time: end_time,
//     });

//     await availability.save();
//     return res
//       .status(201)
//       .json({ message: "Availability created successfully." });
//   } catch (error) {
//     console.error("Create Availability Error:", error);
//     return res.status(500).json({ message: "Failed to create availability." });
//   }
// };

// /**
//  * Update existing availability entry.
//  */
// export const updateAvailability = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { start_time, end_time } = req.body;

//     if (!start_time || !end_time) {
//       return res
//         .status(400)
//         .json({ message: "Start time and end time are required." });
//     }

//     const availability = await Availability.findById(id);
//     if (!availability) {
//       return res.status(404).json({ message: "Availability not found." });
//     }

//     if (availability.status === "booked") {
//       return res.status(400).json({ message: "Cannot update a booked slot." });
//     }

//     // Ensure the logged-in user is the same as the counselor for this availability
//     if (availability.counselor.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         message: "You are not authorized to update this availability.",
//       });
//     }

//     const updatedAvailability = await Availability.findByIdAndUpdate(
//       id,
//       {
//         start_time: convertTo24HourFormat(start_time),
//         end_time: convertTo24HourFormat(end_time),
//       },
//       { new: true }
//     );

//     return res
//       .status(200)
//       .json({ message: "Availability updated successfully." });
//   } catch (error) {
//     console.error("Update Availability Error:", error);
//     return res.status(500).json({ message: "Failed to update availability." });
//   }
// };

// /**
//  * Delete an existing availability entry.
//  */
// export const deleteAvailability = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const availability = await Availability.findById(id).populate({
//       path: "counselor",
//       populate: { path: "user_id", select: "_id" }, // nested populate
//     });
//     console.log(
//       "Counselor user ID (from availability):",
//       availability.counselor.user_id
//     );
//     console.log(
//       "Counselor user ID (from availability._id):",
//       availability.counselor.user_id._id
//     );
//     console.log("Current user ID (req.user._id):", req.user._id);

//     if (!availability) {
//       return res.status(404).json({ message: "Availability not found." });
//     }

//     if (availability.status === "booked") {
//       return res.status(400).json({ message: "Cannot delete a booked slot." });
//     }

//     // Ensure the logged-in user is the same as the counselor for this availability
//     if (!availability.counselor || !availability.counselor.user_id) {
//       return res.status(500).json({ message: "Invalid counselor data." });
//     }

//     // Fix: Access the _id property of the user_id object
//     const counselorUserId = availability.counselor.user_id._id.toString();

//     if (counselorUserId !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({
//           message: "You are not authorized to delete this availability.",
//         });
//     }

//     await Availability.findByIdAndDelete(id);
//     return res
//       .status(200)
//       .json({ message: "Availability deleted successfully." });
//   } catch (error) {
//     console.error("Delete Availability Error:", error);
//     return res.status(500).json({ message: "Failed to delete availability." });
//   }
// };

// /**
//  * Get availability for a specific counselor with weekday name.
//  */
// export const getAvailability = async (req, res) => {
//   try {
//     const { counselorId } = req.params;
//     const availabilityList = await Availability.find({
//       counselor: counselorId,
//       status: "available",
//     });

//     const now = new Date();
//     const formattedList = availabilityList.map((item) => {
//       const slotEnd = new Date(`${item.date}T${item.end_time}`);
//       const isPast = slotEnd < now;

//       let weekday = "Invalid Date";
//       const parsedDate = Date.parse(item.date);
//       if (!isNaN(parsedDate)) {
//         const dateObj = new Date(parsedDate);
//         weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
//       }

//       return {
//         _id: item._id,
//         counselor: item.counselor,
//         type: item.type, // ✅ include type in response
//         date: item.date,
//         weekday,
//         start_time: item.start_time,
//         end_time: item.end_time,
//         expired: isPast,
//       };
//     });

//     return res.status(200).json({ availability: formattedList });
//   } catch (error) {
//     console.error("Get Availability Error:", error);
//     return res.status(500).json({ message: "Failed to fetch availability." });
//   }
// };
export const getAvailability = async (req, res) => {
  try {
    const { counselorId } = req.params;
    const now = new Date();

    // Get today's date string "YYYY-MM-DD"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Query by string date comparison
    const availabilityList = await Availability.find({
      counselor_id: counselorId,
      status: "available",
      date: { $gte: todayStr },  // compare string dates
    }).sort({ date: 1, start_time: 1 });

    const formattedList = availabilityList.map((item) => {
      // Convert item.date string to Date for weekday and isToday check
      const slotDate = new Date(`${item.date}T00:00:00`);
      const weekday = slotDate.toLocaleDateString("en-US", { weekday: "long" });

      // Check if slot date is today
      const isToday =
        slotDate.getFullYear() === today.getFullYear() &&
        slotDate.getMonth() === today.getMonth() &&
        slotDate.getDate() === today.getDate();

      // Calculate slot end time as a Date object
      const slotEnd = new Date(`${item.date}T${item.end_time}`);
      const isPast = slotEnd < now;

      return {
        _id: item._id,
        counselor_id: item.counselor_id,
        type: item.type,
        date: item.date,
        weekday,
        start_time: item.start_time,
        end_time: item.end_time,
        expired: isPast && !isToday,
        isToday,
      };
    });

    // Filter out expired slots except for those on today
    const filteredList = formattedList.filter((slot) => !slot.expired);

    return res.status(200).json({ availability: filteredList });
  } catch (error) {
    console.error("Get Availability Error:", error);
    return res.status(500).json({ message: "Failed to fetch availability." });
  }
};
