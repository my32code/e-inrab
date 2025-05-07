import { Router, RequestHandler } from 'express';
import { createCommande, getUserCommandes, getCommande } from '../controllers/commandesController';
import { Request, Response } from 'express';
import { findUserBySessionId } from '../models/User';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

const router = Router();

const authenticateRequest = async (req: Request, res: Response, next: Function) => {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await findUserBySessionId(sessionId);
    if (!user || !user.id) {
        return res.status(401).json({ error: 'Session invalide' });
    }

    (req as AuthenticatedRequest).user = user as User;
    next();
};

// Routes protégées par authentification
router.use(authenticateRequest as RequestHandler);

// Créer une nouvelle commande
router.post('/', ((req: Request, res: Response) => createCommande(req as AuthenticatedRequest, res)) as RequestHandler);

// Récupérer toutes les commandes de l'utilisateur
router.get('/', ((req: Request, res: Response) => getUserCommandes(req as AuthenticatedRequest, res)) as RequestHandler);

// Récupérer une commande spécifique
router.get('/:id', ((req: Request, res: Response) => getCommande(req as AuthenticatedRequest, res)) as RequestHandler);

export default router; 