"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const moodColorMap = {
  happy: "#FBBF24",
  sad: "#60A5FA",
  anxious: "#F87171",
  calm: "#34D399",
  angry: "#FB923C",
  excited: "#A78BFA",
  tired: "#9CA3AF",
  stressed: "#F472B6",
};

const MoodChart = ({ moodEntries }) => {
  const [timeRange, setTimeRange] = useState("week");
  const [chartType, setChartType] = useState("line");
  const [activeTab, setActiveTab] = useState("trends");

  // Process data for different visualizations
  const processData = () => {
    const now = new Date();
    let filteredEntries = [...moodEntries];

    // Filter by time range
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredEntries = moodEntries.filter(
        (entry) => new Date(entry.timestamp) > oneWeekAgo
      );
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredEntries = moodEntries.filter(
        (entry) => new Date(entry.timestamp) > oneMonthAgo
      );
    }

    // For trends chart
    const trendsData = filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = {};
      if (!acc[date][entry.mood])
        acc[date][entry.mood] = { total: 0, count: 0 };
      acc[date][entry.mood].total += entry.intensity;
      acc[date][entry.mood].count++;
      return acc;
    }, {});

    // For distribution pie chart
    const distributionData = Object.entries(
      filteredEntries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {})
    ).map(([mood, count]) => ({
      name: mood,
      value: count,
      color: moodColorMap[mood],
    }));

    return {
      trends: Object.entries(trendsData)
        .map(([date, moods]) => {
          const entry = { date };
          Object.entries(moods).forEach(([mood, { total, count }]) => {
            entry[mood] = Math.round((total / count) * 10) / 10;
          });
          return entry;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      distribution: distributionData,
      averageIntensity:
        filteredEntries.reduce((sum, entry) => sum + entry.intensity, 0) /
        filteredEntries.length,
    };
  };

  const { trends, distribution, averageIntensity } = processData();
  const moodTypes = Array.from(
    new Set(moodEntries.map((entry) => entry.mood))
  ).filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "trends"
              ? "text-[#3B7962] border-b-2 border-[#3B7962]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("trends")}
        >
          Trends
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "distribution"
              ? "text-[#3B7962] border-b-2 border-[#3B7962]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("distribution")}
        >
          Distribution
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "insights"
              ? "text-[#3B7962] border-b-2 border-[#3B7962]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          Insights
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          {activeTab === "trends" && "Mood Trends"}
          {activeTab === "distribution" && "Mood Distribution"}
          {activeTab === "insights" && "Key Insights"}
        </h2>

        {activeTab !== "insights" && (
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            {activeTab === "trends" && (
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="h-80">
        {activeTab === "trends" ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    borderColor: "#3B7962",
                  }}
                  formatter={(value, name) => [`Intensity: ${value}`, name]}
                />
                <Legend />
                {moodTypes.map((mood) => (
                  <Line
                    key={mood}
                    type="monotone"
                    dataKey={mood}
                    stroke={moodColorMap[mood]}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    borderColor: "#3B7962",
                  }}
                  formatter={(value, name) => [`Intensity: ${value}`, name]}
                />
                <Legend />
                {moodTypes.map((mood) => (
                  <Bar key={mood} dataKey={mood} fill={moodColorMap[mood]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : activeTab === "distribution" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `Count: ${value}`,
                  props.payload.name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Average Mood Intensity
                </h3>
                <div className="text-3xl font-bold text-blue-600">
                  {averageIntensity.toFixed(1)}/5
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(averageIntensity / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Most Common Mood
                </h3>
                {distribution.length > 0 && (
                  <>
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-xl"
                        style={{
                          backgroundColor: `${distribution[0].color}20`,
                          color: distribution[0].color,
                        }}
                      >
                        {distribution[0].name === "happy" && "😊"}
                        {distribution[0].name === "sad" && "😢"}
                        {distribution[0].name === "anxious" && "😰"}
                        {distribution[0].name === "calm" && "😌"}
                        {distribution[0].name === "angry" && "😠"}
                        {distribution[0].name === "excited" && "🤩"}
                        {distribution[0].name === "tired" && "😴"}
                        {distribution[0].name === "stressed" && "😫"}
                      </div>
                      <div>
                        <div className="text-xl font-bold capitalize text-green-600">
                          {distribution[0].name}
                        </div>
                        <div className="text-sm text-green-500">
                          {(
                            (distribution[0].value / moodEntries.length) *
                            100
                          ).toFixed(0)}
                          % of entries
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {moodTypes.map((mood) => (
          <div key={mood} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: moodColorMap[mood] }}
            ></div>
            <span className="text-sm capitalize">{mood}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodChart;
