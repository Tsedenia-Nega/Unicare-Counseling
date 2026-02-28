import Mood from "../models/mood.js";

// Get all mood entries
export const getAllMoods = async (req, res) => {
  try {
    const { limit = 50, page = 1,  } = req.query;
    const skip = (page - 1) * limit;

    const moods = await Mood.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip);

    const total = await Mood.countDocuments({ userId: req.user._id });

    res.json({
      moods,
      pagination: {
        current: Number.parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + moods.length < total,
        hasPrev: page > 1,
        totalEntries: total,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching moods:", error);
    res.status(500).json({
      error: "Failed to fetch mood entries",
      message: error.message,
    });
  }
};

// Get mood by ID
export const getMoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const mood = await Mood.findById(id);

    if (!mood) {
      return res.status(404).json({ error: "Mood entry not found" });
    }

    res.json(mood);
  } catch (error) {
    console.error("❌ Error fetching mood:", error);
    res.status(500).json({
      error: "Failed to fetch mood entry",
      message: error.message,
    });
  }
};

// Create new mood entry
export const createMood = async (req, res) => {
  try {
    const { mood, intensity, notes, userId = "default_user" } = req.body;

    // Validation
    if (!mood || !intensity) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Mood and intensity are required",
      });
    }

    if (intensity < 1 || intensity > 5) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Intensity must be between 1 and 5",
      });
    }

    const validMoods = [
      "happy",
      "sad",
      "anxious",
      "calm",
      "angry",
      "excited",
      "tired",
      "stressed",
    ];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid mood value",
        validMoods,
      });
    }

    const newMood = new Mood({
      mood,
      intensity,
      notes: notes || "",
      userId: req.user._id,
    });

    const savedMood = await newMood.save();

    console.log(`✅ New mood entry created: ${mood} (intensity: ${intensity})`);

    res.status(201).json(savedMood);
  } catch (error) {
    console.error("❌ Error creating mood entry:", error);
    res.status(500).json({
      error: "Failed to create mood entry",
      message: error.message,
    });
  }
};

// Update mood entry
export const updateMood = async (req, res) => {
  try {
    const { id } = req.params;
    const { mood, intensity, notes } = req.body;

    const updatedMood = await Mood.findByIdAndUpdate(
      id,
      { mood, intensity, notes },
      { new: true, runValidators: true }
    );

    if (!updatedMood) {
      return res.status(404).json({ error: "Mood entry not found" });
    }

    console.log(`✅ Mood entry updated: ${id}`);
    res.json(updatedMood);
  } catch (error) {
    console.error("❌ Error updating mood entry:", error);
    res.status(500).json({
      error: "Failed to update mood entry",
      message: error.message,
    });
  }
};

// Delete mood entry
export const deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMood = await Mood.findByIdAndDelete(id);

    if (!deletedMood) {
      return res.status(404).json({ error: "Mood entry not found" });
    }

    console.log(`✅ Mood entry deleted: ${id}`);
    res.json({ message: "Mood entry deleted successfully", deletedMood });
  } catch (error) {
    console.error("❌ Error deleting mood entry:", error);
    res.status(500).json({
      error: "Failed to delete mood entry",
      message: error.message,
    });
  }
};

// Get mood statistics
export const getMoodStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await Mood.getMoodStats( req.user._id, Number.parseInt(days));
    const totalEntries = await Mood.countDocuments({
      userId: req.user._id,
      timestamp: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    });

    // Calculate additional insights
    const recentMoods = await Mood.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    const negativeMoodCount = recentMoods.filter((mood) =>
      mood.isNegativeMood()
    ).length;
    const avgIntensity =
      recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) /
      recentMoods.length;

    res.json({
      stats,
      totalEntries,
      period: `${days} days`,
      insights: {
        negativeMoodPercentage: Math.round(
          (negativeMoodCount / recentMoods.length) * 100
        ),
        averageIntensity: Math.round(avgIntensity * 10) / 10,
        mostCommonMood: stats[0]?.mood || "No data",
        trendDirection:
          avgIntensity > 3 ? "high" : avgIntensity < 2 ? "low" : "moderate",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching mood stats:", error);
    res.status(500).json({
      error: "Failed to fetch mood statistics",
      message: error.message,
    });
  }
};
