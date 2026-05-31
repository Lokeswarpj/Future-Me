const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
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
 */
app.post("/api/generate-futureme", async (req, res) => {
  try {
    const { name, age, goal, struggle, oneYearVision, tone } = req.body;

    if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
      return res.status(400).json({
        success: false,
        error: "All fields are required."
      });
    }

    const toneMap = {
      motivational: "Motivational (warm, inspiring, and supportive)",
      brutal: "Brutally Honest (direct, sharp, and no excuses)",
      mentor: "Calm Mentor (peaceful, wise, and grounded)",
      ceo: "CEO Mode (strategic, execution-heavy, and focused)"
    };
    const toneDescriptor = toneMap[tone.toLowerCase()] || tone;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `You are FutureMe, the future successful version of the user who has already achieved their one-year vision. You are not a generic motivational coach. You speak with extreme emotional intelligence, deep personal understanding, and practical wisdom. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

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
  "message": "A profound, deeply detailed 200-300 word letter from the future self. Use paragraph breaks (\\n\\n) for readability. It must contain: 1) A highly empathetic connection acknowledging their age (${age}) and their specific current struggle (${struggle}) with deep emotional resonance. 2) The exact pivotal mindset shift or transition they made to break through the friction. 3) A vivid, detailed snapshot of what their daily life looks like in 1 year having achieved the goal (${oneYearVision}).",
  "futureIdentity": "A detailed multi-sentence description (30-50 words) of who the user is becoming, capturing their daily energy, new habits, and state of mind.",
  "nextMoves": [
    "A highly tactical, step-by-step action for this week, specifically designed to bypass the struggle: ${struggle}",
    "A concrete milestone action that builds initial momentum.",
    "A repeatable daily or weekly system/routine to lock in progress."
  ],
  "habit": "One hyper-specific micro-habit (takes < 10 mins daily) to build immediate consistency.",
  "warning": "A warning about a specific psychological trap, habit, or procrastination loop they will face, detailing the exact trigger and how to avoid it.",
  "mantra": "A powerful, memorable daily mantra."
}

Avoid all generic platitudes and cliches. Make every field highly personalized, emotionally resonant, and extremely tactical.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = cleanAndParseJSON(responseText);

    return res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Error in /api/generate-futureme (Vercel):", error);
    return res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

/**
 * POST /api/chat-futureme
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
    console.error("Error in /api/chat-futureme (Vercel):", error);
    return res.status(500).json({
      success: false,
      error: "FutureMe could not respond right now. Try again."
    });
  }
});

// Export the Express app for Vercel serverless integration
module.exports = app;
