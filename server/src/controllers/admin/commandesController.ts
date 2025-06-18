import { Request, Response } from 'express';
import { query, pool } from '../../services/db';
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

// Fonction pour extraire le CRA du nom de l'admin
const getCRAFromAdminName = (adminName: string): string | null => {
  if (adminName === 'ADMIN') return null; // Super admin voit tout
  const match = adminName.match(/Admin\s+(.+)/);
  return match ? match[1] : null;
};

export const getAllCommandes = async (req: AuthenticatedRequest, res: Response) => {
    try {
    const cra = getCRAFromAdminName(req.user.nom);
    let query = `
      SELECT c.*, p.nom as produit_nom, p.cra as produit_cra,
             u.nom as client_nom, u.email as client_email,
             DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM commandes c
      JOIN produits p ON c.produit_id = p.id
      JOIN utilisateurs u ON c.utilisateur_id = u.id
    `;
    const params: any[] = [];

    // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
    if (cra) {
      query += ' WHERE p.cra = ?';
      params.push(cra);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query(query, params);

        res.json({
            status: 'success',
      data: rows
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

  if (!['en_attente', 'en_cours', 'terminee', 'annulee'].includes(status)) {
        return res.status(400).json({
            status: 'error',
      message: 'Statut invalide'
        });
    }

    try {
    // Vérifier si l'admin a le droit de modifier cette commande
    const adminCRA = getCRAFromAdminName(req.user.nom);
    if (adminCRA) {
      const [commande] = await pool.query(
        'SELECT p.cra FROM commandes c JOIN produits p ON c.produit_id = p.id WHERE c.id = ?',
        [id]
      ) as any[];
      if (!commande || commande.cra !== adminCRA) {
        return res.status(403).json({
          status: 'error',
          message: 'Vous n\'avez pas les droits pour modifier cette commande'
        });
      }
    }

    const [result] = await pool.query(
      'UPDATE commandes SET status = ? WHERE id = ?',
      [status, id]
        );

    if ((result as any).affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Commande non trouvée'
            });
        }

        res.json({
            status: 'success',
      message: 'Statut de la commande mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour du statut'
        });
    }
};
 