"use client";

const Recommendations = ({
  recommendations,
  onGetRecommendations,
  isLoading,
}) => {
  const getRecommendationIcon = (type) => {
    const icons = {
      article: "📚",
      music: "🎵",
      exercise: "⚡",
      meditation: "🧘",
      therapy: "🗣️",
      social: "👥",
      breathing: "🫁",
      sleep: "😴",
    };
    return icons[type] || "💡";
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Recommendations
            </h2>
            <p className="text-gray-600">
              Get personalized suggestions based on your mood patterns
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500 mb-6">
            Record a mood entry to get personalized AI recommendations for
            improving your wellbeing
          </p>
          <button
            onClick={onGetRecommendations}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading
              ? "Getting recommendations..."
              : "Get AI Recommendations"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Recommendations
          </h2>
          <p className="text-gray-600">
            Personalized suggestions based on your recent mood patterns
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="p-6 border-2 border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg text-2xl group-hover:scale-110 transition-transform duration-200">
                {getRecommendationIcon(rec.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {rec.title}
                  </h4>
                  {rec.urgency && (
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(
                        rec.urgency
                      )}`}
                    >
                      {rec.urgency}
                    </span>
                  )}
                </div>
                {rec.timeToComplete && (
                  <div className="text-sm text-gray-500 mb-2">
                    ⏱️ {rec.timeToComplete}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              {rec.description}
            </p>

            {rec.url && (
              <a
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold text-sm transition-colors duration-200"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500 italic text-center">
        🤖 These recommendations are AI-generated and intended for general
        guidance only.
      </div>

      <button
        onClick={onGetRecommendations}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Getting new recommendations...
          </div>
        ) : (
          "Get New Recommendations"
        )}
      </button>
    </div>
  );
};

export default Recommendations;
