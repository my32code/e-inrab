// src/routes/servicesRoutes.ts
import express from 'express';
import { pool } from '../services/db';

const router = express.Router();

// GET /api/services
router.get('/', async (req, res) => {
  console.log('⏳ Début de la récupération des services...');
  console.log('📦 Headers de la requête:', req.headers);

  try {
    console.log('🔍 Exécution de la requête SQL...');
    const [rows] = await pool.query('SELECT * FROM services'); // Adaptez à votre DB
    console.log('✅ Requête SQL exécutée avec succès');
    console.log('📦 Résultat:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Erreur DB:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;