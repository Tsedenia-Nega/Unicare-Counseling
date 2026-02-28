import dotenv from "dotenv";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Load environment variables
dotenv.config();

const testAIConnection = async () => {
  console.log("🔍 Starting AI Debug Test...");
  console.log("=".repeat(50));

  // 1. Check environment variables
  console.log("1. Environment Variables:");
  console.log("   OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
  console.log(
    "   API Key length:",
    process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
  );
  console.log(
    "   API Key starts with 'sk-':",
    process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.startsWith("sk-")
      : false
  );
  console.log("");

  // 2. Check if AI SDK is installed
  console.log("2. Checking AI SDK Installation:");
  try {
    console.log("   ✅ AI SDK modules loaded successfully");
  } catch (error) {
    console.log("   ❌ AI SDK modules failed to load:", error.message);
    console.log("   💡 Try running: npm install ai @ai-sdk/openai");
    return;
  }
  console.log("");

  // 3. Test basic AI call
  console.log("3. Testing Basic AI Call:");
  if (!process.env.OPENAI_API_KEY) {
    console.log("   ❌ No API key found - skipping AI test");
    return;
  }

  try {
    console.log("   🤖 Making test API call...");
    const startTime = Date.now();

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Say exactly: 'AI_TEST_SUCCESS'",
      maxTokens: 10,
    });

    const endTime = Date.now();
    console.log("   ✅ API call completed in", endTime - startTime, "ms");
    console.log("   📝 Response:", text);
    console.log(
      "   🎯 Test result:",
      text.includes("AI_TEST_SUCCESS") ? "SUCCESS" : "UNEXPECTED_RESPONSE"
    );
  } catch (error) {
    console.log("   ❌ API call failed:", error.message);
    console.log("   🔍 Error details:", error);

    // Common error analysis
    if (error.message.includes("401")) {
      console.log(
        "   💡 This looks like an authentication error - check your API key"
      );
    } else if (error.message.includes("429")) {
      console.log("   💡 Rate limit exceeded - wait a moment and try again");
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      console.log("   💡 Network error - check your internet connection");
    }
  }
  console.log("");

  // 4. Test mood recommendation format
  console.log("4. Testing Mood Recommendation Format:");
  try {
    const testPrompt = `
Based on this mood: sad (intensity: 3): feeling lonely today

Provide exactly 1 recommendation in this JSON format:
{
  "recommendations": [
    {
      "type": "social",
      "title": "Connect with someone",
      "description": "Reach out to a friend or family member",
      "urgency": "medium",
      "timeToComplete": "15-30 minutes",
      "aiGenerated": true
    }
  ]
}
`;

    console.log("   🤖 Testing mood recommendation generation...");
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: testPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log("   📝 Raw AI response:");
    console.log("   " + text.substring(0, 200) + "...");

    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("   ✅ JSON parsing successful");
        console.log(
          "   📊 Recommendations found:",
          parsed.recommendations?.length || 0
        );
      } catch (parseError) {
        console.log("   ❌ JSON parsing failed:", parseError.message);
      }
    } else {
      console.log("   ❌ No JSON found in response");
    }
  } catch (error) {
    console.log("   ❌ Mood recommendation test failed:", error.message);
  }
};

// Run the test
testAIConnection().catch(console.error);
