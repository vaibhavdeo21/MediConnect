const pool = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateFallbackMedicalResponse = (userQuery, userName) => {
  const query = userQuery.trim().toLowerCase();
  
  // Greetings
  if (['hi', 'hello', 'hey', 'hi there', 'hello there', 'good morning', 'good evening', 'greetings'].includes(query) || query.length <= 3) {
    return `Hello **${userName}**! 👋\n\nI am your **MediConnect AI Health Assistant**. How can I help you today?\n\nYou can ask me about:\n- Symptom explanations\n- Diet and nutrition advice\n- Medicine information & PM Jan Aushadhi generic options\n- Preparing for a doctor visit`;
  }

  // Emergency / Severe symptoms
  if (query.includes("chest pain") || query.includes("heart attack") || query.includes("breathing") || query.includes("emergency") || query.includes("stroke") || query.includes("severe pain")) {
    return `🚨 **URGENT MEDICAL NOTICE**\n\nHello **${userName}**,\n\nIf you are experiencing severe symptoms such as **chest pain, acute shortness of breath, or sudden numbness**, please seek **immediate emergency medical attention**.\n\nYou can also use the **Emergency SOS** feature in MediConnect to request a priority call from an available doctor.\n\n*Disclaimer: This is automated guidance. Please consult a qualified physician immediately.*`;
  }
  
  // Cold / Fever / Common symptoms
  if (query.includes("cold") || query.includes("fever") || query.includes("cough") || query.includes("headache") || query.includes("flu") || query.includes("throat")) {
    return `🩺 **Symptom Guidance: Cold & Fever**\n\nHello **${userName}**,\n\nHere are general self-care recommendations:\n\n1. **Hydration**: Drink warm water or herbal tea (such as Tulsi / Ginger tea).\n2. **Rest**: Get adequate sleep to allow your body to recover.\n3. **Relief**: Over-the-counter medication like Paracetamol (or PM Jan Aushadhi generic equivalents) can help manage fever and body aches.\n4. **Doctor Visit**: If your fever exceeds 101°F (38.3°C) or persists for more than 3 days, please book an appointment with a General Physician on MediConnect.\n\n*Disclaimer: This is AI-generated advice. Please consult your MediConnect doctor for a formal diagnosis.*`;
  }

  // Chronic conditions / Lifestyle
  if (query.includes("diabetes") || query.includes("sugar") || query.includes("diet") || query.includes("blood pressure") || query.includes("bp") || query.includes("weight")) {
    return `🥗 **Lifestyle & Metabolic Health Advice**\n\nHello **${userName}**,\n\nKey health recommendations:\n\n1. **Diet**: Focus on high-fiber whole grains, leafy greens, and lean protein while limiting refined sugars and excessive sodium.\n2. **Daily Activity**: Aim for 30 minutes of moderate exercise like brisk walking daily.\n3. **Regular Tracking**: Keep a log of your blood sugar or blood pressure readings to share with your doctor.\n\n*Disclaimer: This is AI-generated advice. Please consult your MediConnect doctor for a formal diagnosis.*`;
  }

  // General response
  return `📋 **MediConnect Health Guidance**\n\nHello **${userName}**,\n\nRegarding your query: *"${userQuery}"*\n\nHere are general health principles:\n- **Stay Hydrated & Rested**: Drink plenty of fluids and maintain 7-8 hours of regular sleep.\n- **Affordable Care**: Ask your pharmacist about quality PM Jan Aushadhi generic medicine options.\n- **Professional Care**: If your symptoms persist or cause concern, consider scheduling a consultation with a specialist on MediConnect.\n\n*Disclaimer: This is AI-generated advice. Please consult your MediConnect doctor for a formal diagnosis.*`;
};

const chatWithGemini = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;
    const isPremium = req.isPremium || false;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Rate Limiting
    const today = new Date().toISOString().split('T')[0];
    let usageResult = await pool.query(
      "SELECT message_count FROM ai_usage WHERE user_id = $1 AND usage_date = $2",
      [userId, today]
    );

    let messageCount = 0;
    if (usageResult.rows.length > 0) {
      messageCount = usageResult.rows[0].message_count;
    }

    if (!isPremium && messageCount >= 5) {
      return res.status(429).json({
        error: 'Daily limit reached',
        limit: 5,
        used: messageCount,
        isPremium: false,
        upgradeUrl: '/subscribe'
      });
    }

    // Get or Create Conversation
    let currentConvId = conversationId;
    let title = "New Conversation";
    if (!currentConvId) {
      title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
      const convResult = await pool.query(
        "INSERT INTO ai_conversations (user_id, title) VALUES ($1, $2) RETURNING id",
        [userId, title]
      );
      currentConvId = convResult.rows[0].id;
    } else {
      // Verify ownership
      const checkConv = await pool.query(
        "SELECT id, title FROM ai_conversations WHERE id = $1 AND user_id = $2 AND is_deleted = false",
        [currentConvId, userId]
      );
      if (checkConv.rows.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      title = checkConv.rows[0].title;
    }

    // Build User Context: Query patients, doctors, or users table for full_name, fallback to email prefix
    let userName = 'User';
    const nameRes = await pool.query(`
      SELECT COALESCE(p.full_name, d.full_name, u.full_name, INITCAP(SPLIT_PART(u.email, '@', 1))) as name
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.id = $1
    `, [userId]).catch(() => ({ rows: [] }));

    if (nameRes.rows.length > 0 && nameRes.rows[0].name) {
      userName = nameRes.rows[0].name;
    }

    const appointmentsResult = await pool.query(
      `SELECT appointment_date, status FROM appointments 
       WHERE patient_id = (SELECT id FROM patients WHERE user_id = $1) AND appointment_date >= CURRENT_DATE`,
      [userId]
    ).catch(() => ({ rows: [] }));
    const appointments = appointmentsResult.rows || [];

    const prescriptionsResult = await pool.query(
      `SELECT medicines FROM prescriptions WHERE appointment_id IN 
       (SELECT id FROM appointments WHERE patient_id = (SELECT id FROM patients WHERE user_id = $1))`,
      [userId]
    ).catch(() => ({ rows: [] }));
    const prescriptions = prescriptionsResult.rows || [];

    const systemInstruction = `
      You are MediConnect AI Health Assistant.
      User's name: ${userName}.
      Upcoming appointments: ${JSON.stringify(appointments)}.
      Active prescriptions: ${JSON.stringify(prescriptions)}.
      Formatting rules:
      - Use clean, well-spaced Markdown with bold text (**text**), lists (- or 1.), and line breaks.
      - Never diagnose, always recommend consulting a doctor.
      - If dangerous symptoms detected, urgently recommend emergency booking.
      - Be aware of the Indian healthcare context (e.g., generic medicines, dietary tips).
    `;

    // Load Chat History
    const historyResult = await pool.query(
      `SELECT role, content FROM ai_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC LIMIT 20`,
      [currentConvId]
    ).catch(() => ({ rows: [] }));
    
    const history = (historyResult.rows || []).reverse().map(row => ({
      role: row.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: row.content }]
    }));

    let reply = "";
    try {
      const chat = model.startChat({
        history,
        systemInstruction
      });

      const result = await chat.sendMessage([{ text: message }]);
      reply = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini API Quota/Network Issue -> Using MediConnect AI Fallback Engine:", geminiError.message);
      reply = generateFallbackMedicalResponse(message, userName);
    }

    // Save messages to DB
    await pool.query(
      "INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1, 'user', $2)",
      [currentConvId, message]
    );
    await pool.query(
      "INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1, 'assistant', $2)",
      [currentConvId, reply]
    );

    // Update conversation updated_at
    await pool.query(
      "UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1",
      [currentConvId]
    );

    // Increment Usage
    await pool.query(
      `INSERT INTO ai_usage (user_id, usage_date, message_count) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (user_id, usage_date) 
       DO UPDATE SET message_count = ai_usage.message_count + 1`,
      [userId, today]
    );
    messageCount++;

    res.json({
      reply,
      conversationId: currentConvId,
      title,
      usage: {
        used: messageCount,
        limit: isPremium ? 'unlimited' : 5,
        isPremium
      }
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat request" });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT c.*, 
       (SELECT COUNT(*) FROM ai_messages m WHERE m.conversation_id = c.id) as message_count 
       FROM ai_conversations c 
       WHERE c.user_id = $1 AND c.is_deleted = false 
       ORDER BY c.is_pinned DESC, c.updated_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const checkConv = await pool.query(
      "SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2 AND is_deleted = false",
      [id, userId]
    );
    if (checkConv.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const result = await pool.query(
      "SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "INSERT INTO ai_conversations (user_id, title) VALUES ($1, 'New Conversation') RETURNING *",
      [userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Create Conversation Error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await pool.query(
      "UPDATE ai_conversations SET is_deleted = true WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found or already deleted" });
    }
    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

const renameConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;
    
    if (!title) return res.status(400).json({ error: "Title is required" });

    const result = await pool.query(
      "UPDATE ai_conversations SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *",
      [title, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Rename Conversation Error:", error);
    res.status(500).json({ error: "Failed to rename conversation" });
  }
};

const pinConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      "UPDATE ai_conversations SET is_pinned = NOT is_pinned, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Pin Conversation Error:", error);
    res.status(500).json({ error: "Failed to pin conversation" });
  }
};

const getAIUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const isPremium = req.isPremium || false;
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      "SELECT message_count FROM ai_usage WHERE user_id = $1 AND usage_date = $2",
      [userId, today]
    );

    const used = result.rows.length > 0 ? result.rows[0].message_count : 0;
    const limit = isPremium ? 'unlimited' : 5;
    const remaining = isPremium ? 'unlimited' : Math.max(0, 5 - used);

    res.json({
      used,
      limit,
      isPremium,
      remaining
    });
  } catch (error) {
    console.error("Get AI Usage Error:", error);
    res.status(500).json({ error: "Failed to get AI usage" });
  }
};

module.exports = {
  chatWithGemini,
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  renameConversation,
  pinConversation,
  getAIUsage
};