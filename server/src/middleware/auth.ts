import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const [rows] = await pool.query(
      'SELECT u.* FROM utilisateurs u JOIN sessions s ON u.id = s.utilisateur_id WHERE s.id = ?',
      [sessionId]
    );

    const users = rows as User[];
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    const user = users[0];
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
}; 