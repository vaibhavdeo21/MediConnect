const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Ensure the API key is being read correctly from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // FIX: Switched to gemini-2.0-flash which is the current stable standard 
    // and resolves the 404 "model not found" error for v1beta.
    // Replace whatever model line you have with this specific one:
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    const prompt = `
      You are the "MediConnect Elite AI Assistant," a premium medical concierge for users in India.
      Your goal is to provide brief, high-end medical FAQs and health tips.
      
      Contextual Guidelines:
      1. Suggest Generic Medicines (PM Jan Aushadhi Pariyojana) when appropriate for cost-effectiveness.
      2. Mention common Indian dietary health boosts (e.g., Turmeric/Haldi, Ashwagandha, Tulsi) but emphasize they don't replace clinical medicine.
      3. Understand Indian climate-related health issues (Heatstroke, Monsoon-related Dengue/Malaria precautions).
      4. Use a professional, empathetic, and luxury tone.
      
      STRICT RULE: Always end with: "Disclaimer: This is AI-generated advice. Please consult your MediConnect doctor for a formal diagnosis."
      
      User Query: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({ error: "MediConnect AI is currently over-capacity. Please try again." });
  }
};

module.exports = { chatWithGemini };