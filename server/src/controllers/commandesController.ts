import { Request, Response } from 'express';
import { query } from '../services/db';
import { sendEmailNotification } from '../controllers/notificationsController';

interface User {
  id: number;
  // Ajoutez d'autres propriétés de l'utilisateur si nécessaire
}

interface AuthenticatedRequest extends Request {
  user: User;
}

const mapStatus = (dbStatus: string) => {
  const statusMap: { [key: string]: string } = {
    'en_attente': 'pending',
    'payee': 'paid',
    'expediee': 'shipped',
    'annulee': 'cancelled'
  };
  return statusMap[dbStatus] || dbStatus;
};

export const createCommande = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { produit_id, quantite, prix_unitaire } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
              success: false, 
              message: 'Utilisateur non authentifié' 
            });
          }
          
        if (!produit_id || !quantite || !prix_unitaire) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis (produit_id, quantite, prix_unitaire)'
            });
        }

        const utilisateur_id = req.user.id;

        console.log("Création commande pour utilisateur_id:", utilisateur_id);
        console.log("Body reçu:", req.body);

        const result = await query(
            'INSERT INTO commandes (utilisateur_id, produit_id, quantite, prix_unitaire, statut) VALUES (?, ?, ?, ?, ?)',
            [utilisateur_id, produit_id, quantite, prix_unitaire, 'en_attente']
        );

        // 🔔 Envoi d'email aux admins après la commande
        const admins = await query('SELECT email FROM utilisateurs WHERE role = "admin"');
        const destinataires = (admins as any[]).map(admin => admin.email);

        await sendEmailNotification(
        destinataires,
        'Nouvelle commande en attente',
        `
            <p>Un utilisateur a soumis une nouvelle commande.</p>
            <p><strong>Produit ID :</strong> ${produit_id}</p>
            <p><strong>Quantité :</strong> ${quantite}</p>
            <p><strong>Prix unitaire :</strong> ${prix_unitaire}</p>
            <p><strong>Utilisateur ID :</strong> ${utilisateur_id}</p>
        `
        );

        res.status(201).json({ 
            success: true, 
            message: 'Commande créée avec succès',
            commande: {
                id: (result as any).insertId,
                utilisateur_id,
                produit_id,
                quantite,
                prix_unitaire,
                statut: 'en_attente'
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de la commande' 
        });
    }
};

export const getUserCommandes = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;

    try {
        const commandes = await query(`
            SELECT 
                c.id,
                c.produit_id,
                p.nom as produit_nom,
                c.quantite,
                c.prix_unitaire,
                c.statut,
                c.created_at as createdAt
            FROM commandes c
            JOIN produits p ON c.produit_id = p.id
            WHERE c.utilisateur_id = ?
            ORDER BY c.created_at DESC
        `, [userId]);

        const commandesWithStatus = (commandes as any[]).map(commande => ({
            ...commande,
            status: mapStatus(commande.statut)
        }));

        res.json({
            status: 'success',
            data: commandesWithStatus
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des commandes'
        });
    }
};

export const getCommande = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [commande] = await query(`
            SELECT 
                c.*,
                p.nom as produit_nom
            FROM commandes c
            JOIN produits p ON c.produit_id = p.id
            WHERE c.id = ? AND c.utilisateur_id = ?
        `, [id, userId]) as any[];

        if (!commande) {
            return res.status(404).json({
                status: 'error',
                message: 'Commande non trouvée'
            });
        }

        res.json({
            status: 'success',
            data: {
                ...commande,
                status: mapStatus(commande.statut)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération de la commande'
        });
    }
}; 