// Mood-related constants
export const VALID_MOODS = [
  "happy",
  "sad",
  "anxious",
  "calm",
  "angry",
  "excited",
  "tired",
  "stressed",
];

export const NEGATIVE_MOODS = new Set(["sad", "anxious", "angry", "stressed"]);
export const POSITIVE_MOODS = new Set(["happy", "excited", "calm"]);

export const INTENSITY_LEVELS = {
  VERY_LOW: 1,
  LOW: 2,
  MODERATE: 3,
  HIGH: 4,
  VERY_HIGH: 5,
};

export const RECOMMENDATION_TYPES = [
  "exercise",
  "meditation",
  "social",
  "therapy",
  "article",
  "music",
  "breathing",
  "sleep",
];

export const URGENCY_LEVELS = ["low", "medium", "high"];

export const TIME_ESTIMATES = [
  "5-10 minutes",
  "15-30 minutes",
  "1 hour",
  "ongoing",
];

// API Configuration
export const API_CONFIG = {
  OPENAI_MODEL: "gpt-4o-mini",
  MAX_TOKENS: 800,
  TEMPERATURE: 0.7,
  MAX_MOODS_FOR_ANALYSIS: 10,
  MAX_MOODS_FOR_AI_CONTEXT: 5,
};

// Database Configuration
export const DB_CONFIG = {
  DEFAULT_USER_ID: "default_user",
  DEFAULT_PAGINATION_LIMIT: 50,
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_STATS_PERIOD_DAYS: 30,
};
