import { Request, Response } from 'express';
import { pool } from '../../services/db';
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

// Fonction pour extraire le CRA du nom de l'admin
const getCRAFromAdminName = (adminName: string): string | null => {
  if (adminName === 'ADMIN') return null; // Super admin voit tout
  const match = adminName.match(/Admin\s+(.+)/);
  return match ? match[1] : null;
};

const mapStatus = (status: string) => {
  console.log('Mapping DB status:', status); // Debug log
  const statusMap: { [key: string]: string } = {
    'en attente': 'pending',
    'validée': 'paid',
    'en cours': 'preparing',
    'livrée': 'completed',
    'rejetée': 'cancelled'
  };
  const mappedStatus = statusMap[status.toLowerCase()] || 'pending';
  console.log('Mapped to:', mappedStatus); // Debug log
  return mappedStatus;
};

const mapStatusToDb = (status: string) => {
  console.log('Mapping frontend status:', status); // Debug log
  const statusMap: { [key: string]: string } = {
    'pending': 'en attente',
    'paid': 'validée',
    'preparing': 'en cours',
    'completed': 'livrée',
    'cancelled': 'rejetée'
  };
  const mappedStatus = statusMap[status] || 'en attente';
  console.log('Mapped to:', mappedStatus); // Debug log
  return mappedStatus;
};

export const getAllServiceRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const cra = getCRAFromAdminName(req.user.nom);
        let queryString = `
            SELECT 
                d.id,
                d.service_id,
                s.nom as service_nom,
                s.cra as service_cra,
                d.description,
                d.statut,
                d.date_demande as created_at,
                u.nom as utilisateur_nom,
                u.email as utilisateur_email
            FROM demandes d
            JOIN services s ON d.service_id = s.id
            JOIN utilisateurs u ON d.utilisateur_id = u.id
        `;
        const params: any[] = [];

        // Si c'est un admin spécifique (pas le super admin), filtrer par CRA
        if (cra) {
            queryString += ' WHERE s.cra = ?';
            params.push(cra);
        }

        queryString += ' ORDER BY d.date_demande DESC';

        const [requests] = await pool.query(queryString, params);

        const requestsWithStatus = (requests as any[]).map(request => ({
            ...request,
            status: mapStatus(request.statut)
        }));

        res.json({
            status: 'success',
            data: requestsWithStatus
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes de services:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des demandes de services'
        });
    }
};

export const updateServiceRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            status: 'error',
            message: 'Le statut est requis'
        });
    }

    try {
        // Vérifier si l'admin a le droit de modifier cette demande
        const adminCRA = getCRAFromAdminName(req.user.nom);
        if (adminCRA) {
            const [demande] = await pool.query(
                'SELECT s.cra FROM demandes d JOIN services s ON d.service_id = s.id WHERE d.id = ?',
                [id]
            ) as any[];
            if (!demande || demande.cra !== adminCRA) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Vous n\'avez pas les droits pour modifier cette demande'
                });
            }
        }

        const dbStatus = mapStatusToDb(status);

        // Mise à jour du statut de la demande
        await pool.query(
            'UPDATE demandes SET statut = ? WHERE id = ?',
            [dbStatus, id]
        );

        // Récupération de l'email de l'utilisateur concerné
        const [demande] = await pool.query(
            `SELECT u.email 
             FROM demandes d 
             JOIN utilisateurs u ON d.utilisateur_id = u.id 
             WHERE d.id = ?`,
            [id]
        ) as any[];

        if (demande && demande.email) {
            await sendEmailNotification(
                [demande.email],
                'Mise à jour du statut de votre demande de service',
                `Le statut de votre demande de service à été mis à jour.
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
