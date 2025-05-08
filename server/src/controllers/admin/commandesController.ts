import { Request, Response } from 'express';
import { query } from '../../services/db';

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
  const statusMap: { [key: string]: string } = {
    'en_attente': 'pending',
    'payee': 'processing',
    'expediee': 'preparing',
    'annulee': 'rejected'
  };
  return statusMap[dbStatus] || dbStatus;
};

const mapStatusToDb = (frontendStatus: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'en_attente',
    'processing': 'payee',
    'preparing': 'expediee',
    'rejected': 'annulee'
  };
  return statusMap[frontendStatus] || frontendStatus;
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
        await query(
            'UPDATE commandes SET statut = ? WHERE id = ?',
            [dbStatus, id]
        );

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