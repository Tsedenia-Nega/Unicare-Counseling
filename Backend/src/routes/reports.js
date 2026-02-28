import express from "express";
import isHeadCounselor from "../middlewares/isHeadCounselor.js";
import Mood from "../models/mood.js";
import Appointment from "../models/appointmentModel.js";
import Message from "../models/messageModel.js";
import Counselor from "../models/counselorModel.js";
import userAuth from "../middlewares/userAuth.js";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/weekly", userAuth, isHeadCounselor, async (req, res) => {
  try {
    const { startDate, endDate, download } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, error: "Missing date range." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const moodStats = await Mood.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: { mood: "$mood", userId: "$userId" } } },
      { $group: { _id: "$_id.mood", studentCount: { $sum: 1 } } },
      { $sort: { studentCount: -1 } },
    ]);

    const trendingMood = moodStats.length > 0 ? moodStats[0]._id : "No data";

    const appointmentTypeStats = await Appointment.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const counselorStats = await Appointment.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$counselor", count: { $sum: 1 } } },
    ]);

    const counselorDetails = await Promise.all(
      counselorStats.map(async (c) => {
        const counselor = await Counselor.findById(c._id).populate(
          "user_id",
          "first_name last_name"
        );
        return {
          counselorName: counselor?.user_id
            ? `${counselor.user_id.first_name} ${counselor.user_id.last_name}`
            : "Unknown",
          appointmentCount: c.count,
        };
      })
    );

    const messages = await Message.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$senderId" } },
    ]);

    const report = {
      moodSummary: moodStats.map((m) => ({
        mood: m._id,
        studentCount: m.studentCount,
      })),
      trendingMood,
      appointmentSummary: {
        inPerson:
          appointmentTypeStats.find((a) => a._id === "in-person")?.count || 0,
        virtual:
          appointmentTypeStats.find((a) => a._id === "virtual")?.count || 0,
        total: appointmentTypeStats.reduce((acc, cur) => acc + cur.count, 0),
      },
      appointmentsPerCounselor: counselorDetails,
      totalActiveUsers: messages.length,
      reportPeriod: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      },
      generatedAt: new Date().toISOString(),
    };

    if (download === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=weekly_report_${startDate}_to_${endDate}.pdf`
      );
      doc.pipe(res);

      doc.fontSize(20).text(" Report", { align: "center" });
      doc.moveDown();

      doc
        .fontSize(12)
        .text(
          `Report Period: ${report.reportPeriod.startDate} to ${report.reportPeriod.endDate}`
        );
      doc.text(
        `Generated At: ${new Date(report.generatedAt).toLocaleString()}`
      );
      doc.moveDown();

      doc.fontSize(14).text(`Trending Mood: ${report.trendingMood}`);
      doc.moveDown();

      doc.fontSize(14).text("Mood Summary:");
      report.moodSummary.forEach((m) => {
        doc.text(`- ${m.mood}: ${m.studentCount} student(s)`);
      });
      doc.moveDown();

      doc.fontSize(14).text("Appointment Summary:");
      doc.text(`- In-Person: ${report.appointmentSummary.inPerson}`);
      doc.text(`- Virtual: ${report.appointmentSummary.virtual}`);
      doc.text(`- Total: ${report.appointmentSummary.total}`);
      doc.moveDown();

      doc.fontSize(14).text("Appointments Per Counselor:");
      report.appointmentsPerCounselor.forEach((c) => {
        doc.text(`- ${c.counselorName}: ${c.appointmentCount} appointment(s)`);
      });
      doc.moveDown();

      doc.fontSize(14).text(`Active Forum Users: ${report.totalActiveUsers}`);

      doc.end();
      return;
    }

    return res.json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate report" });
  }
});

export default router;
