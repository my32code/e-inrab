import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { findUserBySessionId } from '../models/User';
import { generateFacture, getFacture } from '../controllers/facturesController';

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
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Appliquer le middleware d'authentification à toutes les routes
router.use(authenticateRequest as RequestHandler);

// Routes protégées
router.post("/generate", ((req: Request, res: Response) =>
    generateFacture(req as AuthenticatedRequest, res)) as RequestHandler);

router.post("/get", ((req: Request, res: Response) =>
    getFacture(req as AuthenticatedRequest, res)) as RequestHandler);

export default router;