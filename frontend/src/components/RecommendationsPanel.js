"use client";

const RecommendationsPanel = ({
  recommendations,
  onRefresh,
  isLoading,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Your Personalized Recommendations
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Analyzing your mood patterns...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 h-12 w-12 rounded-full ${
                      rec.urgency === "high"
                        ? "bg-red-100 text-red-600"
                        : rec.urgency === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    } flex items-center justify-center text-xl mr-4`}
                  >
                    {rec.type === "exercise" && "🏋️"}
                    {rec.type === "meditation" && "🧘"}
                    {rec.type === "social" && "👥"}
                    {rec.type === "therapy" && "🛋️"}
                    {rec.type === "article" && "📚"}
                    {rec.type === "music" && "🎵"}
                    {rec.type === "breathing" && "🌬️"}
                    {rec.type === "sleep" && "😴"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {rec.description}
                    </p>
                    <div className="flex items-center mt-3 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          rec.urgency === "high"
                            ? "bg-red-100 text-red-800"
                            : rec.urgency === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        } mr-2`}
                      >
                        {rec.urgency} priority
                      </span>
                      <span className="text-gray-500">
                        ⏱️ {rec.timeToComplete}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No recommendations available yet.
            </p>
            <button
              onClick={onRefresh}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500 italic text-center">
          🤖 These recommendations are AI-generated and intended for general
          guidance only.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 transition-colors duration-200 shadow-md flex items-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Refreshing...
              </>
            ) : (
              "Refresh Recommendations"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
