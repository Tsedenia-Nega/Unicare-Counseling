import { VALID_MOODS, INTENSITY_LEVELS } from "./utils/constants.js";

// Validate mood entry data
export const validateMoodEntry = (req, res, next) => {
  const { mood, intensity, notes } = req.body;

  // Check required fields
  if (!mood || intensity === undefined) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Mood and intensity are required",
      received: { mood, intensity },
    });
  }

  // Validate mood value
  if (!VALID_MOODS.includes(mood)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Invalid mood value",
      validMoods: VALID_MOODS,
      received: mood,
    });
  }

  // Validate intensity
  if (
    !Number.isInteger(intensity) ||
    intensity < INTENSITY_LEVELS.VERY_LOW ||
    intensity > INTENSITY_LEVELS.VERY_HIGH
  ) {
    return res.status(400).json({
      error: "Validation failed",
      message: `Intensity must be an integer between ${INTENSITY_LEVELS.VERY_LOW} and ${INTENSITY_LEVELS.VERY_HIGH}`,
      received: intensity,
    });
  }

  // Validate notes length
  if (notes && typeof notes !== "string") {
    return res.status(400).json({
      error: "Validation failed",
      message: "Notes must be a string",
      received: typeof notes,
    });
  }

  if (notes && notes.length > 500) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Notes cannot exceed 500 characters",
      received: notes.length,
    });
  }

  next();
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  const { limit, page } = req.query;

  if (limit) {
    const limitNum = Number.parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Limit must be a number between 1 and 100",
        received: limit,
      });
    }
  }

  if (page) {
    const pageNum = Number.parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Page must be a positive number",
        received: page,
      });
    }
  }

  next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  // Simple ObjectId validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Invalid ID format",
      received: id,
    });
  }

  next();
};
