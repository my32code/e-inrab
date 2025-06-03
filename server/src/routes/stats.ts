import express, { RequestHandler } from 'express';
import { getServiceStats, getOrderStats, getTransactionStats } from '../controllers/statsController';
import { findUserBySessionId } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware d'authentification
const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await findUserBySessionId(sessionId);
    
    if (!user) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    // Attacher l'utilisateur à la requête
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Non authentifié' });
  }
};

// Routes protégées par authentification
router.use(authenticateRequest as RequestHandler);

// Routes des statistiques
router.get('/services', getServiceStats);
router.get('/orders', getOrderStats);
router.get('/transactions', getTransactionStats);

export default router; 