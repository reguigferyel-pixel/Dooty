const express = require('express');
const { OpenAI } = require('openai');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Initialisation de l'IA
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  // Si tu utilises Groq, décommente la ligne suivante :
   baseURL: "https://api.groq.com/openai/v1", 
});

// Route POST pour envoyer un message à l'IA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, tasks } = req.body;

    // On prépare le contexte pour l'IA (tu peux lui donner les tâches de l'utilisateur)
    const systemPrompt = `Tu es Dooty AI, un coach de productivité personnel. 
    Voici les tâches actuelles de l'utilisateur : ${JSON.stringify(tasks)}. 
    Réponds de manière encourageante et concise pour aider l'utilisateur à s'organiser.`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Erreur avec l'IA :", error);
    res.status(500).json({ error: "L'IA n'a pas pu répondre." });
  }
});

module.exports = router;