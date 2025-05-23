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
        const requests = await query(`
            SELECT 
                d.id,
                d.service_id,
                s.nom as service_nom,
                d.description,
                d.statut,
                d.date_demande as created_at,
                u.nom as utilisateur_nom,
                u.email as utilisateur_email
            FROM demandes d
            JOIN services s ON d.service_id = s.id
            JOIN utilisateurs u ON d.utilisateur_id = u.id
            ORDER BY d.date_demande DESC
        `);

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
        const dbStatus = mapStatusToDb(status);

        // Mise à jour du statut de la demande
        await query(
            'UPDATE demandes SET statut = ? WHERE id = ?',
            [dbStatus, id]
        );

        // Récupération de l'email de l'utilisateur concerné
        const [demande]: any = await query(
            `SELECT u.email 
             FROM demandes d 
             JOIN utilisateurs u ON d.utilisateur_id = u.id 
             WHERE d.id = ?`,
            [id]
        );

        if (demande && demande.email) {
            await sendEmailNotification(
                [demande.email],
                'Mise à jour du statut de votre demande de service',
                `Le statut de votre commande ou demande de service est passé à : ${status}.`
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
