const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
router.use(authMiddleware);

const categorieSchema = z.object({
  nom: z.string().min(2).max(50),
  couleur: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// GET /api/categories
router.get('/', async (req, res) => {
  const categories = await prisma.categorie.findMany({
    where: { utilisateurId: req.userId },
    include: { _count: { select: { taches: true } } },
  });
  res.json(categories);
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const data = categorieSchema.parse(req.body);
    const categorie = await prisma.categorie.create({
      data: { ...data, utilisateurId: req.userId },
    });
    res.status(201).json(categorie);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    if (err.code === 'P2002') return res.status(400).json({ error: 'Cette catégorie existe déjà.' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const data = categorieSchema.partial().parse(req.body);
    const result = await prisma.categorie.updateMany({
      where: { id: Number(req.params.id), utilisateurId: req.userId },
      data,
    });
    if (result.count === 0) return res.status(404).json({ error: 'Catégorie introuvable.' });
    res.json({ message: 'Catégorie mise à jour.' });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  const result = await prisma.categorie.deleteMany({
    where: { id: Number(req.params.id), utilisateurId: req.userId },
  });
  if (result.count === 0) return res.status(404).json({ error: 'Catégorie introuvable.' });
  res.json({ message: 'Catégorie supprimée. Les tâches associées ne sont pas supprimées.' });
});

module.exports = router;