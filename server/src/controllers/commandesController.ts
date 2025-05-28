import { Request, Response } from 'express';
import { query } from '../services/db';
import { sendEmailNotification } from '../controllers/notificationsController';
import { savePendingOrder, getUserPendingOrders, removePendingOrder } from '../services/pendingOrders';
import { v4 as uuidv4 } from 'uuid';

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

        // Récupérer le nom du produit
        const [produit] = await query(
            'SELECT nom FROM produits WHERE id = ?',
            [produit_id]
        ) as any[];

        if (!produit) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        // Créer une commande en attente
        const pendingOrder = {
            id: uuidv4(),
            utilisateur_id,
            produit_id,
            produit_nom: produit.nom,
            quantite,
            prix_unitaire,
            createdAt: new Date().toISOString()
        };

        await savePendingOrder(pendingOrder);

        // Envoyer la réponse immédiatement
        res.status(201).json({ 
            success: true, 
            message: 'Commande créée avec succès',
            commande: pendingOrder
        });

        // Envoyer l'email de manière asynchrone après la réponse
        try {
            const admins = await query('SELECT email FROM utilisateurs WHERE role = "admin"');
            const destinataires = (admins as any[]).map(admin => admin.email);

            await sendEmailNotification(
                destinataires,
                'Nouvelle commande en attente',
                `
                    <p>Un utilisateur a soumis une nouvelle commande.</p>
                    <p><strong>Produit :</strong> ${produit.nom}</p>
                    <p><strong>Quantité :</strong> ${quantite}</p>
                    <p><strong>Prix unitaire :</strong> ${prix_unitaire}</p>
                    <p><strong>Utilisateur ID :</strong> ${utilisateur_id}</p>
                `
            );
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // Ne pas propager l'erreur car la commande a déjà été créée
        }
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
        // Récupérer les commandes en attente
        const pendingOrders = await getUserPendingOrders(userId);

        // Récupérer les commandes en base de données
        const dbCommandes = await query(`
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

        // Combiner les commandes en attente et les commandes en base de données
        const allCommandes = [
            ...pendingOrders.map(order => ({
                ...order,
                status: 'pending'
            })),
            ...(dbCommandes as any[]).map(commande => ({
                ...commande,
                status: mapStatus(commande.statut)
            }))
        ];

        res.json({
            status: 'success',
            data: allCommandes
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

export const confirmCommande = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Récupérer la commande en attente
        const pendingOrders = await getUserPendingOrders(userId);
        const pendingOrder = pendingOrders.find(order => order.id === orderId);

        if (!pendingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Commande en attente non trouvée'
            });
        }

        // Insérer la commande en base de données
        const result = await query(
            'INSERT INTO commandes (utilisateur_id, produit_id, quantite, prix_unitaire, statut) VALUES (?, ?, ?, ?, ?)',
            [userId, pendingOrder.produit_id, pendingOrder.quantite, pendingOrder.prix_unitaire, 'payee']
        );

        // Supprimer la commande en attente
        await removePendingOrder(orderId);

        res.json({
            success: true,
            message: 'Commande confirmée avec succès',
            commande: {
                db_id: (result as any).insertId,
                ...pendingOrder,
                status: 'paid'
            }
        });
    } catch (error) {
        console.error('Erreur lors de la confirmation de la commande:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la confirmation de la commande'
        });
    }
}; 