import { Request, Response } from 'express';
import { query } from '../services/db';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
    user: User;
  }
  
export const createCommande = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { produit_id, quantite, prix_unitaire } = req.body;
        const utilisateur_id = req.user.id; // L'utilisateur est déjà authentifié

        const result = await query(
            'INSERT INTO commandes (utilisateur_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
            [utilisateur_id, produit_id, quantite, prix_unitaire]
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