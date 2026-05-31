const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files for a unified single-command deployment
app.use(express.static(path.join(__dirname, "../frontend")));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "replace_with_your_gemini_api_key") {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment or is using the default placeholder.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Helper function to safely clean and parse JSON returned by Gemini
function cleanAndParseJSON(text) {
  let cleanText = text.trim();
  // Strip Markdown code blocks if they are returned
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON parsing error. Raw output was:", text);
    throw new Error("Invalid JSON structure received from model.");
  }
}

/**
 * POST /api/generate-futureme
 * Receives reflection details and returns a structured AI-generated message from their future self.
 */
app.post("/api/generate-futureme", async (req, res) => {
  try {
    const { name, age, goal, struggle, oneYearVision, tone } = req.body;

    // Validation
    if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
      return res.status(400).json({
        success: false,
        error: "All fields (name, age, goal, struggle, oneYearVision, tone) are required."
      });
    }

    // Map tone values for natural phrasing
    const toneMap = {
      motivational: "Motivational (warm, inspiring, and supportive)",
      brutal: "Brutally Honest (direct, sharp, and no excuses)",
      mentor: "Calm Mentor (peaceful, wise, and grounded)",
      ceo: "CEO Mode (strategic, execution-heavy, and focused)"
    };
    const toneDescriptor = toneMap[tone.toLowerCase()] || tone;

    // Use Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `You are FutureMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user’s future self speaking directly to their current self.

Tone selected by user: ${toneDescriptor}

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific. Avoid generic motivation. Avoid clichés. Make it emotional but practical.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsedData = cleanAndParseJSON(responseText);

    return res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Error in /api/generate-futureme:", error);
    return res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

/**
 * POST /api/chat-futureme
 * Engages in context-aware follow-up chat with the user's future self.
 */
app.post("/api/chat-futureme", async (req, res) => {
  try {
    const { userProfile, chatHistory, question } = req.body;

    if (!userProfile || !question) {
      return res.status(400).json({
        success: false,
        error: "User profile and current question are required."
      });
    }

    const { name, age, goal, struggle, oneYearVision, tone } = userProfile;
    const toneMap = {
      motivational: "Motivational (warm, inspiring, and supportive)",
      brutal: "Brutally Honest (direct, sharp, and no excuses)",
      mentor: "Calm Mentor (peaceful, wise, and grounded)",
      ceo: "CEO Mode (strategic, execution-heavy, and focused)"
    };
    const toneDescriptor = toneMap[(tone || "mentor").toLowerCase()] || tone;

    const formattedHistory = (chatHistory || [])
      .map(chat => {
        const roleLabel = chat.role === "user" ? "Current Self" : "FutureMe";
        return `${roleLabel}: ${chat.message}`;
      })
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are FutureMe, the future version of the user who already achieved their one-year vision. Reply directly to the user’s question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are Gemini or an AI model. Speak like the future self.

User profile:
Name: ${name}
Age: ${age}
Goal: ${goal}
Struggle: ${struggle}
One-year vision: ${oneYearVision}
Tone: ${toneDescriptor}

Recent chat history:
${formattedHistory || "No previous chat history."}

Current question:
${question}

Reply in 2-5 short paragraphs. Give at least one clear action.`;

    const result = await model.generateContent(prompt);
    const replyText = result.response.text().trim();

    return res.json({
      success: true,
      reply: replyText
    });

  } catch (error) {
    console.error("Error in /api/chat-futureme:", error);
    return res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

// Fallback to serving index.html for undefined routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  FutureMe Backend Server successfully running on:`);
  console.log(`  🚀 http://localhost:${PORT}`);
  console.log(`==================================================`);
});
