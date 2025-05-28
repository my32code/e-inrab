import { Request, Response } from 'express';
import { query } from '../../services/db';
import { sendEmailNotification } from './notificationsController';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

const mapStatus = (dbStatus: string) => {
  console.log('Mapping DB status:', dbStatus); // Debug log
  const statusMap: { [key: string]: string } = {
    'en_attente': 'pending',
    'payee': 'paid',
    'expediee': 'shipped',
    'annulee': 'cancelled'
  };
  const mappedStatus = statusMap[dbStatus.toLowerCase()] || 'pending';
  console.log('Mapped to:', mappedStatus); // Debug log
  return mappedStatus;
};

const mapStatusToDb = (frontendStatus: string) => {
  console.log('Mapping frontend status:', frontendStatus); // Debug log
  const statusMap: { [key: string]: string } = {
    'pending': 'en_attente',
    'paid': 'payee',
    'shipped': 'expediee',
    'cancelled': 'annulee'
  };
  const mappedStatus = statusMap[frontendStatus] || 'en_attente';
  console.log('Mapped to:', mappedStatus); // Debug log
  return mappedStatus;
};

export const getAllCommandes = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const commandes = await query(`
            SELECT 
                c.id,
                c.produit_id,
                p.nom as produit_nom,
                c.quantite,
                c.prix_unitaire,
                c.statut,
                c.created_at as createdAt,
                u.nom as utilisateur_nom,
                u.email as utilisateur_email
            FROM commandes c
            JOIN produits p ON c.produit_id = p.id
            JOIN utilisateurs u ON c.utilisateur_id = u.id
            ORDER BY c.created_at DESC
        `);

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

export const updateCommandeStatus = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            status: 'error',
            message: 'Le statut est requis'
        });
    }

    try {
        const dbStatus = mapStatusToDb(status);

        // Récupérer les informations de la commande avant la mise à jour
        const [commande]: any = await query(
            `SELECT c.*, u.email, u.telephone, p.stock 
             FROM commandes c 
             JOIN utilisateurs u ON c.utilisateur_id = u.id 
             JOIN produits p ON c.produit_id = p.id
             WHERE c.id = ?`,
            [id]
        );

        if (!commande) {
            return res.status(404).json({
                status: 'error',
                message: 'Commande non trouvée'
            });
        }

        // Si le statut passe à "expediee", mettre à jour le stock
        if (status === 'shipped') {
            const nouveauStock = commande.stock - commande.quantite;
            
            if (nouveauStock < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Stock insuffisant pour expédier la commande'
                });
            }

            // Mettre à jour le stock du produit
            await query(
                'UPDATE produits SET stock = ? WHERE id = ?',
                [nouveauStock, commande.produit_id]
            );
        }

        // Mise à jour du statut dans la base de données
        await query(
            'UPDATE commandes SET statut = ? WHERE id = ?',
            [dbStatus, id]
        );

        // Envoyer l'email de notification
        if (commande.email) {
            await sendEmailNotification(
                [commande.email],
                'Mise à jour du statut de votre commande',
                `Le statut de votre commande à été mis à jour.
                Pour toute question, vous pouvez nous contacter au +229 64 28 37 02.`
            );
        }

        res.json({
            status: 'success',
            message: 'Statut mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour du statut'
        });
    }
};
 