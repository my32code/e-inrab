import { Router, RequestHandler } from 'express';
import { Request, Response } from 'express';
import { findUserBySessionId } from '../models/User';
import { getAllCommandes, updateCommandeStatus } from '../controllers/admin/commandesController';
import { getAllServiceRequests, updateServiceRequestStatus } from '../controllers/admin/serviceRequestsController';
import { getAllProduits, updateProduitStock } from '../controllers/admin/produitsController';
import { getDocuments, uploadDocument, downloadDocument} from '../controllers/admin/documentsController';
import multer from 'multer';
import path from 'path';
import { generateFacture } from '../controllers/facturesController';

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
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const authenticateRequest = async (req: Request, res: Response, next: Function) => {
  const sessionId = req.headers.authorization?.split(' ')[1];
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const user = await findUserBySessionId(sessionId);
  if (!user || !user.id) {
    return res.status(401).json({ error: 'Session invalide' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  (req as AuthenticatedRequest).user = user as User;
  next();
};

// Middleware d'authentification pour toutes les routes admin
router.use(authenticateRequest as RequestHandler);

// Routes pour les commandes
router.get('/commandes', ((req: Request, res: Response) => getAllCommandes(req as AuthenticatedRequest, res)) as RequestHandler);
router.put('/commandes/:id/status', ((req: Request, res: Response) => updateCommandeStatus(req as AuthenticatedRequest, res)) as RequestHandler);

// Routes pour les produits et stocks
router.get('/produits', ((req: Request, res: Response) => getAllProduits(req as AuthenticatedRequest, res)) as RequestHandler);
router.put('/produits/:id/stock', ((req: Request, res: Response) => updateProduitStock(req as AuthenticatedRequest, res)) as RequestHandler);

// Routes pour les documents
router.get('/documents', ((req: Request, res: Response) => {
  console.log('Query params:', req.query); // Pour le débogage
  return getDocuments(req as AuthenticatedRequest, res);
}) as RequestHandler);
router.post('/documents/upload', upload.single('file'), ((req: Request, res: Response) => uploadDocument(req as AuthenticatedRequest, res)) as RequestHandler);
router.get('/documents/:id/download', ((req: Request, res: Response) => downloadDocument(req as AuthenticatedRequest, res)) as RequestHandler);

// Routes pour les demandes de services
router.get('/service-requests', ((req: Request, res: Response) => getAllServiceRequests(req as AuthenticatedRequest, res)) as RequestHandler);
router.put('/service-requests/:id/status', ((req: Request, res: Response) => updateServiceRequestStatus(req as AuthenticatedRequest, res)) as RequestHandler);

// Routes pour les factures
router.post('/factures/generate', ((req: Request, res: Response) => generateFacture(req as AuthenticatedRequest, res)) as RequestHandler);

export default router; 