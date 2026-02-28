import cron from "node-cron";
import Appointment from "../models/appointmentModel.js";
import UrgentRequest from "../models/urgentRequest.js";

// // Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏱ Checking for completed appointments...");

  const now = new Date();

  try {
    const appointments = await Appointment.find({
      status: { $in: ["booked", "confirmed"] },
      end_time: { $lte: now },
    });

    for (const appt of appointments) {
      appt.status = "completed";
      await appt.save();

      // Update linked urgent request if applicable
      if (appt.urgent_request_id) {
        await UrgentRequest.findByIdAndUpdate(appt.urgent_request_id, {
          status: "completed",
        });
      }

      console.log(`✅ Marked appointment ${appt._id} as completed.`);
    }
  } catch (error) {
    console.error("❌ Error checking appointments:", error);
  }
});
