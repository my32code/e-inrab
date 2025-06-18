import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { getNotifications, markAsRead, deleteNotification, sendContactEmail } from '../controllers/notificationsController';
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

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Route publique pour le contact (sans authentification)
router.post('/contact', (req: Request, res: Response) =>
  sendContactEmail(req, res)
);

// Appliquer l'authentification à toutes les routes suivantes
router.use(authenticateRequest as RequestHandler);

// Routes protégées
router.get('/', (req: Request, res: Response) =>
  getNotifications(req as AuthenticatedRequest, res)
);

router.put('/:id/read', (req: Request, res: Response) =>
  markAsRead(req as AuthenticatedRequest, res)
);

router.delete('/:id', (req: Request, res: Response) =>
  deleteNotification(req as AuthenticatedRequest, res)
);

export default router;
 