import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import API from "../services/api";

const WeeklyReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
const Backend_URL =
  process.env.REACT_APP_API_URL ;
  const validateDates = () => {
    if (!startDate || !endDate) {
      alert(" Please select both start and end dates.");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert(" Start date cannot be after end date.");
      return false;
    }
    return true;
  };

  const generateReport = async () => {
    if (!validateDates()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.get(`${Backend_URL}/reports/weekly`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      setReport(res.data.data);
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!validateDates()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`${Backend_URL}/reports/weekly`, {
        params: { startDate, endDate, download: "pdf" },
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const filename = `weekly_report_${startDate}_to_${endDate}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 rounded-2xl border border-gray-200 mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Performance Report
      </h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-col w-full">
          <label className="mb-1 font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="mb-1 font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-[#3B7962] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2e5b44] disabled:opacity-50 transition-all"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
        {report && (
          <button
            onClick={downloadPDF}
            className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
          >
            Download PDF
          </button>
        )}
      </div>

      {report && (
        <div className="mt-10 space-y-6 bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 italic">
            Report Period: {report.reportPeriod.startDate} to{" "}
            {report.reportPeriod.endDate}
            <br />
            Generated At: {new Date(report.generatedAt).toLocaleString()}
          </div>

          <div className="text-lg">
            <strong className="text-gray-700">Trending Mood:</strong>{" "}
            {report.trendingMood || "N/A"}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Mood Summary
            </h3>
            {report.moodSummary.length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {report.moodSummary.map((m, i) => (
                  <li key={i}>
                    <strong>{m.mood}:</strong> {m.studentCount} student(s)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No mood data available.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Appointments
            </h3>
            <ul className="list-disc list-inside ml-4">
              <li>In-Person: {report.appointmentSummary.inPerson}</li>
              <li>Virtual: {report.appointmentSummary.virtual}</li>
              <li>Total: {report.appointmentSummary.total}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Appointments per Counselor
            </h3>
            {report.appointmentsPerCounselor.length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {report.appointmentsPerCounselor.map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.counselorName}:</strong> {c.appointmentCount}{" "}
                    appointment(s)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No counselor appointment data available.</p>
            )}
          </div>

          <div className="text-lg">
            <strong>Active Forum Users:</strong> {report.totalActiveUsers}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReport;
