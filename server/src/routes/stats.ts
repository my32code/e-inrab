import express from 'express';
import { getServiceStats, getOrderStats, getTransactionStats } from '../controllers/statsController';
import { findUserBySessionId } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

// Middleware d'authentification
const authenticateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
    }

  findUserBySessionId(sessionId)
    .then(user => {
      if (!user || !user.id) {
        res.status(401).json({ error: 'Session invalide' });
        return;
    }

    // Attacher l'utilisateur à la requête
      (req as AuthenticatedRequest).user = {
        id: user.id,
        nom: user.nom || '',
        email: user.email || '',
        role: user.role || ''
      };
    next();
    })
    .catch(error => {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Non authentifié' });
    });
};

// Routes protégées par authentification
router.use(authenticateRequest);

// Wrapper pour convertir les types
const wrapHandler = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) => {
  return (req: Request, res: Response) => handler(req as AuthenticatedRequest, res);
};

// Routes des statistiques
router.get('/services', wrapHandler(getServiceStats));
router.get('/orders', wrapHandler(getOrderStats));
router.get('/transactions', wrapHandler(getTransactionStats));

export default router; 