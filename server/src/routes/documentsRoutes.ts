import { Router, RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { findUserBySessionId } from '../models/User';
import { getUserDocuments, downloadDocument, uploadDocument } from '../controllers/documentsController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../uploads/documents');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware d'authentification
const authenticateRequest: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = req.headers.authorization?.split(' ')[1];
    
    if (!sessionId) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const user = await findUserBySessionId(sessionId);
    
    if (!user) {
      res.status(401).json({ error: 'Session invalide' });
      return;
    }

    // Attacher l'utilisateur à la requête
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Non authentifié' });
  }
};

// Route pour récupérer les documents de l'utilisateur
router.get('/user', authenticateRequest, (req: Request, res: Response) => {
  getUserDocuments(req as AuthenticatedRequest, res);
});

// Route pour télécharger un document
router.get('/download/:id', authenticateRequest, (req: Request, res: Response) => {
  downloadDocument(req as AuthenticatedRequest, res);
});

// Route pour uploader un document
router.post('/upload', authenticateRequest, upload.single('file'), (req: Request, res: Response) => {
  uploadDocument(req as AuthenticatedRequest, res);
});

export default router; 
 