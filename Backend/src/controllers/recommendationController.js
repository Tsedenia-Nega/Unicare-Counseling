import Mood from "../models/mood.js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Generate AI recommendations
export const generateRecommendations = async (req, res) => {
  try {
    const { recentMoods } = req.body;

    let moodsToAnalyze = recentMoods;

    // If no recent moods provided, fetch from database
    if (!moodsToAnalyze || !Array.isArray(moodsToAnalyze)) {
      moodsToAnalyze = await Mood.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();
    }

    if (moodsToAnalyze.length === 0) {
      return res.status(400).json({
        error: "No mood data available",
        message: "Please record some mood entries first",
      });
    }

    // Analyze mood patterns
    const analysis = analyzeMoodPatterns(moodsToAnalyze);

    // 🔍 ENHANCED DEBUG LOGGING
    console.log("🔍 DEBUG: Starting recommendation generation");
    console.log("📊 Moods to analyze:", moodsToAnalyze.length);
    console.log("🎯 Dominant mood:", analysis.dominant);
    console.log("🔑 API Key present:", !!process.env.OPENAI_API_KEY);
    console.log("🧪 Test mode:", process.env.TEST_FALLBACK === "true");

    // Generate recommendations based on analysis
    const { recommendations, source, aiResponse, error } =
      await getAIRecommendations(analysis, moodsToAnalyze);

    console.log("✅ Recommendations generated:", recommendations.length);
    console.log("📍 Source:", source);

    res.json({
      recommendations,
      analysis,
      basedOnEntries: moodsToAnalyze.length,
      // 🔍 ENHANCED DEBUG INFO
      debug: {
        source,
        aiWorking: source === "ai",
        aiError: error || null,
        timestamp: new Date().toISOString(),
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        apiKeyLength: process.env.OPENAI_API_KEY
          ? process.env.OPENAI_API_KEY.length
          : 0,
        testMode: process.env.TEST_FALLBACK === "true",
        nodeEnv: process.env.NODE_ENV,
        rawAiResponse:
          source === "ai" ? aiResponse?.substring(0, 200) + "..." : null,
      },
    });
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    res.status(500).json({
      error: "Failed to generate recommendations",
      message: error.message,
      debug: {
        source: "error",
        aiWorking: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

// Analyze mood patterns using modern JS features
export const analyzeMoodPatterns = (moods) => {
  if (moods.length === 0) {
    return {
      dominant: "neutral",
      avgIntensity: 3,
      trends: [],
      moodDistribution: {},
      recentTrend: "stable",
    };
  }

  // Use Map for better performance
  const moodCounts = new Map();
  const intensities = moods.map((entry) => {
    const count = moodCounts.get(entry.mood) || 0;
    moodCounts.set(entry.mood, count + 1);
    return entry.intensity;
  });

  const totalIntensity = intensities.reduce(
    (sum, intensity) => sum + intensity,
    0
  );
  const avgIntensity = totalIntensity / moods.length;

  // Convert Map to object and find dominant mood
  const moodDistribution = Object.fromEntries(moodCounts);
  const dominant =
    [...moodCounts.entries()].sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "neutral";

  // Calculate trends using Set for better performance
  const trends = new Set();
  if (avgIntensity > 4) trends.add("high-intensity");
  if (avgIntensity < 2) trends.add("low-intensity");

  const negativeMoods = new Set(["sad", "anxious", "angry", "stressed"]);
  const positiveMoods = new Set(["happy", "excited", "calm"]);

  const negativeCount = moods.filter((m) => negativeMoods.has(m.mood)).length;
  const positiveCount = moods.filter((m) => positiveMoods.has(m.mood)).length;

  if (negativeCount > moods.length * 0.6) trends.add("negative-pattern");
  if (positiveCount > moods.length * 0.6) trends.add("positive-pattern");

  // Recent trend analysis using array methods
  let recentTrend = "stable";
  if (moods.length >= 6) {
    const recent = moods.slice(0, 3);
    const previous = moods.slice(3, 6);

    const recentAvg =
      recent.reduce((sum, m) => sum + m.intensity, 0) / recent.length;
    const previousAvg =
      previous.reduce((sum, m) => sum + m.intensity, 0) / previous.length;

    if (recentAvg > previousAvg + 0.5) recentTrend = "improving";
    if (recentAvg < previousAvg - 0.5) recentTrend = "declining";
  }

  return {
    dominant,
    avgIntensity,
    trends: [...trends], // Convert Set back to Array
    moodDistribution,
    recentTrend,
    totalEntries: moods.length,
  };
};

// 🔍 ENHANCED AI RECOMMENDATIONS WITH ES6 FEATURES
const getAIRecommendations = async (analysis, recentMoods) => {
  // Check test mode first
  if (process.env.TEST_FALLBACK === "true") {
    console.log("🧪 TEST MODE: Forcing fallback recommendations");
    return {
      recommendations: getFallbackRecommendations(
        analysis.dominant,
        analysis.trends
      ),
      source: "fallback",
      aiResponse: null,
      error: "Test mode - fallback forced",
    };
  }

  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ No OpenAI API key found");
    return {
      recommendations: getFallbackRecommendations(
        analysis.dominant,
        analysis.trends
      ),
      source: "fallback",
      aiResponse: null,
      error: "No API key configured",
    };
  }

  // Validate API key format
  if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
    console.log("❌ Invalid API key format");
    return {
      recommendations: getFallbackRecommendations(
        analysis.dominant,
        analysis.trends
      ),
      source: "fallback",
      aiResponse: null,
      error: "Invalid API key format",
    };
  }

  try {
    console.log("🤖 Attempting AI recommendation generation...");
    console.log("🔑 API Key length:", process.env.OPENAI_API_KEY.length);

    const moodSummary = recentMoods
      .slice(0, 5)
      .map(
        (m) => `${m.mood} (intensity: ${m.intensity}): ${m.notes || "No notes"}`
      )
      .join("\n");

    const prompt = `You are a mental health assistant. Based on the mood data below, provide exactly 3-4 recommendations.

Recent Mood Entries:
${moodSummary}

Analysis:
- Dominant mood: ${analysis.dominant}
- Average intensity: ${analysis.avgIntensity.toFixed(1)}
- Recent trend: ${analysis.recentTrend}

Respond with ONLY this JSON format (no other text):
{
  "recommendations": [
    {
      "type": "exercise",
      "title": "Short actionable title",
      "description": "Specific helpful advice in 50-80 words",
      "urgency": "low",
      "timeToComplete": "10-15 minutes",
      "aiGenerated": true
    }
  ]
}

Types: exercise, meditation, social, therapy, article, music, breathing, sleep
Urgency: low, medium, high
Time: 5-10 minutes, 15-30 minutes, 1 hour, ongoing`;

    console.log("📤 Sending request to OpenAI...");
    const startTime = Date.now();

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 800,
    });

    const endTime = Date.now();
    console.log(`✅ AI response received in ${endTime - startTime}ms`);
    console.log("📝 Raw response length:", result.text.length);

    // Parse the AI response using modern JS
    const cleanedText = result.text.trim();
    console.log("🔍 First 100 chars:", cleanedText.substring(0, 100));

    let parsed;
    try {
      // Try to find JSON in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the entire response
        parsed = JSON.parse(cleanedText);
      }
    } catch (parseError) {
      console.log("❌ JSON parsing failed:", parseError.message);
      console.log("📝 Raw response:", cleanedText);
      return {
        recommendations: getFallbackRecommendations(
          analysis.dominant,
          analysis.trends
        ),
        source: "fallback",
        aiResponse: cleanedText,
        error: `JSON parsing failed: ${parseError.message}`,
      };
    }

    const recommendations = parsed.recommendations || [];
    if (recommendations.length === 0) {
      console.log("❌ No recommendations found in parsed response");
      return {
        recommendations: getFallbackRecommendations(
          analysis.dominant,
          analysis.trends
        ),
        source: "fallback",
        aiResponse: cleanedText,
        error: "No recommendations in AI response",
      };
    }

    // Mark all recommendations as AI-generated using spread operator
    const markedRecommendations = recommendations.map((rec) => ({
      ...rec,
      aiGenerated: true,
      source: "openai-gpt4o-mini",
    }));

    console.log(
      `🎯 Successfully generated ${markedRecommendations.length} AI recommendations`
    );

    return {
      recommendations: markedRecommendations,
      source: "ai",
      aiResponse: cleanedText,
      error: null,
    };
  } catch (error) {
    console.error("❌ AI generation failed:", error.message);
    console.error("🔍 Full error:", error);

    // Analyze the error using template literals
    let errorMessage = error.message;
    if (error.message.includes("401")) {
      errorMessage = "Authentication failed - check API key";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded - try again later";
    } else if (error.message.includes("fetch")) {
      errorMessage = "Network error - check internet connection";
    }

    return {
      recommendations: getFallbackRecommendations(
        analysis.dominant,
        analysis.trends
      ),
      source: "fallback",
      aiResponse: null,
      error: errorMessage,
    };
  }
};

// Fallback recommendations using ES6 features
const getFallbackRecommendations = (dominantMood, trends) => {
  console.log("📋 Using fallback recommendations for mood:", dominantMood);

  const baseRecommendations = {
    sad: [
      {
        type: "exercise",
        title: "Take a 10-minute walk outside",
        description:
          "Light physical activity and sunlight can boost mood through endorphin release and vitamin D. Start with just 10 minutes around your neighborhood or local park.",
        urgency: "medium",
        timeToComplete: "10-15 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
      {
        type: "social",
        title: "Connect with a friend or family member",
        description:
          "Reach out to someone you trust. Social connection is crucial for mental wellbeing. Send a text, make a call, or arrange to meet for coffee.",
        urgency: "high",
        timeToComplete: "15-30 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
    ],
    anxious: [
      {
        type: "breathing",
        title: "Practice 4-7-8 breathing technique",
        description:
          "Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 times. This activates your parasympathetic nervous system and reduces anxiety quickly.",
        urgency: "high",
        timeToComplete: "5-10 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
      {
        type: "article",
        title: "Learn anxiety management techniques",
        description:
          "Explore evidence-based strategies for managing anxiety including cognitive behavioral techniques and mindfulness practices.",
        urgency: "medium",
        timeToComplete: "15-30 minutes",
        url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/tips-to-reduce-anxiety/",
        aiGenerated: false,
        source: "fallback-predefined",
      },
    ],
    stressed: [
      {
        type: "meditation",
        title: "Try progressive muscle relaxation",
        description:
          "Systematically tense and relax each muscle group from toes to head. This helps release physical tension and calms the mind.",
        urgency: "medium",
        timeToComplete: "15-20 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
      {
        type: "exercise",
        title: "Do a stress-relief workout",
        description:
          "Physical activity helps process stress hormones and releases mood-boosting endorphins. Try yoga, dancing, or a quick cardio session.",
        urgency: "medium",
        timeToComplete: "20-30 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
    ],
    angry: [
      {
        type: "breathing",
        title: "Practice deep breathing exercises",
        description:
          "Take slow, deep breaths to activate your body's relaxation response. Count to 10 while breathing deeply before reacting to situations.",
        urgency: "high",
        timeToComplete: "5-10 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
      {
        type: "exercise",
        title: "Channel energy through physical activity",
        description:
          "Use physical movement to release anger constructively. Try running, boxing a pillow, or doing jumping jacks to burn off intense energy.",
        urgency: "medium",
        timeToComplete: "15-30 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
    ],
    default: [
      {
        type: "meditation",
        title: "Practice 5-minute mindfulness",
        description:
          "Start with simple mindful breathing to center yourself and improve emotional awareness. Focus on the present moment without judgment.",
        urgency: "low",
        timeToComplete: "5-10 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
      {
        type: "article",
        title: "Explore mental health resources",
        description:
          "Learn about evidence-based strategies for maintaining good mental health and emotional wellbeing through trusted resources.",
        urgency: "low",
        timeToComplete: "15-30 minutes",
        aiGenerated: false,
        source: "fallback-predefined",
      },
    ],
  };

  const recommendations = [
    ...(baseRecommendations[dominantMood] || baseRecommendations.default),
  ];

  // Add urgent recommendations for concerning patterns using array methods
  if (trends.includes("negative-pattern")) {
    recommendations.unshift({
      type: "therapy",
      title: "Consider speaking with a counselor",
      description:
        "You've been experiencing challenging emotions consistently. A mental health professional can provide personalized strategies and support.",
      urgency: "high",
      timeToComplete: "ongoing",
      url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/",
      aiGenerated: false,
      source: "fallback-predefined",
    });
  }

  return recommendations;
};

// Enhanced test AI connection with async/await
export const testAIConnection = async (req, res) => {
  try {
    console.log("🧪 Testing AI connection...");

    const hasApiKey = !!process.env.OPENAI_API_KEY;
    console.log("🔑 API Key present:", hasApiKey);

    if (!hasApiKey) {
      return res.json({
        status: "no-api-key",
        message: "OpenAI API key not configured",
        canUseAI: false,
        debug: {
          apiKeyPresent: false,
          apiKeyLength: 0,
        },
      });
    }

    console.log("🔑 API Key length:", process.env.OPENAI_API_KEY.length);
    console.log(
      "🔑 API Key format valid:",
      process.env.OPENAI_API_KEY.startsWith("sk-")
    );

    // Test a simple AI call
    const startTime = Date.now();
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Respond with exactly: 'AI_TEST_SUCCESS'",
      maxTokens: 10,
    });
    const endTime = Date.now();

    const isWorking = text.includes("AI_TEST_SUCCESS");
    console.log("🎯 AI test result:", isWorking ? "SUCCESS" : "UNEXPECTED");
    console.log("📝 AI response:", text);

    res.json({
      status: isWorking ? "working" : "unexpected-response",
      message: isWorking
        ? "AI is working correctly"
        : "AI response was unexpected",
      canUseAI: isWorking,
      responseTime: `${endTime - startTime}ms`,
      response: text,
      debug: {
        apiKeyPresent: true,
        apiKeyLength: process.env.OPENAI_API_KEY.length,
        apiKeyFormat: process.env.OPENAI_API_KEY.startsWith("sk-"),
        responseLength: text.length,
      },
    });
  } catch (error) {
    console.error("❌ AI test failed:", error.message);
    res.json({
      status: "error",
      message: error.message,
      canUseAI: false,
      error: error.message,
      debug: {
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        errorType: error.constructor.name,
        errorMessage: error.message,
      },
    });
  }
};
