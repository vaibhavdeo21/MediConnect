const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Add GEMINI_API_KEY to .env

const chatWithGemini = async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `
      You are a helpful AI Medical Assistant for MediConnect. 
      Answer the following health query briefly and professionally. 
      Disclaimer: Always remind the user to consult a real doctor for serious issues.
      User Query: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
};

module.exports = { chatWithGemini };