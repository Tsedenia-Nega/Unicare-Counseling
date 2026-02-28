

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import MoodForm from "../components/MoodForm";
import MoodList from "../components/MoodList";
import RecommendationsPanel from "../components/RecommendationsPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import Login from "./LoginPage";
import MoodChart from "../components/MoodChart";
import API from "../services/api";




function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [newEntryAdded, setNewEntryAdded] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL ;
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return response;
  };

  useEffect(() => {
    if (user) {
      fetchMoodEntries();
    }
  }, [user]);

  const fetchMoodEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE_URL}/moods`);
      const data = await response.json();
      setMoodEntries(data.moods || data);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSubmit = async (moodData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/moods`, {
        method: "POST",
        body: JSON.stringify(moodData),
      });

      const newEntry = await response.json();
      setMoodEntries((prev) => [newEntry, ...prev]);
      setNewEntryAdded(true);
      return { success: true };
    } catch (error) {
      console.error("Error submitting mood entry:", error);
      return { success: false, error: error.message };
    }
  };

  const getRecommendations = async () => {
    setIsGettingRecommendations(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE_URL}/recommendations`, {
        method: "POST",
        body: JSON.stringify({
          recentMoods: moodEntries.slice(0, 10),
        }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations);
      setShowRecommendations(true);
      setNewEntryAdded(false);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setError(error.message);
    } finally {
      setIsGettingRecommendations(false);
    }
  };

  const handleDeleteMood = async (moodId) => {
    try {
      await authFetch(`${API_BASE_URL}/moods/${moodId}`, {
        method: "DELETE",
      });
      setMoodEntries((prev) => prev.filter((mood) => mood._id !== moodId));
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      setError(error.message);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <></>; // ⛔️ No login redirect — renders nothing if not logged in
    // Or: return <div>Please log in to access the app.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-8">
          <MoodForm onSubmit={handleMoodSubmit} />

          {moodEntries.length > 0 && (
            <div className="mt-8">
              <MoodChart moodEntries={moodEntries} />
            </div>
          )}

          {showRecommendations ? (
            <RecommendationsPanel
              recommendations={recommendations}
              onRefresh={getRecommendations}
              isLoading={isGettingRecommendations}
              onClose={() => setShowRecommendations(false)}
            />
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={getRecommendations}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors duration-200 shadow-md"
              >
                Get Recommendations
              </button>
              {newEntryAdded && (
                <button
                  onClick={() => {
                    getRecommendations();
                    setNewEntryAdded(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200 shadow-md"
                >
                  Get Updated Recommendations
                </button>
              )}
            </div>
          )}

          <MoodList
            moodEntries={moodEntries}
            onDeleteMood={handleDeleteMood}
            currentUserId={user._id}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

