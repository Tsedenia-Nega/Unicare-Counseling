import transporter from "../config/nodemailer.js";
import User from "../models/userModel.js";
import Counselor from "../models/counselorModel.js";
import Appointment from "../models/appointmentModel.js";

// Base email function (your existing)
export const sendEmail = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email failed:", error);
    return false;
  }
};

// Appointment notification handler
export const sendAppointmentNotification = async (Appointment, action) => {
  try {
    // Get both parties
    const [student, counselor] = await Promise.all([
      User.findById(Appointment.student).select("first_name last_name email"),
      Counselor.findById(Appointment.counselor).populate(
        "user_id",
        "first_name last_name email"
      ),
    ]);

    if (!student || !counselor || !counselor.user_id) {
      throw new Error("Student or counselor details not found.");
    }

    const studentName = `${student.first_name} ${student.last_name}`.trim();
    const studentEmail = student.email;

    const counselorName =
      `${counselor.user_id.first_name} ${counselor.user_id.last_name}`.trim();
    const counselorEmail = counselor.user_id.email;

    const dateStr = `${Appointment.date}`;
    const timeSlot = `${Appointment.start_time} - ${Appointment.end_time}`;

    const templates = {
      booked: {
        subject: `Appointment Confirmed with Counselor${counselorName}`,
        studentHtml: `
          <div>
            <h3>Your appointment is confirmed!</h3>
            <p>With Counselor : <strong>${counselorName}</strong></p>
            <p>Date: ${dateStr}</p>
            <p>Time: ${timeSlot}</p>
            ${
              Appointment.type === "virtual"
                ? `<p>Join: <a href="${Appointment.virtual_meeting_link}">Meeting Link</a></p>
                the password: ${Appointment.zoom_password}`
                : "<p>Location: In-Person</p>"
            }
          </div>
        `,
        counselorText: `
      New appointment with ${studentName} on ${dateStr} at ${timeSlot}.Start the meeting here: ${Appointment.zoom_start_url}   the password: ${Appointment.zoom_password}
    `,
      },
      cancelled: {
        subject: `Appointment Cancelled with ${counselorName}`,
        studentHtml: `
          <div>
            <h3>Appointment Cancelled</h3>
            <p>Your session with ${counselorName} on ${dateStr} has been cancelled</p>
          </div>
        `,
        counselorText: `
      New appointment with ${studentName} on ${dateStr} at ${timeSlot}.Start the meeting here: ${Appointment.zoom_start_url}  // Counselor start link
    `,
      },
      rescheduled: {
        subject: `Appointment Rescheduled with ${counselorName}`,
        studentHtml: `
          <div>
            <h3>Appointment Changed</h3>
            <p>New time with ${counselorName}:</p>
            <p>${dateStr} at ${timeSlot}</p>
          </div>
        `,
        counselorText: `Rescheduled: ${studentName}'s appointment to ${dateStr} at ${timeSlot}`,
      },
    };

    const template = templates[action];

    // Send to student (HTML email)
    await sendEmail(studentEmail, template.subject, null, template.studentHtml);

    // Send to counselor (Text email)
    await sendEmail(
      counselorEmail,
      `Appointment ${action} - ${studentName}`,
      template.counselorText
    );

    return true;
  } catch (error) {
    console.error("Notification failed:", error.message);
    return false;
  }
};
