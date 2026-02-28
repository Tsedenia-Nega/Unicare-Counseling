import { useState } from "react";
import MoodChart from "./MoodChart";
import { useNavigate } from "react-router-dom";
const moodOptions = [
  {
    value: "happy",
    label: "😊 Happy",
    color: "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300",
  },
  {
    value: "sad",
    label: "😢 Sad",
    color: "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300",
  },
  {
    value: "anxious",
    label: "😰 Anxious",
    color: "bg-gradient-to-r from-red-100 to-red-200 border-red-300",
  },
  {
    value: "calm",
    label: "😌 Calm",
    color: "bg-gradient-to-r from-green-100 to-green-200 border-green-300",
  },
  {
    value: "angry",
    label: "😠 Angry",
    color: "bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300",
  },
  {
    value: "excited",
    label: "🤩 Excited",
    color: "bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300",
  },
  {
    value: "tired",
    label: "😴 Tired",
    color: "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300",
  },
  {
    value: "stressed",
    label: "😫 Stressed",
    color: "bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300",
  },
];

const intensityLevels = [
  { value: 1, label: "Very Low", color: "bg-green-100" },
  { value: 2, label: "Low", color: "bg-yellow-100" },
  { value: 3, label: "Moderate", color: "bg-orange-100" },
  { value: 4, label: "High", color: "bg-red-100" },
  { value: 5, label: "Very High", color: "bg-red-200" },
];

const MoodForm = ({ onSubmit }) => {
  const [currentMood, setCurrentMood] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
const navigate= useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMood) {
      setError("Please select a mood");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await onSubmit({
      mood: currentMood,
      intensity,
      notes,
    });

    if (result.success) {
      setCurrentMood("");
      setIntensity(3);
      setNotes("");
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="rounded-3xl shadow-2xl p-10 border border-gray-200 bg-white max-w-4xl mx-auto">
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#3B7962] rounded-xl text-white">
          <span className="text-2xl">📅</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            How are you feeling today?
          </h2>
          <p className="text-gray-600 mt-1">
            Track your current mood and reflect on your day
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Current Mood
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setCurrentMood(mood.value)}
                className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${
                  currentMood === mood.value
                    ? `${mood.color} border-opacity-100 ring-2 ring-[#3B7962]`
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {mood.label.split(" ")[0]}
                  </div>
                  <div className="text-sm text-gray-700">
                    {mood.label.split(" ").slice(1).join(" ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Intensity Level:{" "}
            <span className="font-bold">
              {intensityLevels.find((l) => l.value === intensity)?.label}
            </span>
          </label>
          <div className="flex gap-3">
            {intensityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setIntensity(level.value)}
                className={`flex-1 p-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 shadow-sm hover:scale-105 ${
                  intensity === level.value
                    ? `${level.color} border-[#3B7962] ring-2 ring-[#3B7962]/40`
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{level.value}</div>
                  <div className="text-xs text-gray-600">{level.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Notes (Optional)
          </label>
          <textarea
            placeholder="What’s on your mind today? Any events or thoughts?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#3B7962] focus:ring-2 focus:ring-[#3B7962]/30 transition-colors duration-200 resize-none bg-white shadow-inner"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {notes.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!currentMood || isSubmitting}
          className="w-full bg-[#3B7962] text-white text-lg font-semibold py-4 px-6 rounded-2xl hover:bg-[#2e5b44] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            "Save Mood Entry"
          )}
        </button>
      </form>
    </div>
  );
};

export default MoodForm;
