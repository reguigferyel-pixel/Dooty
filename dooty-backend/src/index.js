const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tachesRoutes = require('./routes/taches');
const categoriesRoutes = require('./routes/categories');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/taches', tachesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dooty API fonctionne 🚀' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Dooty Backend démarré sur http://localhost:${PORT}`);
});