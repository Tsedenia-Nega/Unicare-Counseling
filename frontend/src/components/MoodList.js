

export default function MoodList({ moodEntries, onDeleteMood, currentUserId }) {
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this mood entry?"
    );
    if (confirmDelete) {
      onDeleteMood(id);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-2 border-gray-200">
        Your Mood History
      </h2>

      {moodEntries.length === 0 ? (
        <p className="text-gray-500 text-center">No mood entries yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {moodEntries.map((entry) => (
            <li key={entry._id} className="py-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 capitalize">
                    <span>
                      {getMoodEmoji(entry.mood)} {entry.mood}
                    </span>
                    <span className="text-sm text-gray-500 font-normal">
                      (Intensity: {entry.intensity}/5)
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-gray-700 mt-2 text-sm">{entry.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>

                {entry.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="bg-[#3B7962] hover:bg-[#2e5b44] text-white px-4 py-2 text-sm rounded-xl shadow-md transition-all duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getMoodEmoji(mood) {
  switch (mood) {
    case "happy":
      return "😊";
    case "sad":
      return "😢";
    case "anxious":
      return "😰";
    case "calm":
      return "😌";
    case "angry":
      return "😠";
    case "excited":
      return "🤩";
    case "tired":
      return "😴";
    case "stressed":
      return "😫";
    default:
      return "📝";
  }
}
