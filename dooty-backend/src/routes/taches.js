const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
router.use(authMiddleware);

const tacheSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(120),
  description: z.string().optional(),
  statut: z.enum(['A_FAIRE', 'EN_COURS', 'TERMINEE']).optional(),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE']).optional(),
  echeance: z.string().datetime().optional().nullable(),
  categorieId: z.number().optional().nullable(),
});

// GET /api/taches?statut=&priorite=&categorieId=&search=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { statut, priorite, categorieId, search, page = 1, limit = 20 } = req.query;
    const where = { utilisateurId: req.userId };

    if (statut) where.statut = statut;
    if (priorite) where.priorite = priorite;
    if (categorieId) where.categorieId = Number(categorieId);
    if (search) where.titre = { contains: search };

    const taches = await prisma.tache.findMany({
      where,
      include: { categorie: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { creeLe: 'desc' },
    });

    const total = await prisma.tache.count({ where });

    res.json({ taches, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/taches/:id
router.get('/:id', async (req, res) => {
  const tache = await prisma.tache.findFirst({
    where: { id: Number(req.params.id), utilisateurId: req.userId },
    include: { categorie: true },
  });
  if (!tache) return res.status(404).json({ error: 'Tâche introuvable.' });
  res.json(tache);
});

// POST /api/taches
router.post('/', async (req, res) => {
  try {
    const data = tacheSchema.parse(req.body);
    const tache = await prisma.tache.create({
      data: { ...data, utilisateurId: req.userId },
      include: { categorie: true },
    });
    res.status(201).json(tache);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/taches/:id
router.put('/:id', async (req, res) => {
  try {
    const data = tacheSchema.partial().parse(req.body);
    const result = await prisma.tache.updateMany({
      where: { id: Number(req.params.id), utilisateurId: req.userId },
      data,
    });
    if (result.count === 0) return res.status(404).json({ error: 'Tâche introuvable.' });
    const tache = await prisma.tache.findUnique({ where: { id: Number(req.params.id) } });
    res.json(tache);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/taches/:id/statut
router.patch('/:id/statut', async (req, res) => {
  const { statut } = req.body;
  if (!['A_FAIRE', 'EN_COURS', 'TERMINEE'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }
  const result = await prisma.tache.updateMany({
    where: { id: Number(req.params.id), utilisateurId: req.userId },
    data: { statut },
  });
  if (result.count === 0) return res.status(404).json({ error: 'Tâche introuvable.' });
  res.json({ message: 'Statut mis à jour.' });
});

// DELETE /api/taches/:id
router.delete('/:id', async (req, res) => {
  const result = await prisma.tache.deleteMany({
    where: { id: Number(req.params.id), utilisateurId: req.userId },
  });
  if (result.count === 0) return res.status(404).json({ error: 'Tâche introuvable.' });
  res.json({ message: 'Tâche supprimée.' });
});

module.exports = router;