import { Router, RequestHandler } from 'express';
import { createCommande, getUserCommandes, getCommande, transfererCommandeVersBDD, getCommandesAttente, deleteCommande } from '../controllers/commandesController';
import { Request, Response } from 'express';
import { findUserBySessionId } from '../models/User';
import fs from 'fs';
import { query } from '../services/db';
import path from 'path';

const COMMANDES_ATTENTE_PATH = path.resolve(__dirname, '../../data/commandes_attente.json');

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

// Récupérer les commandes en attente
router.get('/attente', ((req: Request, res: Response) => getCommandesAttente(req as AuthenticatedRequest, res)) as RequestHandler);

// Transférer une commande vers la BDD après paiement
router.post('/transferer', ((req: Request, res: Response) => {
    const { commandeId } = req.body;
    transfererCommandeVersBDD(commandeId)
        .then((newCommandeId) => {
            res.json({ 
                success: true, 
                message: 'Commande transférée avec succès',
                newCommandeId 
            });
        })
        .catch((error) => {
            console.error('Erreur lors du transfert de la commande:', error);
            res.status(500).json({ success: false, message: 'Erreur lors du transfert de la commande' });
        });
}) as RequestHandler);

// Récupérer toutes les commandes de l'utilisateur
router.get('/', ((req: Request, res: Response) => getUserCommandes(req as AuthenticatedRequest, res)) as RequestHandler);

// Récupérer une commande spécifique
router.get('/:id', ((req: Request, res: Response) => getCommande(req as AuthenticatedRequest, res)) as RequestHandler);

// Supprimer une commande
router.delete('/:id', ((req: Request, res: Response) => {
    const { id } = req.params;
    deleteCommande(id)
        .then(() => {
            res.json({ 
                success: true, 
                message: 'Commande supprimée avec succès'
            });
        })
        .catch((error) => {
            console.error('Erreur lors de la suppression de la commande:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la suppression de la commande' 
            });
        });
}) as RequestHandler);

router.get('/pending/:commandeId', (async (req: Request, res: Response) => {
    const { commandeId } = req.params;
    const localStorageData = req.query.localStorageData 
        ? JSON.parse(decodeURIComponent(req.query.localStorageData as string)) 
        : null;
    
    console.log('Recherche commande:', commandeId);
    console.log('Données localStorage:', localStorageData);

    try {
        // 1. Vérifier dans le fichier JSON
        try {
            const commandesFromFile = JSON.parse(fs.readFileSync(COMMANDES_ATTENTE_PATH, 'utf-8'));
            const commandeFromFile = commandesFromFile.find((c: any) => {
                return String(c.id) === String(commandeId);
            });

            if (commandeFromFile) {
                console.log('Commande trouvée dans le fichier');
                return res.json({ 
                    success: true,
                    source: 'file', 
                    data: commandeFromFile 
                });
            }
        } catch (fileError) {
            console.error('Erreur lecture fichier:', fileError);
        }

        // 2. Vérifier les données du localStorage si fournies
        if (localStorageData && String(localStorageData.id) === String(commandeId)) {
            console.log('Commande trouvée dans localStorage');
            return res.json({
                success: true,
                source: 'localStorage',
                data: localStorageData
            });
        }

        // 3. Vérifier dans la BDD
        try {
            const [commandeFromDB] = await query(
                'SELECT * FROM commandes WHERE id = ?',
                [commandeId]
            ) as any[];

            if (commandeFromDB) {
                console.log('Commande trouvée dans la BDD');
                return res.json({ 
                    success: true,
                    source: 'database', 
                    data: commandeFromDB 
                });
            }
        } catch (dbError) {
            console.error('Erreur BDD:', dbError);
        }

        // 4. Si non trouvé
        console.log('Commande non trouvée');
        return res.status(404).json({ 
            success: false,
            message: 'Commande introuvable' 
        });
    } catch (error) {
        console.error('Erreur globale:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
}) as RequestHandler);

export default router; 