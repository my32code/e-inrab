import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { findUserBySessionId } from '../models/User';
import {
  createServiceRequest,
  getUserServiceRequests,
  getServiceRequest
} from '../controllers/serviceRequestController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// Créer une nouvelle demande
router.post('/', upload.array('documents'), createServiceRequest as RequestHandler);

// Récupérer toutes les demandes de l'utilisateur
router.get('/', getUserServiceRequests as RequestHandler);

// Récupérer une demande spécifique
router.get('/:id', getServiceRequest as RequestHandler);

export default router; 